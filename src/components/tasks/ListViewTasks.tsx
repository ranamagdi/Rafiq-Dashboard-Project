import { getInitials } from "../../components/utils/nameUtils";
import { formatDate } from "../utils/dateUtils";
import type { Task } from "../../types/apiTypes";
import { DotsIcon } from "../ui/SvgIcons";
import Button from "../ui/Button";
import { STATUS_STYLES, getAvatarColor } from "../utils/colorUtils";

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { bg: "#F3F4F6", label: status };
  return (
    <span
      className="text-[11px] px-3 py-1 rounded-sm font-bold uppercase"
      style={{ backgroundColor: style.bg, color: "#6B7280" }}
    >
      {style.label}
    </span>
  );
}

function AssigneeCell({ name }: { name: string }) {
  const initials = getInitials(name);
  const colors = getAvatarColor(name);
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {initials}
      </div>
      <span className="text-sm text-gray-700">{name}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 px-6 py-4 items-center border-b border-[#F3F4F6] ">
      <div className="col-span-2">
        <div className="h-3 w-12 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-3">
        <div className="h-3 w-32 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-2">
        <div className="h-5 w-16 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-2">
        <div className="h-3 w-20 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <div className="h-8 w-8 bg-(--color-surface-highest) animate-pulse rounded" />
        <div className="h-3 w-16 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-1" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 border-b border-[#F3F4F6] space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 w-16 bg-(--color-surface-highest) animate-pulse rounded" />
        <div className="h-5 w-16 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="h-5 w-48 bg-(--color-surface-highest) animate-pulse rounded" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-(--color-surface-highest) animate-pulse rounded" />
        <div className="space-y-1">
          <div className="h-2 w-14 bg-(--color-surface-highest) animate-pulse rounded" />
          <div className="h-3 w-20 bg-(--color-surface-highest) animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ListViewTasks({
  tasks = [],
  loading = false,
  error = null,
  pagination,
  onRowClick,
}: {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  pagination?: React.ReactNode;
  onRowClick: (taskId: string, projectId: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0px_1px_2px_0px_#0000000D] overflow-hidden">
      <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-[#E0E8FF4D]">
        <div className="col-span-2 text-[11px] font-bold text-[#434654] uppercase">
          Task ID
        </div>
        <div className="col-span-3 text-[11px] font-bold text-[#434654] uppercase">
          Title
        </div>
        <div className="col-span-2 text-[11px] font-bold text-[#434654] uppercase">
          Status
        </div>
        <div className="col-span-2 text-[11px] font-bold text-[#434654] uppercase">
          Due Date
        </div>
        <div className="col-span-2 text-[11px] font-bold text-[#434654] uppercase">
          Assignee
        </div>
        <div className="col-span-1" />
      </div>

      {error ? (
        <div className="p-6 text-center text-red-500">{error}</div>
      ) : loading ? (
        <>
          <div className="hidden md:block">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>

          <div className="md:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      ) : tasks.length === 0 ? (
        <div className="p-6 text-center text-gray-400">No tasks found</div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="border-b border-[#F3F4F6] last:border-0 cursor-pointer"
            onClick={() => onRowClick(task.id, task.project_id)}
          >
            <div className="hidden md:grid grid-cols-12 px-6 py-4 items-center hover:bg-[#F9FAFB] transition">
              <div className="col-span-2">
                <span className="text-sm font-medium text-(--color-primary) cursor-pointer hover:underline">
                  TASK-{task.id.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-(--color-slate-dark-blue)">
                  {task.title}
                </p>
              </div>
              <div className="col-span-2">
                <StatusBadge status={task.status} />
              </div>
              <div className="col-span-2 text-sm text-gray-500">
                {task.due_date ? formatDate(task.due_date) : "—"}
              </div>
              <div className="col-span-2">
                {task.assignee?.name ? (
                  <AssigneeCell name={task.assignee.name} />
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
              <div className="col-span-1 flex justify-end">
                <Button className="bg-transparent shadow-transparent"  onClick={(e) => e.stopPropagation()}>
                  <DotsIcon />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
      <div className="border-t border-[#F3F4F6] bg-white px-6 ">
        {pagination}
      </div>
    
    </div>
  );
}
