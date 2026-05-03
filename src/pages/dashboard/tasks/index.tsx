import { useParams, useSearchParams } from "react-router-dom";
import BoardView from "../../../components/tasks/BoardViewTasks";
import ListView from "../../../components/tasks/ListViewTasks";
import { MobileViewTask } from "../../../components/tasks/MobileViewTask";
import Breadcrumb from "../../../components/common/Breadcramb/Breadcrumb";
import { getProjectTasks } from "../../../services/endpoints";
import type { Task } from "../../../types/apiTypes";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { usePagination } from "../../../hooks/usePagination";
import { useNavigate } from "react-router-dom";
import { ICONS } from "../../../assets/index";
import DetailsTask from "../../../components/tasks/DetailsTaskPopup";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { PlusIcon } from "../../../components/ui/SvgIcons";
import { useState, useEffect } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import Pagination from "../../../components/common/Pagination/Pagination";

export default function Tasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectTitle } = useAppSelector((s) => s.project);
  const isMobile = useIsMobile();

  const view = (searchParams.get("view") as "board" | "list") || "board";
  const taskIdFromUrl = searchParams.get("taskId");
  const selectedTask = taskIdFromUrl
    ? { taskId: taskIdFromUrl, projectId: projectId! }
    : null;

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Mobile — infinite scroll (no root needed, page is the scroll container)
  const { items: mobileTasks, lastElementRef } = usePagination<Task>({
    mode: "infinite",
    fetchFn: async (limit, offset) => {
      const res = await getProjectTasks(projectId as string, undefined, limit, offset);
      const contentRange = res.headers.get("content-range");
      const total = contentRange
        ? parseInt(contentRange.split("/")[1], 10)
        : (res.data?.length ?? 0);
      return { data: res.data ?? [], total };
    },
  });

  function openTask(taskId: string) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("taskId", taskId);
      return params;
    });
  }

  function closeTask() {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("taskId");
      return params;
    });
  }

  // Desktop list — paginated
  const {
    items: paginatedTasks,
    loading: listLoading,
    error: listError,
    currentPage,
    totalItems,
    hasMore,
    isInvalidPage,
    handlePreviousPage,
    handleNextPage,
    handlePageClick,
    getVisiblePages,
    isOutOfRange,
  } = usePagination<Task>({
    fetchFn: async (limit, offset) => {
      const res = await getProjectTasks(projectId as string, undefined, limit, offset);
      const contentRange = res.headers.get("content-range");
      const total = contentRange
        ? parseInt(contentRange.split("/")[1], 10)
        : (res.data?.length ?? 0);
      return { data: res.data ?? [], total };
    },
  });

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (view === "list" && !params.get("page")) params.set("page", "1");
        if (view === "board") params.delete("page");
        return params;
      },
      { replace: true },
    );
  }, [setSearchParams, view]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (!params.get("view")) {
      params.set("view", "board");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function handleViewChange(newView: "board" | "list") {
    setDropdownOpen(false);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("view", newView);
      if (newView === "list") params.set("page", "1");
      else params.delete("page");
      return params;
    });
  }

  function goToCreateTask() {
    navigate(`/dashboard/project/${projectId}/tasks/new`);
  }

  const isBoard = view === "board" && !isMobile;
  const isMobileView = isMobile;

  if (!isMobile && view === "list" && (isInvalidPage || isOutOfRange)) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Invalid page</p>
        <Button onClick={() => handlePageClick(1)}>Go to Page 1</Button>
      </div>
    );
  }

  return (
    /*
      Board mode  → h-screen + overflow-hidden: page is locked, zero page scroll.
                    flex-col so breadcrumb + header take their natural height,
                    board fills everything below via flex-1.
      List/mobile → original layout, page scrolls naturally.
    */
    <div
      className={
        isBoard
          ? "flex flex-col h-screen overflow-hidden px-4 sm:px-6 lg:px-8 pb-4"
          : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-25 sm:mb-0"
      }
    >
      <Breadcrumb />

      {/* Header row — flex-shrink-0 keeps it at fixed height in board mode */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:items-center flex-shrink-0">
        <div>
          <h1 className="text-[28px] font-semibold mt-2 text-[#041B3C]">
            Active Workboard
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Curating Project {projectTitle} production pipeline and milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3">
          <Input
            placeholder="Search tasks..."
            iconPosition="left"
            className="h-12 w-full sm:h-10"
            icon={ICONS.search}
          />

          <Button className="md:hidden gap-2" onClick={goToCreateTask}>
            <PlusIcon />
            Create New Task
          </Button>

          <div className="hidden sm:grid grid-flow-col auto-cols-max items-center gap-3 justify-end">
            <div className="relative">
              <Button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="grid grid-flow-col auto-cols-max items-center gap-2 px-3 h-10 rounded-lg bg-white text-[#041B3C] text-sm font-medium"
              >
                <img
                  src={view === "board" ? ICONS.boardViewIcon : ICONS.listViewIcon}
                  className="w-4 h-4"
                />
                <span className="text-[14px]">
                  {view === "board" ? "Board View" : "List View"}
                </span>
                <svg
                  className={`w-4 h-4 ml-1 transition ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md z-50">
                  <div
                    onClick={() => handleViewChange("board")}
                    className={`grid grid-flow-col auto-cols-max items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${view === "board" ? "bg-gray-100" : ""}`}
                  >
                    <img src={ICONS.boardViewIcon} className="w-4 h-4" />
                    Board View
                  </div>
                  <div
                    onClick={() => handleViewChange("list")}
                    className={`grid grid-flow-col auto-cols-max items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${view === "list" ? "bg-gray-100" : ""}`}
                  >
                    <img src={ICONS.listViewIcon} className="w-4 h-4" />
                    List View
                  </div>
                </div>
              )}
            </div>

            <div className="h-10 w-17 place-items-center rounded-lg bg-(--color-surface-highest) grid">
              <img src={ICONS.menu} width={18} height={12} />
            </div>
          </div>
        </div>
      </div>

      {/*
        Board mode:  flex-1 + min-h-0 fills all space below the header.
                     overflow-hidden prevents any bleed outside this box.
                     BoardViewTasks gets h-full and handles the rest.
        List/mobile: plain unstyled div, page scrolls naturally.
      */}
      <div className={isBoard ? "flex-1 min-h-0 overflow-hidden" : ""}>
        {isMobileView ? (
          <div className="space-y-2">
            {mobileTasks.map((task, index) => {
              const isLast = mobileTasks.length === index + 1;
              return (
                <div key={task.id} ref={isLast ? lastElementRef : null}>
                  <MobileViewTask
                    task={task}
                    onClick={(taskId) => openTask(taskId)}
                  />
                </div>
              );
            })}
          </div>
        ) : isBoard ? (
          <BoardView
            projectId={projectId!}
            onTaskClick={(taskId) => openTask(taskId)}
          />
        ) : (
          <>
            <ListView
              tasks={paginatedTasks}
              loading={listLoading}
              error={listError?.message ?? null}
              onRowClick={(taskId) => openTask(taskId)}
              pagination={
                !isMobile && !listLoading && paginatedTasks.length > 0 ? (
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={10}
                    mode="compact"
                    hasMore={hasMore}
                    itemsShown={paginatedTasks.length}
                    label="tasks"
                    getVisiblePages={getVisiblePages}
                    handlePreviousPage={handlePreviousPage}
                    handleNextPage={handleNextPage}
                    handlePageClick={handlePageClick}
                  />
                ) : null
              }
            />
          </>
        )}
      </div>

      {selectedTask && (
        <DetailsTask
          taskId={selectedTask.taskId}
          projectId={selectedTask.projectId}
          onClose={closeTask}
        />
      )}
    </div>
  );
}