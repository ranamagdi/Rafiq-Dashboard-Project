import { formatDate } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import type { StatusVariant } from "../../types/apiTypes";
import { getInitials } from "../utils/nameUtils";
import { getProjectEpic } from "../../services/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Icons ────────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.16667 11.6667C0.845833 11.6667 0.571181 11.5524 0.342708 11.324C0.114236 11.0955 0 10.8208 0 10.5V2.33333C0 2.0125 0.114236 1.73785 0.342708 1.50937C0.571181 1.2809 0.845833 1.16667 1.16667 1.16667H1.75V0H2.91667V1.16667H7.58333V0H8.75V1.16667H9.33333C9.65417 1.16667 9.92882 1.2809 10.1573 1.50937C10.3858 1.73785 10.5 2.0125 10.5 2.33333V10.5C10.5 10.8208 10.3858 11.0955 10.1573 11.324C9.92882 11.5524 9.65417 11.6667 9.33333 11.6667H1.16667ZM1.16667 10.5H9.33333V4.66667H1.16667V10.5ZM1.16667 3.5H9.33333V2.33333H1.16667V3.5Z"
      fill="#9CA3AF"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
      stroke="#6B7280"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const TasksEmptyIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="44" height="44" rx="10" fill="#E8EDF5" />
    <rect x="11" y="14" width="22" height="3" rx="1.5" fill="#C3CBD8" />
    <rect x="11" y="20" width="16" height="3" rx="1.5" fill="#C3CBD8" />
    <rect x="11" y="26" width="19" height="3" rx="1.5" fill="#C3CBD8" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Small reusable components ────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: "#DBEAFE", text: "#1D4ED8" },
  { bg: "#FCE7F3", text: "#BE185D" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

function Avatar({ name, avatar, size = "md" }: { name?: string; avatar?: string; size?: "sm" | "md" }) {
  const initials = getInitials(name ?? "");
  const { bg, text } = AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-[12px]";

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: bg, color: text }}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover rounded-xl" />
      ) : (
        initials
      )}
    </div>
  );
}

function MetaColumn({ label, name, avatar }: { label: string; name?: string; avatar?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">{label}</span>
      <div className="flex items-center gap-2">
        <Avatar name={name} avatar={avatar} size="sm" />
        <span className="text-[13px] font-semibold text-[#041B3C]">{name ?? "—"}</span>
      </div>
    </div>
  );
}

function DateColumn({ label, date }: { label: string; date?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">{label}</span>
      <div className="flex items-center gap-1.5 mt-0.5">
        <CalendarIcon />
        <span className="text-[13px] font-semibold text-[#041B3C]">{date ? formatDate(date) : "—"}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EpicDetailsPopup({
  title,
  description,
  createdAt,
  epicId,
  projectId,
  id,
  assigneeName,
  assigneeAvatar,
  createdBy,
  createdByAvatar,
  deadline,
  tasks = [],
  className,
  isOpen = true,
  onClose,
  onAddTask,
}: EpicCardProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [epic, setEpic] = useState<EpicData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch epic details when id or projectId changes
  useEffect(() => {
    if (!id || !projectId) return;

    let cancelled = false; // prevent state update if component unmounts mid-fetch

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
      cancelled = true; // cleanup: ignore stale response
    };
  }, [id, projectId]); // ✅ both deps included

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Merge fetched data with prop fallbacks
  const displayTitle       = loading ? "Loading..." : (epic?.title ?? title);
  const displayCreatedBy   = epic?.created_by?.name ?? createdBy;
  const displayAssigneeName  = epic?.assignee?.name ?? assigneeName;
  const displayAssigneeAvatar = epic?.assignee?.avatar ?? assigneeAvatar;
  const displayCreatedAt   = epic?.created_at ?? createdAt;
  const displayDeadline    = epic?.deadline ?? deadline;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(4, 27, 60, 0.35)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <div
        className={`
          relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(4,27,60,0.18)]
          w-full max-w-145 mx-4 flex flex-col overflow-hidden
          animate-[fadeSlideUp_0.22s_ease-out]
          ${className ?? ""}
        `}
        style={{ borderLeft: "4px solid #1A56DB" }}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-5">
          <div className="flex items-center justify-between mb-3">
            {epicId && (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" rx="4" fill="#1A56DB" />
                  <path d="M4 5h8M4 8h5M4 11h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#1A56DB]">
                  {epicId}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="ml-auto p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {title && (
            <h2 className="text-[22px] font-bold text-[#041B3C] leading-tight tracking-tight">
              {displayTitle}
            </h2>
          )}

          {description && (
            <p className="mt-3 text-[13.5px] text-[#6B7280] leading-relaxed">{description}</p>
          )}
        </div>

        <hr className="border-[#E5E7EB] mx-7" />

        {/* Meta info */}
        <div className="px-7 py-5 flex items-start gap-8 flex-wrap">
          <MetaColumn label="Created By" name={displayCreatedBy} avatar={createdByAvatar} />
          <MetaColumn label="Assignee" name={displayAssigneeName} avatar={displayAssigneeAvatar} />
          <DateColumn label="Created At" date={displayCreatedAt} />
          {displayDeadline && <DateColumn label="Deadline" date={displayDeadline} />}
        </div>

        <hr className="border-[#E5E7EB] mx-7" />

        {/* Tasks */}
        <div className="px-7 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-[#041B3C]">Tasks</h3>
            <button
              onClick={onAddTask}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1A56DB] hover:text-[#1344b0] transition-colors"
            >
              <PlusIcon />
              Add Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #F0F4FF 0%, #EEF2FB 100%)",
                border: "1.5px dashed #C7D2E8",
              }}
            >
              <TasksEmptyIcon />
              <p className="text-[13px] text-[#6B7280] font-medium">
                No tasks have been added to this epic yet
              </p>
              <button
                onClick={onAddTask}
                className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-[#1A56DB] hover:bg-[#1344b0] active:scale-[0.97] text-white text-[13px] font-semibold rounded-xl transition-all duration-150 shadow-[0_2px_12px_rgba(26,86,219,0.35)]"
              >
                <PlusIcon />
                Add Task
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E5E7EB] hover:border-[#1A56DB]/30 hover:bg-[#F8FAFF] transition-all duration-150"
                >
                  <span className="text-[13px] font-medium text-[#041B3C]">{task.title}</span>
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

        <div className="h-2" />
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}