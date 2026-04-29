import BoardViewCard from "./BoardViewCard";
import type { Task } from "../../types/apiTypes";
import { PlusIcon, PlusRoundedIcon } from "../ui/SvgIcons";
import type { StatusVariant } from "../../types/apiTypes";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
type Column = {
  id: string;
  label: string;
  status: StatusVariant;
  dotColor: string;
  badgeClass: string;
};

const COLUMNS: Column[] = [
  {
    id: "todo",
    label: "TO DO",
    status: "TO_DO",
    dotColor: "#6b7280",
    badgeClass: "bg-gray-100 text-gray-600",
  },
  {
    id: "in_progress",
    label: "IN PROGRESS",
    status: "IN_PROGRESS",
    dotColor: "#3b82f6",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    id: "in_review",
    label: "IN REVIEW",
    status: "IN_REVIEW",
    dotColor: "#8b5cf6",
    badgeClass: "bg-violet-100 text-violet-700",
  },
  {
    id: "ready_qa",
    label: "READY FOR QA",
    status: "READY_FOR_QA",
    dotColor: "#f59e0b",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  {
    id: "blocked",
    label: "BLOCKED",
    status: "BLOCKED",
    dotColor: "#ef4444",
    badgeClass: "bg-red-100 text-red-700",
  },
  {
    id: "ready_prod",
    label: "READY FOR PROD",
    status: "READY_FOR_PRODUCTION",
    dotColor: "#06b6d4",
    badgeClass: "bg-cyan-100 text-cyan-700",
  },
  {
    id: "reopened",
    label: "REOPENED",
    status: "REOPENED",
    dotColor: "#f97316",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  {
    id: "done",
    label: "DONE",
    status: "DONE",
    dotColor: "#22c55e",
    badgeClass: "bg-green-100 text-green-700",
  },
];
type BoardViewTasksProps = {
  tasks: Record<StatusVariant, Task[]>;
   projectId: string;
  epicId?: string;
};

export default function BoardViewTasks({
  tasks,
  projectId,
  epicId,
}: BoardViewTasksProps ) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks?.[col.status] ?? [];

        return (
          <div key={col.id}>
            <div className="flex items-center justify-between  mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-1.75 h-1.75 rounded-full"
                  style={{ background: col.dotColor }}
                />
                <span className="text-[11px] font-bold tracking-widest uppercase text-gray-500">
                  {col.label}
                </span>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${col.badgeClass}`}
                >
                  {colTasks.length}
                </span>
              </div>

              <Button
                className="bg-transparent text-gray-400 shadow-transparent px-0"
                onClick={() =>
                  navigate(
                    `/dashboard/project/${projectId}/${epicId ?? "none"}/${col.status}/tasks/new`,
                  )
                }
              >
                <PlusIcon />
              </Button>
            </div>

            <Button
              onClick={() =>
                navigate(
                  `/dashboard/project/${projectId}/${epicId ?? "none"}/${col.status}/tasks/new`,
                )
              }
              className="mt-5 bg-transparent gap-2 w-full border-2 border-dashed border-gray-200 px-3 py-3 text-gray-500  hover:border-gray-400 transition mb-4"
            >
              <PlusRoundedIcon />
              ADD NEW TASK
            </Button>

            {colTasks.map((task) => (
              <div key={task.id} className="mb-2.5">
                <BoardViewCard
                  title={task.title}
                  date={task.due_date}
                  isDelayed={
                    task.status === "BLOCKED" || task.status === "REOPENED"
                  }
                  userName={task.assignee?.name ?? ""}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
