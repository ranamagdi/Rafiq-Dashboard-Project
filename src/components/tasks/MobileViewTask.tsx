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

type Props = {
  task: Task;
  onClick: (taskId: string, projectId: string) => void;
};

export function MobileViewTask({ task ,onClick}: Props) {
  return (
    <div
      className="md:hidden px-4 py-4 hover:bg-[#F9FAFB] transition bg-white "
      onClick={() => onClick(task.id, task.project_id)}
    >
  
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-(--color-primary)">
          TASK-{task.id.slice(0, 4).toUpperCase()}
        </span>

        <StatusBadge status={task.status} />
      </div>

      <p className="text-[17px] font-semibold text-(--color-slate-dark-blue) mb-3">
        {task.title}
      </p>

      <div className="flex items-center gap-3">
        {task.assignee?.name ? (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              backgroundColor: getAvatarColor(task.assignee.name).bg,
              color: getAvatarColor(task.assignee.name).text,
            }}
          >
            {getInitials(task.assignee.name)}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400 shrink-0">
            ?
          </div>
        )}

        <div className="flex justify-between w-full">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              Due Date
            </p>
            <p className="text-sm text-gray-600">
              {task.due_date ? formatDate(task.due_date) : "—"}
            </p>
          </div>

          <Button className="bg-transparent shadow-transparent p-0">
            <DotsIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
