import { useState } from "react";
import FilterSection from "../../../components/statistics/FilterSection";
import TotalInfo from "../../../components/statistics/TotalInfo";
import ProjectsSection from "../../../components/statistics/ProjectsSection";
import TasksByStatus from "../../../components/statistics/TasksByStatus";
import DaysTasks from "../../../components/statistics/DaysTasks";
import type {
  CalendarStatsResponse,
  ProjectStatItem,
  StatusVariant,
} from "../../../types/apiTypes";

export default function Statistics() {
  const [calendarData, setCalendarData] =
    useState<CalendarStatsResponse | null>(null);
  const [projectData, setProjectData] = useState<ProjectStatItem[]>([]);

  function handleDataFetched(
    calendar: CalendarStatsResponse,
    projects: ProjectStatItem[]
  ) {
    setCalendarData(calendar);
    setProjectData(projects);
  }

  // Derive TasksByStatus data from totals
  const tasksByStatus = Object.entries(calendarData?.totals ?? {}).map(
    ([status, count]) => ({
      status: status as StatusVariant,
      count: count as number,
    })
  );

  return (
    <div className="py-4 px-4">
      <div className="grid grid-cols-12 items-center mt-4">
        <div className="col-span-12 md:col-span-10">
          <h2 className="text-[#041B3C] text-[30px] font-semibold">
            Weekly Planner
          </h2>
          <p className="text-[#434654] text-[14px] font-normal">
            Manage your deadlines and track team velocity.
          </p>
        </div>
      </div>

      <FilterSection onDataFetched={handleDataFetched} />

      <TotalInfo
        total={calendarData?.total_tasks ?? 0}
        completed={calendarData?.done_tasks ?? 0}
        overdue={calendarData?.overdue_tasks ?? 0}
      />

      <DaysTasks data={calendarData} />

      <div className="flex  justify-between flex-wrap mb-5 gap-4">
        <TasksByStatus data={tasksByStatus} />
        <ProjectsSection data={projectData} />
      </div>
    </div>
  );
}