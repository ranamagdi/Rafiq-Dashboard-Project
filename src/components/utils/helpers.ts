
import { formatDate } from "../utils/dateUtils";
import type{DateRange} from '../../types/apiTypes'
export function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.RefObject<T | null>).current = node;
    }
  };
}

export function formatRangeLabel(range: DateRange): string {
  if (!range.start) return "Select date range";
  if (!range.end) return formatDate(range.start);
  const startStr = range.start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = range.end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBetween(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  return t > start.getTime() && t < end.getTime();
}

export function getDaysDiff(start: Date, end: Date) {
  const diff = Math.abs(end.getTime() - start.getTime());
  return diff / (1000 * 60 * 60 * 24);
}
export function getCurrentWeekRange() {
  const now = new Date();

  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday

  return { start, end };
}