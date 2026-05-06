import { ListIcon, CheckIcon, DenagerIcon } from "../ui/SvgIcons";

type TotalInfoProps = {
  total: number;
  completed: number;
  overdue: number;
};

type CardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  bg?: string;
};

function InfoCard({
  label,
  value,
  icon,
  color = "text-gray-900",
  bg,
}: CardProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl px-5 py-7 w-full">
      <div>
        <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
          {label}
        </p>
        <p className={`text-2xl font-bold mt-4 ${color}`}>{value}</p>
      </div>

      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${
          bg || "bg-gray-200"
        }`}
      >
        {icon}
      </div>
    </div>
  );
}

export default function TotalInfo({
  total,
  completed,
  overdue,
}: TotalInfoProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      <InfoCard label="Total Tasks"  bg="bg-[#0052CC1A]"  value={total} icon={<ListIcon />} />

      <InfoCard
        label="Completed Tasks"
        value={completed}
         bg="bg-[#0068441A]" 
        icon={<CheckIcon color="#004E32"/>}
      />

      <InfoCard
        label="Overdue Tasks"
        value={overdue}
         bg="bg-[#FFDAD633]" 
        icon={<DenagerIcon />}
        color="text-red-600"
      />
    </div>
  );
}
