import {type ViewOption } from "../utils/constants";
export function ViewOptionLabel({ data }: { data: ViewOption }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img
        src={data.icon}
        style={{ width: "16px", height: "16px" }}
        alt={data.label}
      />
      <span>{data.label}</span>
    </div>
  );
}