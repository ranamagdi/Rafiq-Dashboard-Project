import { useRef } from "react";
import BoardViewCard from "./BoardViewCard";
import { PlusIcon, PlusRoundedIcon } from "../ui/SvgIcons";
import type { StatusVariant, Task } from "../../types/apiTypes";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import { getProjectTasks } from "../../services/endpoints";

type Column = {
  id: string;
  label: string;
  status: StatusVariant;
  dotColor: string;
  badgeClass: string;
};

const COLUMNS: Column[] = [
  { id: "todo",        label: "TO DO",          status: "TO_DO",                dotColor: "#6b7280", badgeClass: "bg-gray-100 text-gray-600"    },
  { id: "in_progress", label: "IN PROGRESS",    status: "IN_PROGRESS",          dotColor: "#3b82f6", badgeClass: "bg-blue-100 text-blue-700"    },
  { id: "in_review",   label: "IN REVIEW",      status: "IN_REVIEW",            dotColor: "#8b5cf6", badgeClass: "bg-violet-100 text-violet-700" },
  { id: "ready_qa",    label: "READY FOR QA",   status: "READY_FOR_QA",         dotColor: "#f59e0b", badgeClass: "bg-amber-100 text-amber-700"  },
  { id: "blocked",     label: "BLOCKED",        status: "BLOCKED",              dotColor: "#ef4444", badgeClass: "bg-red-100 text-red-700"      },
  { id: "ready_prod",  label: "READY FOR PROD", status: "READY_FOR_PRODUCTION", dotColor: "#06b6d4", badgeClass: "bg-cyan-100 text-cyan-700"    },
  { id: "reopened",    label: "REOPENED",       status: "REOPENED",             dotColor: "#f97316", badgeClass: "bg-orange-100 text-orange-700" },
  { id: "done",        label: "DONE",           status: "DONE",                 dotColor: "#22c55e", badgeClass: "bg-green-100 text-green-700"  },
];

type BoardViewTasksProps = {
  projectId: string;
  epicId?: string;
  onTaskClick: (taskId: string, projectId: string) => void;
};

function BoardColumn({
  col,
  projectId,
  onClick,
}: {
  col: Column;
  projectId: string;
  onClick: (taskId: string, projectId: string) => void;
}) {
  const navigate = useNavigate();

  // Ref attached to the scroll container div.
  // Passed as `root` so the IntersectionObserver fires when the last card
  // enters THIS div's viewport, not the page viewport.
  const scrollRef = useRef<HTMLDivElement>(null);
const { items, loading, hasMore, lastElementRef } = usePagination<Task>({
  mode: "infinite",
  root: scrollRef,  // ✅ pass the RefObject, not scrollRef.current
  fetchFn: async (limit, offset) => {
    const res = await getProjectTasks(projectId, col.status, limit, offset);
    const contentRange = res.headers.get("content-range");
    const total = contentRange
      ? parseInt(contentRange.split("/")[1], 10)
      : (res.data?.length ?? 0);

    return { data: res.data ?? [], total };
  },
});
  return (
    <div className="flex flex-col min-w-62.5 h-full">

      {/* ① Header — always visible, never scrolls */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: col.dotColor }} />
          <span className="text-[11px] font-bold tracking-widest uppercase text-gray-500">
            {col.label}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${col.badgeClass}`}>
            {loading && items.length === 0 ? "..." : items.length}
          </span>
        </div>
        <Button
          className="bg-transparent text-gray-400 shadow-transparent px-0"
          onClick={() =>
            navigate(`/dashboard/project/${projectId}/tasks/new?status=${col.status}`)
          }
        >
          <PlusIcon />
        </Button>
      </div>

      {/* ② Add task button — pinned above scroll, never scrolls */}
      <Button
        onClick={() =>
          navigate(`/dashboard/project/${projectId}/tasks/new?status=${col.status}`)
        }
        className="shrink-0 bg-transparent gap-2 w-full border-2 border-dashed border-gray-200 px-3 py-3 text-gray-500 hover:border-gray-400 transition mb-3"
      >
        <PlusRoundedIcon />
        ADD NEW TASK
      </Button>

      {/* ③ Scroll container — this is the IntersectionObserver root */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 pr-1">
        {loading && items.length === 0 ? (
          <div className="space-y-2">
            <div className="h-12 bg-(--color-surface-highest) animate-pulse rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-(--color-surface-highest) animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <>
            {items.map((task, index) => {
              const isLast = index === items.length - 1;
              return (
                <div
                  key={task.id}
                  className="mb-2.5"
                  ref={isLast ? lastElementRef : null}
                >
                  <BoardViewCard
                    title={task.title}
                    date={task.due_date ?? undefined}
                    isDelayed={task.status === "BLOCKED" || task.status === "REOPENED"}
                    userName={task.assignee?.name ?? ""}
                    taskId={task.id}
                    projectId={projectId}
                    onClick={onClick}
                  />
                </div>
              );
            })}
            {loading && hasMore && (
              <div className="h-20 bg-(--color-surface-highest) animate-pulse rounded mb-2.5" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BoardViewTasks({ projectId, onTaskClick }: BoardViewTasksProps) {
  return (
    // h-full inherits bounded height passed down from Tasks.tsx
    // overflow-x-auto: horizontal scroll to reach all 8 columns
    // overflow-y-hidden: no page-level vertical scroll — only columns scroll
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex gap-6 min-w-max h-full">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.id}
            col={col}
            projectId={projectId}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
}