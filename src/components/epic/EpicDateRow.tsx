import { CalendarIcon, PenEditIcon } from "../ui/SvgIcons";
import { formatDate } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import useIsMobile from "../../hooks/useIsMobile";

export default function EpicDateRow({
  label,
  date,
  editable,
  loading,
  onDateChange,
}: {
  label: string;
  date?: string;
  editable?: boolean;
  loading?: boolean;
  onDateChange?: (val: string | null) => void;
}) {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.showPicker?.();
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onDateChange?.(val || null);
    setIsEditing(false);
  };

  if (editable && isEditing) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[var(--color-muted),var(--label-xsm-size)] font-semibold uppercase tracking-wider ">
          {label}
        </span>
        <input
          ref={inputRef}
          type="date"
          defaultValue={formatDate(date)}
          onChange={handleChange}
          onBlur={() => setIsEditing(false)}
          className="text-[13px] font-medium 
                     text-(--color-slate-dark-blue) 
                     border border-(--color-border) 
                     rounded-lg 
                     px-3 py-1.5 
                     bg-white 
                     focus:outline-none 
                     focus:ring-2 
                     focus:ring-(--color-primary)/30 
                     focus:border-(--color-primary) 
                     transition-all"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {loading ? (
        <div className="h-3 w-14 bg-(--color-surface-highest) animate-pulse rounded" />
      ) : (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
          {label}
        </span>
      )}
      <div
        className={`flex items-center gap-1.5 mt-0.5 ${
          editable ? "cursor-pointer group" : ""
        }`}
        onClick={() => editable && setIsEditing(true)}
        title={editable ? "Click to edit" : undefined}
      >
        {loading ? (
          <div className="w-4 h-4 bg-(--color-surface-highest) animate-pulse rounded" />
        ) : (
          <CalendarIcon
            color={isMobile ? "var(--color-primary)" : "var(--color-muted)"}
          />
        )}
        <span className="text-[14px] text-(--color-slate-dark-blue) font-medium ">
          {date ? formatDate(date) : "—"}
        </span>
        {editable && <PenEditIcon />}
      </div>
    </div>
  );
}
