import { useNavigate, useSearchParams } from "react-router-dom";
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
import type { ApiResponse } from "../../../types/apiTypes";
import type { Project } from "../../../types/apiTypes";

const PAGE_SIZE = 10;


function parseTotalFromResponse(res: unknown): number {
  if (res && typeof res === "object" && "headers" in res) {
    const headers = (res as { headers?: Headers }).headers;
    const contentRange = headers?.get?.("content-range") ?? null;
    if (contentRange) return parseInt(contentRange.split("/")[1], 10);
  }
  return 0;
}


function parseProjectsFromResponse(res: unknown): Project[] {
  if (Array.isArray(res)) return res as Project[];
  if (res && typeof res === "object" && "data" in res) {
    return ((res as ApiResponse<Project[]>).data) ?? [];
  }
  return [];
}

export default function Projects() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Sync current page with URL so browser back/forward works
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? 1));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const goToPage = (page: number) =>
    setSearchParams({ page: String(page) });

  const { data: res, isLoading, isError, isFetching } = useProjects(PAGE_SIZE, offset);

  const projects = parseProjectsFromResponse(res);
  const totalItems = parseTotalFromResponse(res);
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  // Guard: page out of range (only after a successful fetch)
  const isOutOfRange = !isLoading && !isError && totalItems > 0 && currentPage > totalPages;

  if (isOutOfRange) {
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

  // Derive visible page numbers for your existing Pagination component
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
      {!isError && (projects.length !== 0 || isLoading) && (
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

      {/* Subtle dimming while fetching next page (placeholderData keeps old items visible) */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${
          isFetching && !isLoading ? "opacity-60" : "opacity-100"
        }`}
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.name}
            description={project.description}
            createdAt={project.created_at}
            projectId={project.id}
            to={`/dashboard/project/${project.id}/epics`}
          />
        ))}

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

        {isLoading &&
          Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <ProjectCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

   
      {!isMobile && !isLoading && projects.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          hasMore={currentPage < totalPages}
          itemsShown={projects.length}
          label="projects"
          getVisiblePages={getVisiblePages}
          handlePreviousPage={() => goToPage(currentPage - 1)}
          handleNextPage={() => goToPage(currentPage + 1)}
          handlePageClick={goToPage}
        />
      )}

      {isError && (
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