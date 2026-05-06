import { NoTasks } from "../ui/SvgIcons";
import type { CalendarStatsResponse } from "../../types/apiTypes";
import { DAYS, STATUS_MAP } from "../utils/constants";

type DayTask = {
  day: string;
  date: number;
  month: string;
  isToday?: boolean;
  tasks: {
    label: string;
    count: number;
    style: string;
    isInProgress: boolean;
  }[];
};

type DaysTasksProps = {
  data: CalendarStatsResponse | null;
};

export default function DaysTasks({ data }: DaysTasksProps) {
  const days: DayTask[] = (data?.daily ?? []).map((entry) => {
    const date = new Date(entry.day);
    const isToday = date.toDateString() === new Date().toDateString();

    const tasks = Object.entries(entry.statuses).map(([status, count]) => ({
      label: STATUS_MAP[status]?.label ?? status.replace(/_/g, " "),
      count: count as number,
      style: STATUS_MAP[status]?.style ?? "bg-gray-50 text-gray-500",
      isInProgress: status === "IN_PROGRESS",
    }));

    return {
      day: DAYS[date.getDay()],
      date: date.getDate(),
      month: date.toLocaleString("en-US", { month: "short" }),
      isToday,
      tasks,
    };
  });

  if (!data) {
    return (
      <div className="flex items-center justify-center w-full my-10 h-40 text-gray-400 text-sm font-semibold uppercase tracking-widest">
        Select a date range to view tasks
      </div>
    );
  }

  return (
    <>

      <div className="hidden md:grid grid-cols-7 gap-4 w-full my-10 items-stretch">
        {days.map((item, idx) => (
           <div
            key={idx}
            className={`relative flex flex-col rounded-2xl bg-white p-4 min-h-100 transition-all ${
              item.isToday
                ? "border-2 border-(--color-primary) shadow-[0_0_0_4px_rgba(0,82,204,0.08)]"
                : "border border-gray-100"
            }`}
          
          >
            {item.isToday && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-(--color-primary) text-white text-[10px] font-semibold px-4 py-1 rounded-full z-10">
                TODAY
              </div>
            )}

            <div className="mb-6">
              <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                {item.day}
              </p>
              <p className="text-lg font-bold text-[#1a2b4b]">
                {item.date} {item.month}
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {item.tasks.map((task, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-2.5 py-2 text-[10px] font-semibold tracking-tight ${task.style} ${
                    task.isInProgress
                      ? "border-l-[3px] border-(--color-primary) rounded-r-md"
                      : "rounded-md"
                  }`}
                >
                  <span className="uppercase leading-tight flex-1 mr-1">
                    {task.label}
                  </span>
                  <span className="text-[12px] shrink-0">{task.count}</span>
                </div>
              ))}
            </div>

            {!item.tasks.length && (
              <div className="mt-auto flex flex-col items-center pb-8 opacity-35">
                <NoTasks />
                <p className="mt-2 text-[10px] font-black text-gray-400 tracking-[0.15em] uppercase">
                  No Tasks
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

    
      <div className="md:hidden flex flex-col gap-2 w-full my-6">
        {days.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center rounded-2xl bg-(--color-surface-low) px-4 py-3 min-h-16 transition-all ${
              item.isToday
                ? "border-2 border-(--color-primary) shadow-[0_0_0_4px_rgba(0,82,204,0.08)]"
                : "border border-gray-100"
            }`}
          >
            <div className="w-14 shrink-0">
              <p className="text-[11px] font-semibold text-gray-400 tracking-wide uppercase">
                {item.day}
              </p>
              <p className="text-2xl font-semibold text-[#1a2b4b] leading-tight">
                {item.date}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 flex-1 px-3">
              {item.tasks.length ? (
                item.tasks.map((task, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${task.style}`}
                  >
                    <span className="uppercase">{task.label}</span>
                    <span className="text-[12px] font-bold">{task.count}</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  No Tasks
                </span>
              )}
            </div>

            {item.isToday && (
              <span className="bg-(--color-primary) text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                TODAY
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}