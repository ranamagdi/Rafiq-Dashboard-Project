import { formatDate } from "../utils/dateUtils";
import { getInitials } from "../utils/nameUtils";
import { CalendarIcon, DenagerIcon } from "../ui/SvgIcons";

type BoardViewCardProps = {
  title: string;
  date?: string | Date;
  isDelayed?: boolean;
  userName: string;

  taskId: string;
  projectId: string;

  onClick: (taskId: string, projectId: string) => void;
};

export default function BoardViewCard({
  title,
  date,
  isDelayed = false,
  userName,
  taskId,
  projectId,
  onClick,
}: BoardViewCardProps) {
  const today = new Date();
  const parsedDate = date ? new Date(date) : null;

  const isToday =
    parsedDate && parsedDate.toDateString() === today.toDateString();

  const getDateLabel = () => {
    if (!parsedDate) return "";

    if (isDelayed) return "DELAYED";
    if (isToday) return "TODAY";

    return formatDate(parsedDate, { short: true });
  };

  return (
    <>
      <div
        onClick={() => onClick(taskId, projectId)}
        className={`p-4 rounded-2xl   relative  
        border-4 border-transparent  shadow-[0px_1px_2px_0px_#0000000D]
        hover:shadow-[0_4px_24px_rgba(4,27,60,0.08)] transition-all duration-200 cursor-pointer
        flex flex-col gap-0 overflow-hidden
      ${isDelayed ? "bg-[#FFDAD633] border-(--color-error)-200" : "bg-white"}`}
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3.5px] rounded-xl ${
            isToday ? "bg-(--color-primary)" : ""
          }`}
        />
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-gray-800">{title}</h3>

          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--color-surface-highest) text-(--color-primary) text-xs font-semibold">
            {getInitials(userName)}
          </div>
        </div>

        <div className="mt-4 text-xs font-medium flex gap-2 items-center">
          {isDelayed ? (
            <DenagerIcon className="text-red-600" />
          ) : (
            <CalendarIcon
              color={isToday ? "var(--color-primary)" : "currentColor"}
            />
          )}

          <span
            className={
              isDelayed
                ? "text-red-600 font-medium"
                : isToday
                  ? "text-(--color-primary) font-semibold"
                  : "text-gray-600"
            }
          >
            {getDateLabel()}
          </span>
        </div>
      </div>
    </>
  );
}
