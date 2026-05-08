import { useRef, useEffect } from "react";
import { PlusIcon, PlusRoundedIcon } from "../ui/SvgIcons";
import type { Task, Column } from "../../types/apiTypes";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import { getProjectTasks } from "../../services/endpoints";
import type { DragState } from "../../types/apiTypes";
import { mergeRefs } from "../utils/helpers";
import DraggableCard from "./DraggableCard";
import { useDroppable } from "@dnd-kit/core";

export default function BoardColumn({
  col,
  projectId,
  onClick,
  searchTerm = "",
  dragState,
}: {
  col: Column;
  projectId: string;
  searchTerm?: string;
  onClick: (taskId: string, projectId: string) => void;
  dragState: DragState;
}) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({ id: col.status });

  const {
    items: rawItems,
    loading,
    hasMore,
    lastElementRef,
    setSearchTerm: setColSearch,
  } = usePagination<Task>({
    mode: "infinite",
    root: scrollRef,
    fetchFn: async (limit, offset, term) => {
      const res = await getProjectTasks(
        projectId,
        col.status,
        limit,
        offset,
        term,
      );
      const contentRange = res.headers.get("content-range");
      const total = contentRange
        ? parseInt(contentRange.split("/")[1], 10)
        : (res.data?.length ?? 0);
      return { data: res.data ?? [], total };
    },
  });

  const ownItems = rawItems.filter((t) => !dragState.movedOut.has(t.id));
  const injected = dragState.movedIn[col.status] ?? [];
  const items = [...injected, ...ownItems];

  const prevSearchTerm = useRef<string | null>(null);
  useEffect(() => {
    if (prevSearchTerm.current === null) {
      prevSearchTerm.current = searchTerm;
      return;
    }
    prevSearchTerm.current = searchTerm;
    setColSearch(searchTerm);
  }, [searchTerm, setColSearch]);

  return (
    <div className="flex flex-col min-w-62.5 h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: col.dotColor }}
          />
          <span className="text-[11px] font-bold tracking-widest uppercase text-gray-500">
            {col.label}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${col.badgeClass}`}
          >
            {loading && items.length === 0 ? "..." : items.length}
          </span>
        </div>
        <Button
          className="bg-transparent text-gray-400 shadow-transparent px-0"
          onClick={() =>
            navigate(
              `/dashboard/project/${projectId}/tasks/new?status=${col.status}`,
            )
          }
        >
          <PlusIcon />
        </Button>
      </div>

      <Button
        onClick={() =>
          navigate(
            `/dashboard/project/${projectId}/tasks/new?status=${col.status}`,
          )
        }
        className="shrink-0 bg-transparent gap-2 w-full border-2 border-dashed border-gray-200 px-3 py-3 text-gray-500 hover:border-gray-400 transition mb-3"
      >
        <PlusRoundedIcon />
        ADD NEW TASK
      </Button>

      <div
        ref={mergeRefs(setNodeRef, scrollRef)}
        className="flex-1 overflow-y-auto min-h-0 pr-1 rounded-md transition-colors duration-150"
        style={
          isOver
            ? {
                backgroundColor:
                  "color-mix(in srgb, var(--color-primary, #6366f1) 8%, transparent)",
                outline:
                  "2px dashed color-mix(in srgb, var(--color-primary, #6366f1) 40%, transparent)",
                outlineOffset: "-2px",
              }
            : {}
        }
      >
        {loading && items.length === 0 ? (
          <div className="space-y-2">
            <div className="h-12 bg-(--color-surface-highest) animate-pulse rounded" />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-(--color-surface-highest) animate-pulse rounded"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
            <span className="font-medium">No tasks found</span>
            {searchTerm && (
              <span className="text-xs mt-1">Try adjusting your search</span>
            )}
          </div>
        ) : (
          <>
            {items.map((task, index) => {
              const isLast = index === items.length - 1;
              return (
                <DraggableCard
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  onClick={onClick}
                  lastRef={isLast ? lastElementRef : undefined}
                />
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