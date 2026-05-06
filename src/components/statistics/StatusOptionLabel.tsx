
import type {  StatusOption } from "../../types/apiTypes";
import { STATUS_MAP } from "../utils/constants";


export default function StatusOptionLabel({ option }: { option: StatusOption }) {
  if (option.value === "all") {
    return (
      <span className="text-[13px] font-medium text-black">
        {option.label}
      </span>
    );
  }

  const status = option.value as keyof typeof STATUS_MAP;
  const config = STATUS_MAP[status];

  return (
    <div className="flex items-center gap-1.75">
      <span className={`inline-block w-2 h-2 rounded-full ${config.dotColor}`} />
      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${config.style}`}>
        {config.label}
      </span>
    </div>
  );
}