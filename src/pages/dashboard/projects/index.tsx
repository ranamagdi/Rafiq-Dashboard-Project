import { useEffect, useState, useRef, useCallback } from "react";
import ProjectCard from "../../../components/project/ProjectCard";
import type { ApiResponse } from "../../../types/apiTypes";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import EmptyContent from "../../../components/common/Content/EmptyContent";
import ErrorContent from "../../../components/common/Content/ErrorContent";
import { IMAGES } from "../../../assets/index";
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

        setHasMore(data.length === limit);

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

 const fetchProjectsRef = useRef(fetchProjects);

useEffect(() => {
  fetchProjectsRef.current = fetchProjects;
}, [fetchProjects]);


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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round" />
                </svg>
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
              <svg
                width="5"
                height="7"
                viewBox="0 0 5 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 7L0 3.5L3.5 0L4.31667 0.816667L1.63333 3.5L4.31667 6.18333L3.5 7Z"
                  fill="#434654"
                />
              </svg>
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
              <svg
                width="5"
                height="7"
                viewBox="0 0 5 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.68333 3.5L0 0.816667L0.816667 0L4.31667 3.5L0.816667 7L0 6.18333L2.68333 3.5Z"
                  fill="#434654"
                />
              </svg>
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
        <ErrorContent title="Error" description={error.message}>
          <Button onClick={() => window.location.reload()}>Retry</Button>
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 15H11V11H15V9H11V5H9V9H5V11H9V15ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
                fill="white"
              />
            </svg>
            Create New Project
          </Button>
        </EmptyContent>
      
      )}
    </div>
  );
}
