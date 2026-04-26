import { useNavigate } from "react-router-dom";
import ProjectCard from "../../../components/project/ProjectCard";
import type { ApiResponse } from "../../../types/apiTypes";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/common/Pagination/Pagination";
import { usePagination } from "../../../hooks/usePagination";
import { AddIcon } from "../../../components/ui/SvgIcons";
import EmptyContent from "../../../components/common/Content/EmptyContent";
import ErrorContent from "../../../components/common/Content/ErrorContent";
import { ICONS, IMAGES } from "../../../assets/index";
import { getProjects } from "../../../services/endpoints";
import ProjectCardSkeleton from "../../../components/project/ProjectCardSkeleton";
import useIsMobile from "../../../hooks/useIsMobile";

type Project = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export default function Projects() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const {
    items: projects,
    loading,
    error,
    currentPage,
    totalItems,
    hasMore,
    isInvalidPage,
    goToPage,
    handlePreviousPage,
    handleNextPage,
    handlePageClick,
    getVisiblePages,
    lastElementRef,
    isOutOfRange,
  } = usePagination<Project>({
    fetchFn: async (limit, offset) => {
      const res = await getProjects(limit, offset);
      const contentRange = res.headers?.get?.("content-range") ?? null;
      const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 0;
      const data: Project[] = Array.isArray(res)
        ? (res as Project[])
        : ((res as ApiResponse<Project[]>)?.data ?? []);
      return { data, total };
    },
  });

  // ─── Invalid page param → empty state ────────────────────────────────────
  if (isInvalidPage || isOutOfRange) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
        <EmptyContent
          image={IMAGES.projectEmpty}
          title="No Projects"
          description="You don't have any projects yet. Start by defining your first architectural workspace to begin tracking tasks and epics."
        >
          <Button onClick={() => goToPage(1)}>Go to Page 1</Button>
        </EmptyContent>
      </div>
    );
  }


  // ─── Render ───────────────────────────────────────────────────────────────
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
            <div key={project.id} ref={isLastElement ? lastElementRef : null}>
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

        {!loading && projects.length > 0 && (
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

        {loading &&
          Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <ProjectCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {!isMobile && !loading && projects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          hasMore={hasMore}
          itemsShown={projects.length}
          label="projects"
          getVisiblePages={getVisiblePages}
          handlePreviousPage={handlePreviousPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}

      {error && (
        <ErrorContent
          title="Something went wrong"
          description="We're having trouble retrieving your projects right now. Please try again in a moment."
          icon={<img src={ICONS.error} alt="error" className="w-6 h-6" />}
        >
          <Button onClick={() => window.location.reload()}>
            Retry connection
          </Button>
        </ErrorContent>
      )}

      {!loading && projects.length === 0 && !error && (
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
