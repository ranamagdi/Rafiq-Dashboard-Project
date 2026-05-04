import { ProjectTeamResponsiveIcon } from "../ui/SvgIcons";
import {STATUS_MAP} from '../utils/constants'


const StatusBadge = ({ status }: { status: string }) => {
  const current = STATUS_MAP[status] ?? {
    label: status.replace(/_/g, " "),
    style: "bg-gray-100 text-gray-600",
    dotColor: "bg-gray-400",
  };

  return (
    <>
      <div className={`hidden md:flex items-center justify-between px-3 py-2 rounded-md text-sm ${current.style}`}>
        <span>{current.label}</span>
        <ProjectTeamResponsiveIcon className="md:hidden" />
      </div>

      <span className={`md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${current.style}`}>
        <span className={`w-2 h-2 rounded-full ${current.dotColor}`} />
        {current.label}
      </span>
    </>
  );
};

export default StatusBadge;