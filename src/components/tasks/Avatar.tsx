import { getInitials } from "../utils/nameUtils";

const Avatar = ({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) => (
  <div
    className={`rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold shrink-0 ${
      size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs"
    }`}
  >
    {getInitials(name)}
  </div>
);

export default Avatar;