
import BoardViewCard from "./BoardViewCard";
import type { Task } from "../../types/apiTypes";
import { mergeRefs } from "../utils/helpers";
import {

  useDraggable,
  
} from "@dnd-kit/core";

 


export default function DraggableCard({
  task,
  projectId,
  onClick,
  lastRef,
}: {
  task: Task;
  projectId: string;
  onClick: (taskId: string, projectId: string) => void;
  lastRef?: React.Ref<HTMLDivElement>;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={mergeRefs(setNodeRef, lastRef)}
      className="mb-2.5"
      style={{ opacity: isDragging ? 0.35 : 1, transition: "opacity 150ms" }}
      {...listeners}
      {...attributes}
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
}
