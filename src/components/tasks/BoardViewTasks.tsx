import { useState, useCallback } from "react";
import BoardViewCard from "./BoardViewCard";
import type { Task, StatusVariant } from "../../types/apiTypes";
import BoardColumn from "./BoardColumn";
import { updateTask } from "../../services/endpoints";
import { COLUMNS } from "../utils/constants";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import type { DragState } from "../../types/apiTypes";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

type BoardViewTasksProps = {
  projectId: string;
  epicId?: string;
  searchTerm?: string;
  onTaskClick: (taskId: string, projectId: string) => void;
};

export default function BoardViewTasks({
  projectId,
  onTaskClick,
  searchTerm = "",
}: BoardViewTasksProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    movedIn: {},
    movedOut: new Set(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const mutation = useMutation({
    mutationFn: ({
      taskId,
      newStatus,
    }: {
      taskId: string;
      newStatus: StatusVariant;
      task: Task;
      currentStatus: string;
    }) => updateTask(taskId, { status: newStatus }),

    onMutate: ({ task, newStatus }) => {
      setDragState((prev) => {
        const nextMovedIn: Record<string, Task[]> = {};
        for (const [status, tasks] of Object.entries(prev.movedIn)) {
          const filtered = tasks.filter((t) => t.id !== task.id);
          if (filtered.length > 0) nextMovedIn[status] = filtered;
        }

        const updatedTask: Task = { ...task, status: newStatus as Task["status"] };
        nextMovedIn[newStatus] = [updatedTask, ...(nextMovedIn[newStatus] ?? [])];

        const nextMovedOut = new Set(prev.movedOut);
        nextMovedOut.add(task.id);

        return { movedIn: nextMovedIn, movedOut: nextMovedOut };
      });
    },

    onError: (_err, { task, currentStatus }) => {
      setDragState((prev) => {
        const nextMovedIn: Record<string, Task[]> = {};
        for (const [status, tasks] of Object.entries(prev.movedIn)) {
          const filtered = tasks.filter((t) => t.id !== task.id);
          if (filtered.length > 0) nextMovedIn[status] = filtered;
        }

        if (currentStatus !== task.status) {
          const revertedTask: Task = { ...task, status: currentStatus as Task["status"] };
          nextMovedIn[currentStatus] = [
            revertedTask,
            ...(nextMovedIn[currentStatus] ?? []),
          ];
        }

        const nextMovedOut = new Set(prev.movedOut);
        if (currentStatus === task.status) nextMovedOut.delete(task.id);

        return { movedIn: nextMovedIn, movedOut: nextMovedOut };
      });

      toast.error("Failed to move task. Reverted.");
    },
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);

      const { active, over } = event;
      if (!over) return;

      const task = active.data.current?.task as Task | undefined;
      if (!task) return;

      const newStatus = over.id as StatusVariant;

      const currentStatus =
        Object.entries(dragState.movedIn).find(([, tasks]) =>
          tasks.some((t) => t.id === task.id),
        )?.[0] ?? task.status;

      if (newStatus === currentStatus) return;

      mutation.mutate({ taskId: task.id, newStatus, task, currentStatus });
    },
    [mutation, dragState.movedIn],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 min-w-max h-full">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.id}
              col={col}
              projectId={projectId}
              onClick={onTaskClick}
              searchTerm={searchTerm}
              dragState={dragState}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeTask ? (
          <div style={{ transform: "rotate(2deg)", opacity: 0.92 }}>
            <BoardViewCard
              title={activeTask.title}
              date={activeTask.due_date ?? undefined}
              isDelayed={
                activeTask.status === "BLOCKED" ||
                activeTask.status === "REOPENED"
              }
              userName={activeTask.assignee?.name ?? ""}
              taskId={activeTask.id}
              projectId={projectId}
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}