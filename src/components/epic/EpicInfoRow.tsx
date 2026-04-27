import { getInitials } from "../utils/nameUtils";
import type { Member } from "../../types/apiTypes";
import { useEffect, useRef, useState } from "react";
import { PenEditIcon } from "../ui/SvgIcons";
export default function EpicInfoRow({
  label,
  name,
  color,
  bgColor,
  editable,
  members,
  loading,
  onSelect,
}: {
  label: string;
  name?: string;
  color?: string;
  bgColor?: string;
  editable?: boolean;
  members?: Member[];
  loading?: boolean;
  onSelect?: (memberId: string | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const initials = getInitials(name ?? "");

  useEffect(() => {
    if (isEditing) selectRef.current?.focus();
  }, [isEditing]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onSelect?.(val === "__unassigned__" ? null : val);
    setIsEditing(false);
  };

  if (editable && isEditing) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-(--label-xsm-size, --color-muted) font-semibold uppercase tracking-wider">
          {label}
        </span>
        <select
          ref={selectRef}
          defaultValue={name ?? "__unassigned__"}
          onChange={handleSelect}
          onBlur={() => setIsEditing(false)}
          className="text-(--label-speical-size,--color-slate-dark-blue) font-medium border border-(--color-border) rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30 focus:border-(--color-primary) transition-all"
        >
          <option value="__unassigned__">— Unassigned —</option>
          {members?.map((m) => (
            <option key={m.member_id} value={m.member_id}>
              {m.metadata.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {loading ? (
        <div className="h-3 w-16 bg-(--color-surface-highest) animate-pulse rounded" />
      ) : (
        <span className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider">
          {label}
        </span>
      )}
      <div
        className={`flex items-center gap-2 ${editable ? "cursor-pointer group" : ""}`}
        onClick={() => editable && setIsEditing(true)}
        title={editable ? "Click to edit" : undefined}
      >
        {loading ? (
          <div className="w-7 h-7 rounded-xl bg-(--color-surface-highest) animate-pulse" />
        ) : (
          name && (
            <div
              className={`w-7 h-7 text-[10px] rounded-xl flex items-center justify-center font-bold shrink-0`}
              style={{
                backgroundColor: bgColor ?? "#CDDDFF",
                color: color ?? "#51617E",
              }}
            >
              {initials}
            </div>
          )
        )}
        {loading ? (
          <div className="h-4 w-28 bg-(--color-surface-highest) animate-pulse rounded" />
        ) : (
          <span className="text-[14px] text-(--color-slate-dark-blue) font-medium">
            {name ?? "No Assignee"}
          </span>
        )}
        {editable && <PenEditIcon />}
      </div>
    </div>
  );
}
