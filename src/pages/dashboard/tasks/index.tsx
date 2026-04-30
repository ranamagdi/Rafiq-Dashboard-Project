import { useParams, useSearchParams } from "react-router-dom";
import BoardView from "../../../components/tasks/BoardViewTasks";
import ListView from "../../../components/tasks/ListViewTasks";
import { MobileViewTask } from "../../../components/tasks/MobileViewTask";
import Breadcrumb from "../../../components/common/Breadcramb/Breadcrumb";
import { getProjectTasks } from "../../../services/endpoints";
import type { Task, StatusVariant } from "../../../types/apiTypes";
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
const STATUSES: StatusVariant[] = [
  "TO_DO",
  "IN_PROGRESS",
  "DONE",
  "BLOCKED",
  "IN_REVIEW",
  "READY_FOR_QA",
  "REOPENED",
  "READY_FOR_PRODUCTION",
];

const EMPTY_TASKS: Record<StatusVariant, Task[]> = {
  TO_DO: [],
  IN_PROGRESS: [],
  DONE: [],
  BLOCKED: [],
  IN_REVIEW: [],
  READY_FOR_QA: [],
  REOPENED: [],
  READY_FOR_PRODUCTION: [],
};

export default function Tasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectTitle } = useAppSelector((s) => s.project);
  const isMobile = useIsMobile();

  const view = (searchParams.get("view") as "board" | "list") || "board";
  const [tasks, setTasks] =
    useState<Record<StatusVariant, Task[]>>(EMPTY_TASKS);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<{
    taskId: string;
    projectId: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    lastElementRef,
    isOutOfRange,
  } = usePagination<Task>({
    fetchFn: async (limit, offset) => {
      const res = await getProjectTasks(
        projectId as string,
        undefined,
        limit,
        offset,
      );

      const contentRange = res.headers.get("content-range");
      const total = contentRange
        ? parseInt(contentRange.split("/")[1], 10)
        : (res.data?.length ?? 0);

      return {
        data: res.data ?? [],
        total,
      };
    },
  });
  useEffect(() => {
    const fetchTasks = async () => {
      if (view !== "board" || isMobile) return;

      setLoading(true);
      try {
        const results = await Promise.all(
          STATUSES.map((status) =>
            getProjectTasks(projectId as string, status),
          ),
        );

        const grouped: Record<StatusVariant, Task[]> = {
          TO_DO: [],
          IN_PROGRESS: [],
          DONE: [],
          BLOCKED: [],
          IN_REVIEW: [],
          READY_FOR_QA: [],
          REOPENED: [],
          READY_FOR_PRODUCTION: [],
        };

        STATUSES.forEach((status, index) => {
          const data = results[index]?.data;
          grouped[status] = Array.isArray(data) ? data : [];
        });

        setTasks(grouped);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, view, isMobile]);
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);

        if (!params.get("page")) {
          params.set("page", "1");
        }

        return params;
      },
      { replace: true },
    );
  }, [setSearchParams]);
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
      params.set("page", "1");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <Breadcrumb />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:items-center">
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
                  src={
                    view === "board" ? ICONS.boardViewIcon : ICONS.listViewIcon
                  }
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
                    className={`grid grid-flow-col auto-cols-max items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      view === "board" ? "bg-gray-100" : ""
                    }`}
                  >
                    <img src={ICONS.boardViewIcon} className="w-4 h-4" />
                    Board View
                  </div>

                  <div
                    onClick={() => handleViewChange("list")}
                    className={`grid grid-flow-col auto-cols-max items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      view === "list" ? "bg-gray-100" : ""
                    }`}
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

      {isMobileView ? (
        <div className="space-y-2">
          {paginatedTasks.map((task, index) => {
            const isLast = paginatedTasks.length === index + 1;
            return (
              <div key={task.id} ref={isLast ? lastElementRef : null}>
                <MobileViewTask
                  task={task}
                  onClick={(taskId, projectId) =>
                    setSelectedTask({ taskId, projectId })
                  }
                />
              </div>
            );
          })}
        </div>
      ) : isBoard ? (
        <BoardView tasks={tasks} projectId={projectId!} loading={loading} />
      ) : (
        <>
          <ListView
            tasks={paginatedTasks}
            loading={listLoading}
            error={listError}
            onRowClick={(taskId, projectId) =>
              setSelectedTask({ taskId, projectId })
            }
            pagination={
              !listLoading && paginatedTasks.length > 0 ? (
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
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
      {selectedTask && (
        <DetailsTask
          taskId={selectedTask.taskId}
          projectId={selectedTask.projectId}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
