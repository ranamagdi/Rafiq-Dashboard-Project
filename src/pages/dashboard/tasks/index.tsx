import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Select, { type SingleValue } from "react-select";
import {
  type ViewOption,
  VIEW_OPTIONS,
} from "../../../components/utils/constants";
import { ViewOptionLabel } from "../../../components/tasks/ViewOptionLabel";
import { viewSelectStyles } from "../../../components/tasks/CustomSelectViews";
import BoardView from "../../../components/tasks/BoardViewTasks";
import ListView from "../../../components/tasks/ListViewTasks";
import { MobileViewTask } from "../../../components/tasks/MobileViewTask";
import Breadcrumb from "../../../components/common/Breadcramb/Breadcrumb";
import DetailsTask from "../../../components/tasks/DetailsTaskPopup";
import Pagination from "../../../components/common/Pagination/Pagination";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { PlusIcon } from "../../../components/ui/SvgIcons";

import { getProjectTasks } from "../../../services/endpoints";
import { usePagination } from "../../../hooks/usePagination";
import { useAppSelector } from "../../../hooks/reduxHooks";
import useIsMobile from "../../../hooks/useIsMobile";

import { ICONS } from "../../../assets/index";
import type { Task } from "../../../types/apiTypes";

export default function Tasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectTitle } = useAppSelector((s) => s.project);
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");

  const view = (searchParams.get("view") as "board" | "list") || "board";
  const selectedViewOption =
    VIEW_OPTIONS.find((o) => o.value === view) ?? VIEW_OPTIONS[0];

  const taskIdFromUrl = searchParams.get("taskId");
  const selectedTask = taskIdFromUrl
    ? { taskId: taskIdFromUrl, projectId: projectId! }
    : null;

  const {
    items: mobileTasks,
    lastElementRef,
    setSearchTerm: setMobileSearch,
    loading: mobileLoading,
  } = usePagination<Task>({
    mode: "infinite",
    fetchFn: async (limit, offset, term) => {
      const res = await getProjectTasks(
        projectId!,
        undefined,
        limit,
        offset,
        term,
      );
      const total = parseInt(
        res.headers.get("content-range")?.split("/")[1] || "0",
        10,
      );
      return { data: res.data ?? [], total };
    },
  });

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
    setSearchTerm: setListSearch,
  } = usePagination<Task>({
    fetchFn: async (limit, offset, term) => {
      const res = await getProjectTasks(
        projectId!,
        undefined,
        limit,
        offset,
        term,
      );
      const total = parseInt(
        res.headers.get("content-range")?.split("/")[1] || "0",
        10,
      );
      return { data: res.data ?? [], total };
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (!params.get("view")) {
      params.set("view", "board");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!isMobile && view === "list" && !searchParams.get("page")) {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("page", "1");
          return p;
        },
        { replace: true },
      );
    }
  }, [view, isMobile, searchParams, setSearchParams]);

  // --- Handlers ---

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (isMobile) {
      setMobileSearch(value);
    } else {
      setListSearch(value);
    }
  };

  const handleViewChange = (option: SingleValue<ViewOption>) => {
    if (!option) return;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("view", option.value);
      if (option.value === "list") params.set("page", "1");
      else params.delete("page");
      return params;
    });
  };

  const openTask = (taskId: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("taskId", taskId);
      return params;
    });
  };
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  const closeTask = () => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("taskId");
      return params;
    });

    forceRefresh();
  };

  const isBoard = view === "board" && !isMobile;

  if (!isMobile && view === "list" && (isInvalidPage || isOutOfRange)) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Invalid page</p>
        <Button onClick={() => handlePageClick(1)}>Go to Page 1</Button>
      </div>
    );
  }

  return (
    <div
      className={
        isBoard
          ? "flex flex-col h-screen overflow-hidden px-4 sm:px-6 lg:px-8 pb-4"
          : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-25 sm:mb-0"
      }
    >
      <Breadcrumb />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:items-center shrink-0">
        <div>
          <h1 className="text-[28px] font-semibold mt-2 text-[#041B3C]">
            Active Workboard
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Curating Project {projectTitle} production pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3">
          <Input
            placeholder="Search tasks..."
            iconPosition="left"
            className="h-12 w-full sm:h-10"
            icon={ICONS.search}
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <Button
            className="md:hidden gap-2"
            onClick={() =>
              navigate(`/dashboard/project/${projectId}/tasks/new`)
            }
          >
            <PlusIcon />
            Create New Task
          </Button>

          <div className="hidden sm:grid grid-flow-col auto-cols-max items-center gap-3 justify-end">
            <Select<ViewOption, false>
              options={VIEW_OPTIONS}
              value={selectedViewOption}
              onChange={handleViewChange}
              styles={viewSelectStyles}
              isSearchable={false}
              formatOptionLabel={(data) => <ViewOptionLabel data={data} />}
              components={{
                // Show icon + label in the control too
                SingleValue: ({ data }) => <ViewOptionLabel data={data} />,
              }}
            />

            <div className="h-10 w-10 place-items-center rounded-lg bg-gray-100 grid cursor-pointer hover:bg-gray-200">
              <img src={ICONS.menu} width={18} height={12} alt="menu" />
            </div>
          </div>
        </div>
      </div>

      <div className={isBoard ? "flex-1 min-h-0 overflow-hidden" : "pb-10"}>
        {isMobile ? (
          <div className="flex flex-col gap-3">
            {mobileLoading && mobileTasks.length === 0 ? (
              <div className="space-y-2 px-4 py-2">
                <div className="h-16 bg-gray-100 animate-pulse rounded" />
                <div className="h-16 bg-gray-100 animate-pulse rounded" />
                <div className="h-16 bg-gray-100 animate-pulse rounded" />
              </div>
            ) : mobileTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                <span className="font-medium">No tasks found</span>
                {searchTerm && (
                  <span className="text-xs mt-1">
                    Try adjusting your search
                  </span>
                )}
              </div>
            ) : (
              <>
                {mobileTasks.map((task, index) => (
                  <div
                    key={task.id}
                    ref={
                      mobileTasks.length === index + 1 ? lastElementRef : null
                    }
                  >
                    <MobileViewTask
                      task={task}
                      onClick={() => openTask(task.id)}
                    />
                  </div>
                ))}
                {mobileLoading && (
                  <p className="text-center py-4 text-sm text-gray-400 animate-pulse">
                    Loading more tasks...
                  </p>
                )}
              </>
            )}
          </div>
        ) : isBoard ? (
          <BoardView
            key={`board-${refreshTrigger}`}
            projectId={projectId!}
            onTaskClick={openTask}
            searchTerm={searchTerm}
          />
        ) : (
          <ListView
            key={`list-view-${refreshTrigger}-${currentPage}`}
            tasks={paginatedTasks}
            loading={listLoading}
            error={listError?.message ?? null}
            onRowClick={openTask}
            pagination={
              !listLoading &&
              paginatedTasks.length > 0 && (
                <div className="mt-8">
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
                </div>
              )
            }
          />
        )}
      </div>

      {selectedTask && (
        <DetailsTask
          key={selectedTask.taskId}
          isOpen={true}
          taskId={selectedTask.taskId}
          projectId={selectedTask.projectId}
          onClose={closeTask}
        />
      )}
    </div>
  );
}
