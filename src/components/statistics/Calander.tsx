import { useState } from "react";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isBetween,
  isSameDay,
} from "../utils/helpers";
import type { DateRange } from "../../types/apiTypes";
import { DAYS } from "../utils/constants";
import Button from "../ui/Button";
import { getDaysDiff } from "../utils/helpers";
export default function Calendar({
  range,
  onSelect,
  onCancel,
  onApply,
  error,
}: {
  range: DateRange;
  onSelect: (date: Date) => void;
  onCancel: () => void;
  onApply: () => void;
  error?: string | null;
}) {
const today = new Date();
  // Reset time to midnight for accurate day comparison
  today.setHours(0, 0, 0, 0); 
  const [viewYear, setViewYear] = useState(
    range.start?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    range.start?.getMonth() ?? today.getMonth(),
  );

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(viewYear, viewMonth, d));

  return (
    <div className="w-auto sm:w-100">
      <div className="flex justify-between items-center mb-3.5">
        <span className="font-semibold text-[15px] text-slate-800">
          {monthName}
        </span>
        <div className="flex">
          <Button
            variant="text"
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center text-base text-slate-600 cursor-pointer leading-none border-none"
          >
            ‹
          </Button>
          <Button
            variant="text"
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center text-base text-slate-600 cursor-pointer leading-none border-none"
          >
            ›
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-semibold text-slate-400 py-1 tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

     <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const MAX_RANGE = 7;
          
          // 1. Check if date is in the past
          const isPast = date < today;

          // 2. Check Range constraints (existing logic)
          let isOutOfRange = false;
          if (range.start && !range.end) {
            const diff = getDaysDiff(range.start, date);
            if (diff > MAX_RANGE - 1 || date < range.start) {
              isOutOfRange = true;
            }
          }

          // Combined disabled state
          const isDisabled = isPast || isOutOfRange;

          const isStart = range.start && isSameDay(date, range.start);
          const isEnd = range.end && isSameDay(date, range.end);
          const inRange = range.start && range.end && isBetween(date, range.start, range.end);
          const isToday = isSameDay(date, today);

          const cellClass = [
            "flex items-center justify-center h-[34px] text-[13px] select-none transition-colors duration-[120ms]",
         
            isDisabled
              ? "text-slate-300 cursor-not-allowed opacity-40 blur-[0.5px]" 
              : "cursor-pointer",
            isStart || isEnd
              ? "bg-blue-100 text-[var(--color-primary)] rounded-lg font-bold"
              : inRange
                ? "bg-blue-100 text-[var(--color-primary)] rounded font-bold"
                : isToday
                  ? "border-[1.5px] border-[var(--color-primary)] rounded-lg text-[var(--color-primary)] font-bold"
                  : "text-slate-700",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <Button
              key={date.toISOString()}
              onClick={() => !isDisabled && onSelect(date)}
              className={cellClass}
              variant="text"
              // Ensure button is physically disabled for accessibility
              disabled={isDisabled} 
            >
              {date.getDate()}
            </Button>
          );
        })}
      </div>

      {error && <div className="text-red-500 text-xs mt-2 px-1">{error}</div>}
      <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-slate-100">
        <Button
          variant="text"
          onClick={onCancel}
          className="bg-transparent border-none text-slate-500 text-sm font-medium cursor-pointer px-3 py-1.5"
        >
          Cancel
        </Button>
        <Button onClick={onApply} disabled={!range.start || !range.end}>
          Apply Range
        </Button>
      </div>
    </div>
  );
}
