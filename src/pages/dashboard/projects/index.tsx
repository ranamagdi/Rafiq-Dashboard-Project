import { useEffect, useState, useRef, useCallback } from "react";
import ProjectCard from "../../../components/project/ProjectCard";
import type { ApiResponse } from "../../../types/apiTypes";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import {AddIcon,NextPage,PreviousPage} from '../../../components/ui/SvgIcons'
import EmptyContent from "../../../components/common/Content/EmptyContent";
import ErrorContent from "../../../components/common/Content/ErrorContent";
import { ICONS, IMAGES } from "../../../assets/index";
import { getProjects } from "../../../services/endpoints";
import ProjectCardSkeleton from "../../../components/project/ProjectCardSkeleton";
import useIsMobile from "../../../hooks/useIsMobile";

export default function Projects() {
  type Project = {
    id: string;
    name: string;
    description: string;
    created_at: string;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const isMobile = useIsMobile();
  const limit = 10;
  const [totalProjects, setTotalProjects] = useState(0);

  const fetchProjects = useCallback(
    async (pageNum: number, shouldAppend: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const offset = (pageNum - 1) * limit;
        const res = await getProjects(limit, offset);
        const contentRange = res.headers.get("content-range");

        const total = contentRange
          ? parseInt(contentRange.split("/")[1], 10)
          : 0;

        const data: Project[] = Array.isArray(res)
          ? res
          : ((res as ApiResponse<Project[]>)?.data ?? []);

        setHasMore(offset + data.length < total);

        if (shouldAppend) {
          setProjects((prev) => [...prev, ...data]);
          setTotalProjects((prev) => prev + data.length);
        } else {
          setProjects(data);
          setTotalProjects(total);
        }
      } catch (err: unknown) {
        setError(
          new Error((err as Error)?.message || "Failed to load projects"),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

const prevIsMobileRef = useRef(isMobile);

useEffect(() => {
  if (isMobile) return;


  if (prevIsMobileRef.current === true) {
    prevIsMobileRef.current = false;
    return;
  }

  prevIsMobileRef.current = false;
  fetchProjects(page, false);
}, [page, fetchProjects, isMobile]);
  const hasFetched = useRef(false);
  
  useEffect(() => {
    
    if (isMobile) {
    if (hasFetched.current) return;
    hasFetched.current = true;
      setProjects([]);
      setTotalProjects(0);
      setPage(1);
      setHasMore(true);
      fetchProjects(1, false);
    }
  }, [isMobile, fetchProjects]);

  const lastProjectElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (!isMobile || loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProjects(nextPage, true);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isMobile, loading, hasMore, page, fetchProjects],
  );

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const getVisiblePages = () => {
    const pages = [];

    if (page > 1) pages.push(page - 1);
    pages.push(page);
    if (hasMore) pages.push(page + 1);

    return pages;
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
      {!error && (projects.length !== 0 || loading) && (
        <div className="grid grid-cols-12 items-center mt-4">
          <div className="col-span-12 md:col-span-10">
            <h2 className="text-[#041B3C] text-[30px] font-semibold">
              Projects
            </h2>
            <p className="text-[#434654] text-[14px] font-normal">
              Manage and curate your projects
            </p>
          </div>
          <div className="col-span-12 md:col-span-2 justify-end hidden sm:flex">
            <Button onClick={() => navigate("/dashboard/project/add")}>
              Create New Project
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => {
          const isLastElement = isMobile && projects.length === index + 1;
          return (
            <div
              key={project.id}
              ref={isLastElement ? lastProjectElementRef : null}
            >
              <ProjectCard
                title={project.name}
                description={project.description}
                createdAt={project.created_at}
                projectId={project.id}
                onClick={() =>
                  navigate(`/dashboard/project/${project.id}/epics`)
                }
              />
            </div>
          );
        })}
        { !loading &&projects.length>0 && (
          <><ProjectCard
            className="hidden sm:flex"
            variant="add"
            onClick={() => navigate("/dashboard/project/add")} />
            <div className="sm:hidden flex justify-end">
              <div
                onClick={() => navigate("/dashboard/project/add")}
                style={{
                  marginBottom: "80px",
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
                }}
                className="w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                <AddIcon/>
              </div>
            </div></>
          )}
        {loading &&
          Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <ProjectCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {!isMobile && !loading && projects.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-(--color-forms-texts) text-[12px] font-medium">
            Showing {projects.length} of {totalProjects} active projects
          </p>
          <div className="flex justify-center items-center gap-4 py-8">
            <Button
              disabled={page === 1}
              onClick={handlePreviousPage}
              className="bg-transparent border border-solid border-[#C3C6D6] border-opacity-30 px-3 h-8"
            >
             <PreviousPage/>
            </Button>
            <div className="flex items-center gap-2">
              {getVisiblePages().map((p, i) => (
                <span
                  key={i}
                  className={`h-8 w-8 rounded-sm text-sm font-semibold flex items-center justify-center
                    ${
                      p === page
                        ? "text-white bg-(--color-primary-container)"
                        : "text-gray-700"
                    }`}
                >
                  {p}
                </span>
              ))}

              {hasMore && (
                <span className="text-gray-700 font-medium text-sm">...</span>
              )}
            </div>

            <Button
              disabled={!hasMore}
              onClick={handleNextPage}
              className="bg-transparent border border-solid border-[#C3C6D6] border-opacity-30 px-3 h-8"
            >
             <NextPage/>
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-center py-4">
        {isMobile &&
          loading &&
          projects.length > 0 &&
          Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <ProjectCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {error && (
        <ErrorContent title="Something went wrong" description="We're having trouble retrieving your
        projects right now. Please try
        again in a moment." 
         icon={<img src={ICONS.error} alt="error" className="w-6 h-6" />}>
          <Button onClick={() => window.location.reload()}>Retry connection</Button>
        </ErrorContent>
      )}

      {!loading && projects.length === 0 && !error && (
        <EmptyContent
          image={IMAGES.projectEmpty}
          title="No Projects"
          description="No Projects
          You don’t have any projects yet. Start by defining
          your first architectural workspace to begin tracking
          tasks and epics.
          Create New Project"
        >
          <Button
            className="flex items-center gap-2 justify-center align-middle"
            onClick={() => navigate("/dashboard/project/add")}
          >
            <AddIcon/>
            Create New Project
          </Button>
        </EmptyContent>
      
      )}
    </div>
  );
}
