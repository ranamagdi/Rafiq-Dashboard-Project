import { useState } from "react";
import EpicCard from "../../../components/epic/EpicCard";
import type { ApiResponse } from "../../../types/apiTypes";
import Button from "../../../components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import { AddIcon, EmptyEpicContent } from "../../../components/ui/SvgIcons";
import { usePagination } from "../../../hooks/usePagination";
import Pagination from "../../../components/common/Pagination/Pagination";
import EmptyContent from "../../../components/common/Content/EmptyContent";
import ErrorContent from "../../../components/common/Content/ErrorContent";
import { IMAGES, ICONS } from "../../../assets/index";
import { getProjectEpics } from "../../../services/endpoints";
import EpicCardSkeleton from "../../../components/epic/EpicCardSkelton";
import useIsMobile from "../../../hooks/useIsMobile";
import Input from "../../../components/ui/Input";
import EpicDetailsPopup from "../../../components/epic/EpicDetailsPopup";
import Breadcrumb from "../../../components/common/Breadcramb/Breadcrumb";
export default function Epics() {
  type Epic = {
    id: string;
    title: string;
    project_id: string;
    epic_id: string;
    deadline?: string;
    assignee: { name: string };
    created_by: { name: string };
    created_at: string;
    description?: string;
  };
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);

  const navigate = useNavigate();
  const { projectId } = useParams();
  const isMobile = useIsMobile();

  const {
    items: epics,
    loading,
    error,
    goToPage,
    isOutOfRange,
    currentPage,
    totalItems,
    hasMore,
    isInvalidPage,
    handlePreviousPage,
    handleNextPage,
    handlePageClick,
    getVisiblePages,
    lastElementRef,
    searchTerm,
    setSearchTerm,
    setItems: setEpics,
  } = usePagination<Epic>({
    fetchFn: async (limit, offset, searchTerm) => {
      const res = await getProjectEpics(projectId!, limit, offset, searchTerm);
      const contentRange = res.headers?.get?.("content-range") ?? null;
      const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 0;
      const data: Epic[] = Array.isArray(res)
        ? (res as Epic[])
        : ((res as ApiResponse<Epic[]>)?.data ?? []);
      return { data, total };
    },
  });
  const handleDeleteEpic = (id: string) => {
    setEpics((prev) => prev.filter((epic) => epic.id !== id));
  };

  const handleClosePopup = () => {
    setSelectedEpic(null);
    goToPage(1);
  };
  if (isInvalidPage || isOutOfRange) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
        <EmptyContent
          className="bg-white border border-[#FFFFFF66] backdrop-blur-xs rounded-4xl"
          image={IMAGES.EpicEmpty}
          title="No epics in this project yet."
          description="Break down your large project into manageable
          epics to track progress better and maintain
          architectural clarity."
        >
          <Button
            className="flex items-center gap-2 justify-center align-middle"
            onClick={() => goToPage(1)}
          >
            Go to Page 1
          </Button>
          <div className="flex justify-between align-middle items-center mt-10 w-[70%]">
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <EmptyEpicContent />
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                High-Level Goals
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Define the broad objectives that span across multiple cycles.
              </p>
            </div>
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <EmptyEpicContent variant="second" />
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                Hierarchy Design
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Link individual tasks to parent epics for a consolidated view.
              </p>
            </div>
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <EmptyEpicContent variant="third" />
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                Track Velocity
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Visualize percentage completion at a macro project level.
              </p>
            </div>
          </div>
        </EmptyContent>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
      {!error && (epics.length !== 0 || loading) && (
        <>
          <Breadcrumb />
          <>
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-12 md:col-span-8">
                <h2 className="text-[#041B3C] text-[30px] font-semibold hidden sm:block">
                  Project Epics
                </h2>
              </div>
              <div className="col-span-12 md:col-span-4 flex">
                <div className="w-full mt-4 sm:mt-0">
                  <Input
                    placeholder="Search epics..."
                    iconPosition="left"
                    className="h-12 w-full sm:h-10 "
                    icon={ICONS.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="hidden sm:flex items-center ml-2">
                  <Button
                    onClick={() =>
                      navigate(`/dashboard/project/${projectId}/epic/add`)
                    }
                    className="flex items-center gap-2 whitespace-nowrap mt-1"
                  >
                    <AddIcon />
                    New Epic
                  </Button>
                </div>
              </div>
            </div>
          </>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
        {epics.map((epic, index) => {
          const isLastElement = isMobile && epics.length === index + 1;
          return (
            <div key={epic.id} ref={isLastElement ? lastElementRef : null}>
              <EpicCard
                id={epic.id}
                title={epic.title}
                createdAt={epic.created_at}
                projectId={epic.project_id}
                epicId={epic.epic_id}
                assigneeName={epic.assignee.name}
                createdBy={epic.created_by.name}
                deadline={epic.deadline}
                onDelete={handleDeleteEpic}
                onClick={() => setSelectedEpic(epic)}
              />
            </div>
          );
        })}
        {!loading && epics.length > 0 && (
          <>
            <div className="sm:hidden flex justify-end">
              <div
                onClick={() =>
                  navigate("/dashboard/project/" + projectId + "/epic/add")
                }
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
            <EpicCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {!isMobile && !loading && epics.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          hasMore={hasMore}
          itemsShown={epics.length}
          label="projects"
          getVisiblePages={getVisiblePages}
          handlePreviousPage={handlePreviousPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}
      {!loading && epics.length === 0 && !error && (
         <EmptyContent
          className="bg-white border border-[#FFFFFF66] backdrop-blur-xs rounded-4xl"
          image={IMAGES.EpicEmpty}
          title="No epics in this project yet."
          description="Break down your large project into manageable
          epics to track progress better and maintain
          architectural clarity."
        >
          <Button
            className="flex items-center gap-2 justify-center align-middle"
            onClick={() => goToPage(1)}
          >
            Go to Page 1
          </Button>
          <div className="flex  flex-wrap gap-3 justify-between align-middle items-center mt-10 mb-9 sm:mb-0 w-[70%]">
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <EmptyEpicContent />
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                High-Level Goals
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Define the broad objectives that span across multiple cycles.
              </p>
            </div>
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <EmptyEpicContent variant="second" />
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                Hierarchy Design
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Link individual tasks to parent epics for a consolidated view.
              </p>
            </div>
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <EmptyEpicContent variant="third" />
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                Track Velocity
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Visualize percentage completion at a macro project level.
              </p>
            </div>
          </div>
        </EmptyContent>
      )}
      {error && (
        <ErrorContent
          title="Something went wrong"
          icon={<img src={ICONS.error} alt="error" className="w-6 h-6" />}
          description="We're having trouble retrieving your
            project epics right now. Please try
            again in a moment."
        >
          <Button onClick={() => window.location.reload()}>
            Retry connection
          </Button>
        </ErrorContent>
      )}

      {selectedEpic && (
        <EpicDetailsPopup
          id={selectedEpic?.id}
          epicId={selectedEpic.epic_id}
          projectId={projectId}
          title={selectedEpic?.title}
          description={selectedEpic?.description}
          assigneeName={selectedEpic?.assignee.name}
          createdBy={selectedEpic?.created_by.name}
          deadline={selectedEpic?.deadline}
          isOpen={true}
          onAddTask={() =>
            navigate(
              `/dashboard/project/${projectId}/${selectedEpic.id}/tasks/new`,
            )
          }
          onClose={() => handleClosePopup()}
        />
      )}
    </div>
  );
}
