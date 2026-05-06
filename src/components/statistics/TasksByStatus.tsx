import { STATUS_MAP } from "../utils/constants";
import type { StatusVariant } from "../../types/apiTypes";

type TaskStatusItem = {
  status: StatusVariant;
  count: number;
};

type TasksByStatusProps = {
  data: TaskStatusItem[];
};

export default function TasksByStatus({ data }: TasksByStatusProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  // Build conic-gradient segments from real data
  const gradient = (() => {
    if (!total) return "#f1f5f9";
    const GAP = 2; // degrees gap between segments
    let cursor = 0;
    const segments: string[] = [];

    data.forEach((item, i) => {
      const color = STATUS_MAP[item.status]?.color ?? "#ccc";
      const slice = (item.count / total) * 360;
      const start = cursor;
      const end = cursor + slice - (i < data.length - 1 ? GAP : 0);
      segments.push(`${color} ${start}deg ${end}deg`);
      if (i < data.length - 1) {
        segments.push(`#f1f5f9 ${end}deg ${end + GAP}deg`);
      }
      cursor += slice;
    });

    return segments.join(", ");
  })();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-8 w-full max-w-md">
      <h2 className="text-xl font-bold text-[#001737] mb-10">
        Tasks by Status
      </h2>

      <div className="flex items-center justify-between gap-8">

        {/* Donut chart */}
        <div className="relative flex items-center justify-center w-40 h-40 shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${gradient})`,
              maskImage: "radial-gradient(transparent 62%, black 64%)",
              WebkitMaskImage: "radial-gradient(transparent 62%, black 64%)",
            }}
          />
          <div className="text-center z-10">
            <p className="text-4xl font-black text-[#001737] leading-none">
              {total}
            </p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">
              Total
            </p>
          </div>
        </div>

        {/* Legend + bars */}
        <div className="flex-1 space-y-5">
          {data.map((item) => {
            const map = STATUS_MAP[item.status];
            const color = map?.color ?? "#ccc";
            const label = map?.label ?? item.status;

            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-[13px] font-bold">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-slate-500">{label}</span>
                  </div>
                  <span className="text-[#001737]">{item.count}</span>
                </div>

                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: total ? `${(item.count / total) * 100}%` : "0%",
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}