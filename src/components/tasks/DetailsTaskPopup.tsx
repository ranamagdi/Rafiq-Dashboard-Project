import { useEffect, useState } from "react";
import { getProjectTask } from "../../services/endpoints";
import { getInitials } from "../utils/nameUtils";
import { formatDate } from "../utils/dateUtils";
import { CopyLink, EpicId } from "../ui/SvgIcons";
import type { Task } from "../../types/apiTypes";
import { Clock, CalendarIcon,ProjectTeamResponsiveIcon } from "../ui/SvgIcons";


interface DetailsTaskProps {
  onClose: () => void;
  projectId: string;
  taskId: string;
}

const formatStatus = (status: string) => {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<
    string,
    { label: string; style: string; dotColor: string }
  > = {
    TODO: {
      label: "Todo",
      style: "bg-gray-200 text-gray-700",
      dotColor: "bg-gray-400",
    },
    IN_PROGRESS: {
      label: "In Progress",
      style: "bg-blue-200 text-blue-800",
      dotColor: "bg-blue-500",
    },
    COMPLETED: {
      label: "Completed",
      style: "bg-green-200 text-green-800",
      dotColor: "bg-emerald-500",
    },
    DONE: {
      label: "Done",
      style: "bg-green-200 text-green-800",
      dotColor: "bg-emerald-500",
    },
  };

  const current = map[status] ?? {
    label: formatStatus(status),
    style: "bg-gray-100 text-gray-600",
    dotColor: "bg-gray-400",
  };

  return (
    <>
   
      <div
        className={`hidden md:flex items-center justify-between px-3 py-2 rounded-md font-semibold text-sm ${current.style}`}
      >
        <span>{current.label}</span>
       <ProjectTeamResponsiveIcon className=" md:hidden" />
      
      </div>

    
      <span
        className={`md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${current.style}`}
      >
        <span className={`w-2 h-2 rounded-full ${current.dotColor}`} />
        {current.label}
      </span>
    </>
  );
};

const Avatar = ({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) => (
  <div
    className={`rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold shrink-0 ${
      size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs"
    }`}
  >
    {getInitials(name)}
  </div>
);

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; task: Task };

const DetailsTask = ({ onClose, projectId, taskId }: DetailsTaskProps) => {
  const [fetchState, setFetchState] = useState<FetchState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    getProjectTask(projectId, taskId)
      .then((res) => {
        if (cancelled) return;
        const task = res.data?.[0];
        if (task) setFetchState({ status: "success", task });
        else setFetchState({ status: "error", message: "Task not found." });
      })
      .catch(() => {
        if (cancelled) return;
        setFetchState({ status: "error", message: "Failed to load task." });
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, taskId]);

  return (
    <div
      className={`
        fixed inset-0 z-50 bg-black/40 backdrop-blur-md
        /* Mobile: align to bottom */
        flex items-end justify-center
        /* Desktop: center */
        md:items-center md:p-6
      `}
      onClick={onClose}
    >
      <div
        className="md:hidden w-full bg-gray-100 rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {fetchState.status === "loading" && (
          <div className="flex flex-1 overflow-hidden">
         
            <div className="flex-1 p-8 space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-2/3" />

              <div className="space-y-2 mt-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>

       
            <div className="w-80 p-6 bg-[#F1F3FF] space-y-5">
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-3 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        )}
        {fetchState.status === "error" && (
          <div className="p-10 text-center text-red-500">
            {fetchState.message}
          </div>
        )}

        {fetchState.status === "success" &&
          (() => {
            const { task } = fetchState;
            return (
              <>
                <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 tracking-wide">
                      {task.task_id}
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 px-5 pb-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">
                      {task.title}
                    </h2>
                    <div className="flex justify-between">
                      <StatusBadge status={task.status} />
                      {task.epic_id && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                          EPIC-{task.epic_id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {task.assignee && (
                      <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Assignee
                        </p>
                        <div className="flex items-center gap-2">
                          <Avatar name={task.assignee.name} size="sm" />
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {task.assignee.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {task.due_date && (
                      <div className="bg-[#F1F3FF] rounded-2xl p-3 flex flex-col gap-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Due Date
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 text-sm">
                            <CalendarIcon />
                          </span>
                          <p className="text-sm font-medium text-gray-800">
                            {formatDate(task.due_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {task.created_by?.name && (
                      <div className="bg-[#F1F3FF] rounded-2xl p-3 flex flex-col gap-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Created By
                        </p>
                        <div className="flex items-center gap-2">
                          <Avatar name={task.created_by.name} size="sm" />
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {task.created_by.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {task.created_at && (
                      <div className="bg-[#F1F3FF] rounded-2xl p-3 flex flex-col gap-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Created At
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 text-sm">
                            <Clock />
                          </span>
                          <p className="text-sm font-medium text-gray-800">
                            {formatDate(task.created_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Description
                    </p>
                    <div className="bg-white rounded-sm p-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {task.description ?? "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
      </div>

      <div
        className="hidden md:flex w-full max-w-3xl h-[85vh] rounded-2xl bg-white shadow-2xl border border-gray-200 flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {fetchState.status === "loading" && (
          <div className="px-5 pb-6 flex flex-col gap-5">
        
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>

         
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-3 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Skeleton className="h-3 w-24 mb-2" />
              <div className="bg-white p-4 rounded space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        )}
        {fetchState.status === "error" && (
          <div className="p-10 text-center text-red-500">
            {fetchState.message}
          </div>
        )}

        {fetchState.status === "success" &&
          (() => {
            const { task } = fetchState;
            return (
              <>
                <div className="flex flex-1 overflow-hidden">
                  <div className="flex-1 p-8 overflow-y-auto border-r border-gray-200">
                    <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                      <span className="bg-blue-100 text-(--color-primary) font-bold px-2 py-0.5 rounded">
                        {task.task_id}
                      </span>
                      {task.epic_id && (
                        <>
                          <span>
                            <EpicId />
                          </span>
                          <span className="text-gray-600">
                            Epic-{task.epic_id}
                          </span>
                        </>
                      )}
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 leading-snug">
                      {task.title}
                    </h2>

                    <hr className="border-[#C3C6D6]/20 mt-1 md:block hidden" />

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                        Description
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {task.description ?? "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-80 p-6 bg-[#F1F3FF] overflow-y-auto flex flex-col gap-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                        Status
                      </p>
                      <StatusBadge status={task.status} />
                    </div>

                    {task.assignee && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                          Assignee
                        </p>
                        <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                          <Avatar name={task.assignee.name} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {task.assignee.name}
                            </p>
                            {task.assignee.email && (
                              <p className="text-xs text-gray-400">
                                {task.assignee.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {task.created_by?.name && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                          Reporter
                        </p>
                        <div className="flex items-center gap-2">
                          <Avatar name={task.created_by.name} />
                          <p className="text-sm font-medium text-gray-800">
                            {task.created_by.name}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 text-sm mt-2">
                      {task.due_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Due Date</span>
                          <span className="text-gray-700 font-medium">
                            {formatDate(task.due_date)}
                          </span>
                        </div>
                      )}
                      {task.created_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created At</span>
                          <span className="text-gray-700 font-medium">
                            {formatDate(task.created_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fixed footer */}
                <div className="px-6 py-4 bg-[#F1F3FF] border-t border-gray-200 shrink-0">
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
                      <CopyLink />
                      Copy link
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 bg-[#CDDDFF] hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
      </div>
    </div>
  );
};

export default DetailsTask;
