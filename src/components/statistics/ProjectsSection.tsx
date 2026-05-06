import type { ProjectStatItem } from "../../types/apiTypes";

type ProjectsSectionProps = {
  data: ProjectStatItem[];
}

export default function ProjectsSection({ data }: ProjectsSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-8 w-full max-w-md mb-15 sm:mb-0">
      <h2 className="text-xl font-bold text-[#001737] mb-8">
        All Projects
      </h2>

      <div className="space-y-6 ">
        {data.map((project, index) => (
          <div
            key={index}
            className="flex items-center justify-between group cursor-pointer"
          >
            <span className="text-[15px] font-semibold text-slate-500 group-hover:text-[#001737] transition-colors">
              {project.project_name}
            </span>

            <span className="text-[15px] font-bold text-[#001737]">
              {project.tasks_count} Tasks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}