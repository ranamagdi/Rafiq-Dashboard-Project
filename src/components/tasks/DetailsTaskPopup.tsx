import { useEffect, useState, useRef, useCallback } from "react";
import { getProjectTask, updateTask } from "../../services/endpoints";
import Avatar from "./Avatar";
import SkeletonDetails from "./SkeltonDetails";
import { formatDate } from "../utils/dateUtils";
import { CopyLink, EpicId } from "../ui/SvgIcons";
import type { Task, StatusVariant } from "../../types/apiTypes";
import { Clock, CalendarIcon, PenIcon } from "../ui/SvgIcons";
import EditableStatus from "./EditableStatus";
import { Toaster, toast } from "react-hot-toast";
import Modal from "../../components/common/Modal/Modal";

interface DetailsTaskProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  taskId: string;
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; task: Task };

type EditableField = "title" | "description" | "status" | "due_date";

interface EditState {
  field: EditableField | null;
  value: string;
}

const Spinner = () => (
  <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />
);

const DetailsTask = ({
  isOpen,
  onClose,
  projectId,
  taskId,
}: DetailsTaskProps) => {
  const [fetchState, setFetchState] = useState<FetchState>({
    status: "loading",
  });
  const [editState, setEditState] = useState<EditState>({
    field: null,
    value: "",
  });
  const [savingField, setSavingField] = useState<EditableField | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const prevOpenRef = useRef(false);

  const blurTimers = useRef<
    Partial<Record<EditableField, ReturnType<typeof setTimeout>>>
  >({});

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setFetchKey((k) => k + 1);
      setEditState({ field: null, value: "" });
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadingTimer = setTimeout(() => {
      if (!cancelled) setFetchState({ status: "loading" });
    }, 0);

    getProjectTask(projectId, taskId)
      .then((res) => {
        clearTimeout(loadingTimer);
        if (cancelled) return;
        const task = res.data?.[0];
        if (task) setFetchState({ status: "success", task: task as Task });
        else setFetchState({ status: "error", message: "Task not found." });
      })
      .catch(() => {
        clearTimeout(loadingTimer);
        if (cancelled) return;
        setFetchState({ status: "error", message: "Failed to load task." });
      });

    return () => {
      cancelled = true;
      clearTimeout(loadingTimer);
    };
  }, [fetchKey, isOpen, projectId, taskId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const startEdit = useCallback(
    (field: EditableField, currentValue: string) => {
      setEditState({ field, value: currentValue ?? "" });
    },
    [],
  );

  const commitSave = useCallback(
    async (field: EditableField, newValue: string, originalValue: string) => {
      const trimmedNew = newValue.trim();
      const trimmedOld = (originalValue ?? "").trim();

      // Skip if required field is empty
      if (field === "title" && !trimmedNew) {
        toast.error("Title cannot be empty.");
        setEditState({ field, value: newValue });
        return;
      }

      // Skip API call if value unchanged
      if (trimmedNew === trimmedOld) return;

      setSavingField(field);

      try {
        await updateTask(taskId, {
          [field]: trimmedNew || null,
        });

        // Optimistic local update — cast to satisfy the Task discriminated union
        setFetchState((prev): FetchState => {
          if (prev.status !== "success") return prev;
          const updatedTask: Task = {
            ...prev.task,
            [field]: (field === "status"
              ? (trimmedNew as StatusVariant)
              : trimmedNew || null) as Task[typeof field],
          };
          return { status: "success", task: updatedTask };
        });

        toast.success("Saved!");
      } catch {
        toast.error("Failed to save. Please try again.");
        setFetchKey((k) => k + 1);
      } finally {
        setSavingField(null);
      }
    },
    [taskId],
  );

  const scheduleSave = useCallback(
    (field: EditableField, newValue: string, originalValue: string) => {
      if (blurTimers.current[field]) clearTimeout(blurTimers.current[field]);

      blurTimers.current[field] = setTimeout(() => {
        setEditState({ field: null, value: "" });
        commitSave(field, newValue, originalValue);
      }, 150);
    },
    [commitSave],
  );

  const cancelScheduledSave = useCallback((field: EditableField) => {
    if (blurTimers.current[field]) {
      clearTimeout(blurTimers.current[field]);
      delete blurTimers.current[field];
    }
  }, []);

  const handleStatusChange = useCallback(
    async (newStatus: StatusVariant, originalStatus: string) => {
      setEditState({ field: null, value: "" });

      if (newStatus === originalStatus) return;

      setSavingField("status");

      try {
        await updateTask(taskId, { status: newStatus });

        setFetchState((prev): FetchState => {
          if (prev.status !== "success") return prev;
          return {
            status: "success",
            task: { ...prev.task, status: newStatus as StatusVariant },
          };
        });

        toast.success("Status updated!");
      } catch {
        toast.error("Failed to update status.");
        setFetchKey((k) => k + 1);
      } finally {
        setSavingField(null);
      }
    },
    [taskId],
  );

  const EditableTitle = ({ task }: { task: Task }) => {
    const isEditing = editState.field === "title";
    const isSaving = savingField === "title";

    if (isEditing) {
      return (
        <input
          autoFocus
          value={editState.value}
          onChange={(e) =>
            setEditState((prev) => ({ ...prev, value: e.target.value }))
          }
          onBlur={() => scheduleSave("title", editState.value, task.title)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              cancelScheduledSave("title");
              setEditState({ field: null, value: "" });
              commitSave("title", editState.value, task.title);
            }
            if (e.key === "Escape") {
              cancelScheduledSave("title");
              setEditState({ field: null, value: "" });
            }
          }}
          className="text-2xl font-semibold text-gray-900 leading-snug w-full bg-gray-50 border border-blue-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
          maxLength={255}
        />
      );
    }

    return (
      <div className="flex items-start gap-2 group">
        <h2 className="text-2xl font-semibold text-gray-900 leading-snug flex-1">
          {task.title}
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            startEdit("title", task.title);
          }}
          disabled={isSaving}
          className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500 shrink-0"
          title="Edit title"
        >
          {isSaving ? <Spinner /> : <PenIcon />}
        </button>
      </div>
    );
  };

  const EditableDescription = ({ task }: { task: Task }) => {
    const isEditing = editState.field === "description";
    const isSaving = savingField === "description";
    const currentDesc = task.description ?? "";

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (isEditing && textareaRef.current) {
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, [isEditing]);

    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          autoFocus
          value={editState.value}
          rows={5}
          onChange={(e) =>
            setEditState((prev) => ({ ...prev, value: e.target.value }))
          }
          onBlur={() =>
            scheduleSave("description", editState.value, currentDesc)
          }
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              cancelScheduledSave("description");
              setEditState({ field: null, value: "" });
            }
          }}
          className="w-full text-sm text-gray-600 bg-gray-50 border border-blue-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 resize-none text-left"
          maxLength={500}
          placeholder="Add a description..."
        />
      );
    }

    return (
      <div className="group relative">
        <p className="text-sm text-gray-600 leading-relaxed pr-7">
          {currentDesc || (
            <span className="text-gray-400 italic">
              No description provided.
            </span>
          )}
        </p>
        <button
          onClick={() => startEdit("description", currentDesc)}
          disabled={isSaving}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500"
          title="Edit description"
        >
          {isSaving ? <Spinner /> : <PenIcon />}
        </button>
      </div>
    );
  };

  const EditableDueDate = ({ task }: { task: Task }) => {
    const isEditing = editState.field === "due_date";
    const isSaving = savingField === "due_date";
    const currentDate: string = task.due_date
      ? new Date(task.due_date).toISOString().split("T")[0]
      : "";

    if (isEditing) {
      return (
        <input
          autoFocus
          type="date"
          value={editState.value}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setEditState((prev) => ({ ...prev, value: e.target.value }))
          }
          onBlur={() => scheduleSave("due_date", editState.value, currentDate)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              cancelScheduledSave("due_date");
              setEditState({ field: null, value: "" });
            }
          }}
          className="text-sm text-gray-700 font-medium border border-blue-300 rounded px-2 py-0.5 bg-white outline-none focus:ring-2 focus:ring-blue-200"
        />
      );
    }

    return (
      <button
        onClick={() => startEdit("due_date", currentDate)}
        disabled={isSaving}
        className="text-left cursor-pointer hover:text-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        title="Click to edit due date"
      >
        {isSaving ? (
          <Spinner />
        ) : (
          <span className="text-gray-700 font-medium underline-offset-2 hover:underline">
            {currentDate ? (
              formatDate(currentDate)
            ) : (
              <span className="text-gray-400 italic">Set due date</span>
            )}
          </span>
        )}
      </button>
    );
  };

  const MobileTitleInput = ({ task }: { task: Task }) => {
    if (editState.field === "title") {
      return (
        <input
          autoFocus
          value={editState.value}
          onChange={(e) =>
            setEditState((prev) => ({ ...prev, value: e.target.value }))
          }
          onBlur={() => scheduleSave("title", editState.value, task.title)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              cancelScheduledSave("title");
              setEditState({ field: null, value: "" });
              commitSave("title", editState.value, task.title);
            }
            if (e.key === "Escape") {
              cancelScheduledSave("title");
              setEditState({ field: null, value: "" });
            }
          }}
          className="text-xl font-bold text-gray-900 w-full bg-gray-50 border border-blue-300 rounded px-2 py-1 outline-none"
          maxLength={255}
        />
      );
    }

    return (
      <div className="flex items-start gap-2 group">
        <h2 className="text-xl font-bold text-gray-900 leading-snug flex-1">
          {task.title}
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            startEdit("title", task.title);
          }}
          className="mt-1 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-blue-500 shrink-0"
        >
          {savingField === "title" ? <Spinner /> : <PenIcon />}
        </button>
      </div>
    );
  };

  return (
    <>
      <Toaster position="bottom-center" containerClassName="z-[11000]" />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="md:hidden rounded-t-3xl! rounded-b-none! max-w-full! p-0! bg-gray-100 max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {fetchState.status === "loading" && (
          <div className="p-5 space-y-4">
            <SkeletonDetails className="h-4 w-24" />
            <SkeletonDetails className="h-7 w-2/3" />
            <div className="space-y-2 mt-4">
              <SkeletonDetails className="h-3 w-24" />
              <SkeletonDetails className="h-3 w-full" />
              <SkeletonDetails className="h-3 w-full" />
              <SkeletonDetails className="h-3 w-2/3" />
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
                  <span className="text-xs font-bold text-gray-500 tracking-wide">
                    {task.task_id}
                  </span>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 px-5 pb-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <MobileTitleInput task={task} />
                    <div className="flex justify-between">
                      <EditableStatus
                        task={task}
                        isEditing={editState.field === "status"}
                        isSaving={savingField === "status"}
                        startEdit={() => startEdit("status", task.status)}
                        onChange={(newStatus) =>
                          handleStatusChange(newStatus, task.status)
                        }
                        onBlur={() => setEditState({ field: null, value: "" })}
                      />
                      {task.epic_id && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                          EPIC-{task.epic_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info grid (mobile) */}
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

                    <div className="bg-[#F1F3FF] rounded-2xl p-3 flex flex-col gap-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Due Date
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 text-sm">
                          <CalendarIcon />
                        </span>
                        <EditableDueDate task={task} />
                      </div>
                    </div>

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

                  {/* Description (mobile) */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Description
                    </p>
                    <div className="bg-white rounded-sm p-4">
                      <EditableDescription task={task} />
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
      </Modal>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="hidden md:flex max-w-3xl! h-[85vh]! p-0! rounded-2xl! flex-col overflow-hidden"
      >
        {fetchState.status === "loading" && (
          <div className="px-5 pb-6 flex flex-col gap-5">
            <div className="flex justify-between items-center pt-2">
              <SkeletonDetails className="h-4 w-20" />
              <SkeletonDetails className="h-6 w-6 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <SkeletonDetails className="h-6 w-3/4" />
              <div className="flex justify-between">
                <SkeletonDetails className="h-6 w-24 rounded-full" />
                <SkeletonDetails className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-3 space-y-2">
                  <SkeletonDetails className="h-3 w-16" />
                  <div className="flex items-center gap-2">
                    <SkeletonDetails className="w-7 h-7 rounded-full" />
                    <SkeletonDetails className="h-4 w-20" />
                  </div>
                </div>
              ))}
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
                  {/* Left panel — title & description */}
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

                    <EditableTitle task={task} />

                    <hr className="border-[#C3C6D6]/20 mt-3 mb-4" />

                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                        Description
                      </p>
                      <EditableDescription task={task} />
                    </div>
                  </div>

                  <div className="w-80 p-6 bg-[#F1F3FF] overflow-y-auto flex flex-col gap-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                        Status
                      </p>
                      <EditableStatus
                        task={task}
                        isEditing={editState.field === "status"}
                        isSaving={savingField === "status"}
                        startEdit={() => startEdit("status", task.status)}
                        onChange={(newStatus) =>
                          handleStatusChange(newStatus, task.status)
                        }
                        onBlur={() => setEditState({ field: null, value: "" })}
                      />
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
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Due Date</span>
                        <EditableDueDate task={task} />
                      </div>
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

                <div className="px-6 py-4 bg-[#F1F3FF] border-t border-gray-200 shrink-0">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
                    >
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
      </Modal>
    </>
  );
};

export default DetailsTask;
