import { useRef, useCallback } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import ProjectCard from "../../../components/project/ProjectCard";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/common/Pagination/Pagination";
import { AddIcon } from "../../../components/ui/SvgIcons";
import EmptyContent from "../../../components/common/Content/EmptyContent";
import ErrorContent from "../../../components/common/Content/ErrorContent";
import { ICONS, IMAGES } from "../../../assets/index";
import ProjectCardSkeleton from "../../../components/project/ProjectCardSkeleton";
import useIsMobile from "../../../hooks/useIsMobile";
import { useProjects } from "../../../hooks/queries/useProjects";
import { useProjectsInfinite } from "../../../hooks/queries/useProjectsInfinite";

const PAGE_SIZE = 10;

export default function Projects() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
   const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const offset = (currentPage - 1) * PAGE_SIZE;


const { data: desktopData, isLoading: desktopLoading, isError: desktopError } = 
  useProjects(PAGE_SIZE, offset, undefined, { enabled: !isMobile });

const { data: infiniteData, isLoading: mobileLoading, isError: mobileError, fetchNextPage, hasNextPage, isFetchingNextPage } = 
  useProjectsInfinite({ enabled: isMobile });

  const isLoading = isMobile ? mobileLoading : desktopLoading;
  const isError = isMobile ? mobileError : desktopError;

  const projects = isMobile
    ? (infiniteData?.pages.flatMap((p) => p.data) ?? [])
    : (desktopData?.data ?? []);

  const totalItems = isMobile
    ? (infiniteData?.pages[0]?.total ?? 0)
    : (desktopData?.total ?? 0);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const hasMore = currentPage < totalPages;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );


  const handlePreviousPage = () =>
    setSearchParams({ page: String(Math.max(1, currentPage - 1)) });
  const handleNextPage = () =>
    setSearchParams({ page: String(hasMore ? currentPage + 1 : currentPage) });
  const handlePageClick = (page: number) =>
    setSearchParams({ page: String(page) });
  const getVisiblePages = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
      {!isError && (projects.length !== 0 || isLoading) && (
        <div className="grid grid-cols-12 items-center mt-4">
          <div className="col-span-12 md:col-span-10">
            <h2 className="text-[#041B3C] text-[30px] font-semibold">Projects</h2>
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
          const isLast = isMobile && index === projects.length - 1;
          return (
            <div key={project.id} ref={isLast ? lastElementRef : null}>
              <ProjectCard
                title={project.name}
                description={project.description}
                createdAt={project.created_at}
                projectId={project.id}
                to={`/dashboard/project/${project.id}/epics`}
              />
            </div>
          );
        })}

        {!isLoading && projects.length > 0 && (
          <>
            <ProjectCard
              className="hidden sm:flex"
              variant="add"
              onClick={() => navigate("/dashboard/project/add")}
            />
            <div className="sm:hidden flex justify-end">
              <div
                onClick={() => navigate("/dashboard/project/add")}
                style={{
                  marginBottom: "80px",
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
                }}
                className="w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                <AddIcon />
              </div>
            </div>
          </>
        )}

        {(isLoading || isFetchingNextPage) &&
          Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <ProjectCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {!isMobile && !isLoading && projects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          hasMore={hasMore}
          itemsShown={projects.length}
          label="projects"
          getVisiblePages={getVisiblePages}
          handlePreviousPage={handlePreviousPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}

      {isError && (
        <ErrorContent
          title="Something went wrong"
          description="We're having trouble retrieving your projects right now. Please try again in a moment."
          icon={<img src={ICONS.error} alt="error" className="w-6 h-6" />}
        >
          <Button onClick={() => window.location.reload()}>Retry connection</Button>
        </ErrorContent>
      )}

      {!isLoading && projects.length === 0 && !isError && (
        <EmptyContent
          image={IMAGES.projectEmpty}
          title="No Projects"
          description="You don't have any projects yet. Start by defining your first architectural workspace to begin tracking tasks and epics."
        >
          <Button
            className="flex items-center gap-2 justify-center align-middle"
            onClick={() => navigate("/dashboard/project/add")}
          >
            <AddIcon />
            Create New Project
          </Button>
        </EmptyContent>
      )}
    </div>
  );
}