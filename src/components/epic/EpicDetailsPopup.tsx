import { useEffect, useRef, useState, useCallback } from "react";
import { getProjectEpic, getProjectMembers } from "../../services/endpoints";
import Button from "../ui/Button";
import Input from "../ui/Input";
import type {
  Member,
  Epic,
  EpicCardProps,
} from "../../types/apiTypes";
import useIsMobile from "../../hooks/useIsMobile";
import { updateEpic } from "../../services/endpoints";
import EpicDateRow from "./EpicDateRow";
import EpicInfoRow from "./EpicInfoRow";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import {
  PlusIcon,
  TasksEmptyIcon,
  CloseIcon,
  EpicDetailsIcon,
  PenEditIcon,
} from "../ui/SvgIcons";

export default function EpicDetailsPopup({
  title,
  description,
  createdAt,
  epicId,
  projectId,
  id,
  assigneeName,
  createdBy,
  deadline,
  tasks = [],
  isOpen = true,
  onClose,
  onAddTask,
}: EpicCardProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // ── Remote data ──
  const [epic, setEpic] = useState<Epic | null>(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // ── Fetch error & retry ──
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ── Local editable state (initialised from props) ──
  const [localTitle, setLocalTitle] = useState(title ?? "");
  const [localDescription, setLocalDescription] = useState(description ?? "");
  const [localDeadline, setLocalDeadline] = useState<string | null>(
    deadline ?? null,
  );
  const [localAssigneeName, setLocalAssigneeName] = useState(
    assigneeName ?? null,
  );

  // ── Saving indicator ──
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Edit mode flags ──
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Schema ──
  const epicSchema = z.object({
    title: z
      .string()
      .nonempty("Title is required")
      .min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .max(500, "Description must be at most 500 characters")
      .optional(),
    assignee: z.string().nullable().optional(),
    deadline: z
      .string()
      .optional()
      .refine((value) => {
        if (!value) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(value);
        return selected >= today;
      }, "Deadline must be today or a future date"),
  });

  type EpicFormValues = z.infer<typeof epicSchema>;

  // ── Editable guard: disable all editing while loading or on fetch error ──
  const isEditable = !loading && !fetchError;

  // ── Skeleton class helper ──
  const skeletonClass =
    "bg-(--color-surface-highest) animate-pulse rounded";

  // ── Fetch epic ──
  useEffect(() => {
    if (!id || !projectId) return;
    let cancelled = false;

    const fetchEpic = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await getProjectEpic(projectId, id);
        if (!cancelled) {
          const data = (res as { data?: Epic | Epic[] })?.data ?? res;
          const epicData: Epic = Array.isArray(data)
            ? data[0]
            : (data as Epic);
          setEpic(epicData);
          setLocalTitle(epicData.title ?? title ?? "");
          setLocalDescription(epicData.description ?? description ?? "");
          setLocalDeadline(epicData.deadline ?? deadline ?? null);
          setLocalAssigneeName(epicData.assignee_name ?? assigneeName ?? "");
        }
      } catch (err) {
        console.error("Failed to fetch epic", err);
        if (!cancelled) {
          // ✅ Fallback to original props on error
          setLocalTitle(title ?? "");
          setLocalDescription(description ?? "");
          setLocalDeadline(deadline ?? null);
          setLocalAssigneeName(assigneeName ?? null);
          setFetchError(
            "Failed to load epic details. Showing last known values.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEpic();
    return () => {
      cancelled = true;
    };
  }, [assigneeName, deadline, description, id, projectId, title, retryCount]);

  // ── Fetch members ──
  useEffect(() => {
    if (!projectId) return;

    const fetchMembers = async () => {
      try {
        const res = await getProjectMembers(projectId);
        const data: Member[] = res.data as Member[];
        setMembers(data || []);
      } catch (err) {
        console.error("Failed to fetch members", err);
      }
    };

    fetchMembers();
  }, [projectId]);

  // ── Escape key ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ── Focus helpers ──
  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingDescription) descTextareaRef.current?.focus();
  }, [editingDescription]);

  // ── Generic patch helper ──
  const patch = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!id || !projectId) return;
      setSaving(true);
      setSaveError(null);
      try {
        await updateEpic(id, payload);
        setEpic((prev) => (prev ? { ...prev, ...payload } : prev));
      } catch (err) {
        console.error("Failed to update epic", err);
        setSaveError("Failed to save. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [id, projectId],
  );

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema),
    defaultValues: { title: localTitle },
  });

  useEffect(() => {
    setValue("title", localTitle);
  }, [localTitle, setValue]);

  // ── Field save handlers ──
  const saveTitle = async () => {
    await handleSubmit(
      (data) => {
        setEditingTitle(false);
        if (data.title !== (epic?.title ?? title)) patch({ title: data.title });
        setLocalTitle(data.title);
      },
      () => {
        titleInputRef.current?.focus();
      },
    )();
  };

  const saveDescription = () => {
    setEditingDescription(false);
    if (localDescription !== (epic?.description ?? description ?? ""))
      patch({ description: localDescription });
  };

  const saveAssignee = (memberId: string | null) => {
    const member = members.find((m) => m.member_id === memberId) ?? null;
    setLocalAssigneeName(member?.metadata.name ?? "");
    patch({ assignee_id: memberId });
  };

  const saveDeadline = (val: string | null) => {
    setLocalDeadline(val);
    patch({ deadline: val });
  };

  if (!isOpen) return null;

  const displayCreatedBy = epic?.created_by?.name ?? createdBy;
  const displayCreatedAt = epic?.created_at ?? createdAt;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(4, 27, 60, 0.35)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(4,27,60,0.18)] w-full max-w-145 mx-4 flex flex-col overflow-hidden animate-[fadeSlideUp_0.22s_ease-out]">

        {/* ── Header ── */}
        <div className="bg-(--color-surface-low) sm:bg-transparent rounded-t-2xl">
          <div className="px-7 pt-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              {epicId && (
                <div className="flex items-center gap-2">
                  <EpicDetailsIcon className="hidden md:block" />
                  <span className="text-[12px] font-bold tracking-widest uppercase text-(--color-primary) md:text-[#041B3C99]">
                    {epicId}
                  </span>
                </div>
              )}

              <div className="ml-auto flex items-center gap-2">
                {saving && (
                  <span className="text-[11px] text-[#9CA3AF] animate-pulse">
                    Saving…
                  </span>
                )}
                {saveError && (
                  <span className="text-[13px] text-red-500">{saveError}</span>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-(--color-hover) transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* ── Title ── */}
            {editingTitle && isEditable ? (
              <div className="flex flex-col gap-1">
                <Input
                  {...register("title")}
                  ref={(e) => {
                    register("title").ref(e);
                    (
                      titleInputRef as React.RefObject<HTMLInputElement | null>
                    ).current = e;
                  }}
                  value={localTitle}
                  onChange={(e) => {
                    setLocalTitle(e.target.value);
                    setValue("title", e.target.value, { shouldValidate: true });
                  }}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") {
                      setLocalTitle(epic?.title ?? title ?? "");
                      setValue("title", epic?.title ?? title ?? "");
                      clearErrors("title");
                      setEditingTitle(false);
                    }
                  }}
                />
                {errors.title && (
                  <span className="text-[11px] text-red-500 px-1">
                    {errors.title.message}
                  </span>
                )}
              </div>
            ) : (
              <h2
                onClick={() => isEditable && setEditingTitle(true)}
                title={isEditable ? "Click to edit title" : undefined}
                className={`text-[22px] uppercase font-bold text-(--color-slate-dark-blue) leading-tight tracking-tight group flex items-center gap-2 transition-colors
                  ${
                    isEditable
                      ? "cursor-pointer hover:text-(--color-primary)"
                      : "cursor-not-allowed opacity-60"
                  }`}
              >
                {loading ? (
                  <span className={`${skeletonClass} w-48 h-6 `} />
                ) : (
                  localTitle || "—"
                )}
                {isEditable && <PenEditIcon />}
              </h2>
            )}
          </div>
        </div>

        {/* ── Fetch Error Banner ── */}
        {fetchError && (
          <div className="mx-7 mb-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-3">
            <span className="text-[12px] text-red-600">{fetchError}</span>
            <button
              onClick={() => {
                setFetchError(null);
                setRetryCount((c) => c + 1);
              }}
              className="shrink-0 text-[12px] font-semibold text-red-600 border border-red-300 rounded-md px-3 py-1.5 hover:bg-red-100 transition-colors whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Description ── */}
        <div className="px-7 pb-5">
          <hr className="hidden sm:block border-[#E5E7EB] my-2" />

          <h3 className="block md:hidden font-bold text-(--label-speical-size,--color-slate-medium-blue) mt-4 ">
            Description
          </h3>

          {editingDescription && isEditable ? (
            <textarea
              ref={descTextareaRef}
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              onBlur={saveDescription}
              rows={3}
              placeholder="No description provided for this epic."
              className="px-4 py-3 pb-8 resize-none w-full rounded-sm outline-none border-none pr-10 pl-4 bg-(--color-surface-highest) text-sm"
            />
          ) : loading ? (
            <div className="mt-3 flex flex-col gap-2 ">
              <span className={`${skeletonClass} w-full h-3 block`} />
              <span className={`${skeletonClass} w-3/4 h-3 block`} />
              <span className={`${skeletonClass} w-1/2 h-3 block`} />
            </div>
          ) : (
            <p
              onClick={() => isEditable && setEditingDescription(true)}
              title={isEditable ? "Click to edit description" : undefined}
              className={`mt-3  text-(--color-slate-dark-blue)/80 leading-relaxed gap-1 flex items-center group relative transition-colors
                ${
                  isEditable
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60 pointer-events-none"
                }`}
            >
              <span className="group-hover:bg-(--color-surface-low) rounded-md px-1 -mx-1 transition-colors">
                {localDescription || "No description provided for this epic."}
              </span>
              {isEditable && <PenEditIcon className="mt-1" />}
            </p>
          )}
        </div>

        {/* ── Info Rows ── */}
        <div className="px-7 py-1 flex justify-between items-center gap-8 flex-wrap">
          <EpicInfoRow
            label="Created By"
            name={
              loading ? undefined : displayCreatedBy
            }
            loading={loading}
            color="white"
            bgColor="var(--color-primary)"
          />

          <EpicInfoRow
            label="Assignee"
            name={localAssigneeName || undefined}
            loading={loading}
            editable={isEditable}
            members={members}
            onSelect={saveAssignee}
          />

          <EpicDateRow
            label="Created At"
            date={loading ? undefined : displayCreatedAt}
            loading={loading}
          />

          <EpicDateRow
            label="Deadline"
            date={localDeadline ?? undefined}
            loading={loading}
            editable={isEditable}
            onDateChange={saveDeadline}
          />
        </div>

        {/* ── Tasks Section ── */}
        <div className="px-7 py-2">
          <div className="flex items-center mb-1">
            <h3 className="text-[15px] font-bold text-(--color-slate-dark-blue)">
              Tasks
            </h3>
            <Button
              onClick={onAddTask}
              variant="text"
              className="flex items-center gap-1.5 ml-auto px-0"
            >
              <PlusIcon />
              Add Task
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-10 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #F0F4FF 0%, #EEF2FB 100%)",
                border: "2px dashed #C7D2E8",
              }}
            >
              <div className="w-14 h-14 bg-(--color-surface-highest) rounded-2xl flex items-center justify-center mb-2">
                <TasksEmptyIcon opacity={!isMobile ? "0.3" : "1"} />
              </div>
              <p className="px-4 text-center sm:px-0 text-[16px] sm:text-(--color-slate-dark-blue) text-(--color-slate-medium-blue) font-medium">
                No tasks have been added to this epic yet
              </p>
              <Button onClick={onAddTask} className="gap-2 mt-2">
                <PlusIcon />
                Add Task
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-(--color-hover) hover:border-(--color-primary)/30 hover:bg-(--color-hover) transition-all duration-150"
                >
                  <span className="text-[var(--label-speical-size),var(--color-primary)] font-medium">
                    {task.title}
                  </span>
                  {task.status && (
                    <span className="text-[var(--label-sm-size),var(--color-primary)] font-semibold px-2.5 py-0.5 rounded-full bg-(--color-text)">
                      {task.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}