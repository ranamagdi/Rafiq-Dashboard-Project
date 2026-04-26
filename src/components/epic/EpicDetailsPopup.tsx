import { formatDate } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import type { StatusVariant } from "../../types/apiTypes";
import { getInitials } from "../utils/nameUtils";
import { getProjectEpic } from "../../services/endpoints";
import Button from "../ui/Button";
import useIsMobile from "../../hooks/useIsMobile";
import {
  CalendarIcon,
  PlusIcon,
  TasksEmptyIcon,
  CloseIcon,
  EpicDetailsIcon,
} from "../ui/SvgIcons";
type Task = {
  id: string;
  title: string;
  status?: string;
};

type EpicData = {
  title?: string;
  created_at?: string;
  deadline?: string;
  created_by?: { name?: string };
  assignee?: { name?: string; avatar?: string };
};

type EpicCardProps = {
  id: string;
  title?: string;
  description?: string;
  createdAt?: string;
  projectId?: string;
  epicId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  status?: StatusVariant;
  createdBy?: string;
  createdByAvatar?: string;
  deadline?: string;
  tasks?: Task[];
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onAddTask?: () => void;
};

function MetaColumn({
  label,
  name,
  color,
  bgColor,
}: {
  label: string;
  name?: string;
  color?: string;
  bgColor?: string;
}) {
  const initials = getInitials(name ?? "");

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </span>

      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 text-[10px] rounded-xl flex items-center justify-center font-bold shrink-0"
          style={{
            backgroundColor: bgColor ?? "#CDDDFF",
            color: color ?? "#51617E",
          }}
        >
          {initials}
        </div>

        <span className="text-[14px] font-medium text-[#041B3C]">
          {name ?? "—"}
        </span>
      </div>
    </div>
  );
}
function DateColumn({ label, date }: { label: string; date?: string }) {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </span>
      <div className="flex items-center gap-1.5 mt-0.5">
        <CalendarIcon color={isMobile ? "var(--color-primary)" : "#9CA3AF"} />
        <span className="text-[14px] font-medium text-[#041B3C]">
          {date ? formatDate(date) : "—"}
        </span>
      </div>
    </div>
  );
}

export default function EpicDetailsPopup({
  title,
  description,
  createdAt,
  epicId,
  projectId,
  id,
  assigneeName,
  createdBy,
  tasks = [],
  isOpen = true,
  onClose,
  onAddTask,
}: EpicCardProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [epic, setEpic] = useState<EpicData | null>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    if (!id || !projectId) return;

    let cancelled = false;

    const fetchEpic = async () => {
      setLoading(true);
      try {
        const res = await getProjectEpic(projectId, id);
        if (!cancelled) {
          const data = (res as { data?: EpicData | EpicData[] })?.data ?? res;
          setEpic(Array.isArray(data) ? data[0] : (data as EpicData));
        }
      } catch (err) {
        console.error("Failed to fetch epic", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEpic();

    return () => {
      cancelled = true;
    };
  }, [id, projectId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const displayTitle = loading ? "Loading..." : (epic?.title ?? title);
  const displayCreatedBy = loading
    ? "Loading..."
    : (epic?.created_by?.name ?? createdBy);
  const displayAssigneeName = loading
    ? "Loading..."
    : (epic?.assignee?.name ?? assigneeName);
  const displayCreatedAt = loading
    ? "Loading..."
    : (epic?.created_at ?? createdAt);

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
      <div
        className={`
          relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(4,27,60,0.18)]
          w-full max-w-145 mx-4 flex flex-col overflow-hidden
          animate-[fadeSlideUp_0.22s_ease-out]
         
        `}
      >
        <div className="bg-[#F1F3FF] sm:bg-transparent rounded-t-2xl">
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

              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {title && (
              <h2 className="text-[22px] uppercase font-bold text-[#041B3C] leading-tight tracking-tight">
                {displayTitle}
              </h2>
            )}
          </div>
        </div>

        <div className="px-7 pb-5">
          <hr className="hidden sm:block border-[#E5E7EB] my-5" />

          <h3 className="block md:hidden font-bold text-[11px] mt-4 text-[#4F5F7B]">
            Description
          </h3>

          <p className="mt-3 text-[16px] text-[#041B3CCC] leading-relaxed">
            {description || "No description provided for this epic."}
          </p>
        </div>

        <div className="px-7 py-5 flex justify-between items-center gap-8 flex-wrap">
          <MetaColumn
            label="Created By"
            name={displayCreatedBy}
            color="white"
            bgColor="var(--color-primary)"
          />
          <MetaColumn label="Assignee" name={displayAssigneeName} />

          <DateColumn label="Created At" date={displayCreatedAt} />
        </div>

        <div className="px-7 py-5">
          <div className="flex items-center mb-4 ">
            <h3 className="text-[15px] font-bold text-[#041B3C]">Tasks</h3>

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
              <div className="w-14 h-14 bg-[#D7E2FF] rounded-2xl flex items-center justify-center mb-2">
                <TasksEmptyIcon opacity={!isMobile ? "0.3" : "1"} />
              </div>
              <p className=" px-4 text-center sm:px-0  text-[16px] sm:text-[#041B3C] text-[#4F5F7B] font-medium">
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
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E5E7EB] hover:border-[#1A56DB]/30 hover:bg-[#F8FAFF] transition-all duration-150"
                >
                  <span className="text-[13px] font-medium text-[#041B3C]">
                    {task.title}
                  </span>
                  {task.status && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
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
