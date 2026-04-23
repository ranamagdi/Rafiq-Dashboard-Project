import { formatDate } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import type { StatusVariant } from "../../types/apiTypes";
import { getInitials } from "../utils/nameUtils";
import { getProjectEpic } from "../../services/endpoints";
import Button from "../ui/Button";
import useIsMobile from "../../hooks/useIsMobile";
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

const CalendarIcon: React.FC<{ color?: string }> = ({ color }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 11 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.16667 11.6667C0.845833 11.6667 0.571181 11.5524 0.342708 11.324C0.114236 11.0955 0 10.8208 0 10.5V2.33333C0 2.0125 0.114236 1.73785 0.342708 1.50937C0.571181 1.2809 0.845833 1.16667 1.16667 1.16667H1.75V0H2.91667V1.16667H7.58333V0H8.75V1.16667H9.33333C9.65417 1.16667 9.92882 1.2809 10.1573 1.50937C10.3858 1.73785 10.5 2.0125 10.5 2.33333V10.5C10.5 10.8208 10.3858 11.0955 10.1573 11.324C9.92882 11.5524 9.65417 11.6667 9.33333 11.6667H1.16667ZM1.16667 10.5H9.33333V4.66667H1.16667V10.5ZM1.16667 3.5H9.33333V2.33333H1.16667V3.5Z"
      fill={color || "#9CA3AF"}
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
      stroke="#6B7280"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const TasksEmptyIcon: React.FC<{ opacity?: string }> = ({ opacity }) => (
  <svg
    width="18"
    height="16"
    viewBox="0 0 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 15V13H18V15H6ZM6 9V7H18V9H6ZM6 3V1H18V3H6ZM2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12C2.55 12 3.02083 12.1958 3.4125 12.5875C3.80417 12.9792 4 13.45 4 14C4 14.55 3.80417 15.0208 3.4125 15.4125C3.02083 15.8042 2.55 16 2 16ZM2 10C1.45 10 0.979167 9.80417 0.5875 9.4125C0.195833 9.02083 0 8.55 0 8C0 7.45 0.195833 6.97917 0.5875 6.5875C0.979167 6.19583 1.45 6 2 6C2.55 6 3.02083 6.19583 3.4125 6.5875C3.80417 6.97917 4 7.45 4 8C4 8.55 3.80417 9.02083 3.4125 9.4125C3.02083 9.80417 2.55 10 2 10ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4Z"
      fill="#041B3C"
      fill-opacity={opacity || "0.3"}
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 1V13M1 7H13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

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
                  <svg
                    className="hidden md:block"
                    width="20"
                    height="14"
                    viewBox="0 0 20 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 10V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2C2.55 2 3.02083 2.19583 3.4125 2.5875C3.80417 2.97917 4 3.45 4 4V10C4 10.55 3.80417 11.0208 3.4125 11.4125C3.02083 11.8042 2.55 12 2 12C1.45 12 0.979167 11.8042 0.5875 11.4125C0.195833 11.0208 0 10.55 0 10ZM7 14C6.45 14 5.97917 13.8042 5.5875 13.4125C5.19583 13.0208 5 12.55 5 12V2C5 1.45 5.19583 0.979167 5.5875 0.5875C5.97917 0.195833 6.45 0 7 0H13C13.55 0 14.0208 0.195833 14.4125 0.5875C14.8042 0.979167 15 1.45 15 2V12C15 12.55 14.8042 13.0208 14.4125 13.4125C14.0208 13.8042 13.55 14 13 14H7ZM16 10V4C16 3.45 16.1958 2.97917 16.5875 2.5875C16.9792 2.19583 17.45 2 18 2C18.55 2 19.0208 2.19583 19.4125 2.5875C19.8042 2.97917 20 3.45 20 4V10C20 10.55 19.8042 11.0208 19.4125 11.4125C19.0208 11.8042 18.55 12 18 12C17.45 12 16.9792 11.8042 16.5875 11.4125C16.1958 11.0208 16 10.55 16 10Z"
                      fill="#003D9B"
                    />
                  </svg>

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
