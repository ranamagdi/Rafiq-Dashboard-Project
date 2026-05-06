import { useState, useRef, useEffect, useCallback } from "react";
import Select, { type StylesConfig, type SingleValue } from "react-select";
import {
  formatRangeLabel,
  getDaysDiff,
  getCurrentWeekRange,
} from "../utils/helpers";
import { formatDate } from "../utils/dateUtils";
import {
  getProjects,
  getTasksCalendarStats,
  getTasksCountPerProject,
} from "../../services/endpoints";
import type {
  Project,
  StatusOption,
  DateRange,
  SelectOption,
  ProjectStatItem,
  CalendarStatsResponse,
} from "../../types/apiTypes";
import { statusOptions } from "../utils/constants";
import Calendar from "./Calander";
import Button from "../ui/Button";
import StatusOptionLabel from "./StatusOptionLabel";

type FilterSectionProps = {
  onDataFetched: (
    calendar: CalendarStatsResponse,
    projects: ProjectStatItem[],
  ) => void;
};

export default function FilterSection({ onDataFetched }: FilterSectionProps) {
  const [projects, setProjects] = useState<SelectOption[]>([
    { value: "all", label: "All Projects" },
  ]);
  const onDataFetchedRef = useRef(onDataFetched);
  useEffect(() => {
    onDataFetchedRef.current = onDataFetched;
  }, [onDataFetched]);
  const [selectedProject, setSelectedProject] = useState<SelectOption>({
    value: "all",
    label: "All Projects",
  });
  const MAX_RANGE = 7;

  const [rangeError, setRangeError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>(
    statusOptions[0],
  );
  const [dateRange, setDateRange] = useState(getCurrentWeekRange());
  const [pendingRange, setPendingRange] = useState(getCurrentWeekRange());

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProjects()
      .then((res) => {
        const data = res.data as Project[];
        const opts: SelectOption[] = [
          { value: "all", label: "All Projects" },
          ...data.map((p) => ({ value: String(p.id), label: p.name })),
        ];
        setProjects(opts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
  function handleDaySelect(date: Date) {
    setRangeError(null);
    if (!pendingRange.start || pendingRange.end) {
      setPendingRange({ start: date, end: null! });
      return;
    }

    let start = pendingRange.start;
    let end = date;

    if (date < start) {
      start = date;
      end = pendingRange.start;
    }

    const diff = getDaysDiff(start, end);

    if (diff > MAX_RANGE - 1) {
      setRangeError("Maximum range is 7 days");
      return;
    }

    setPendingRange({ start, end });
  }
  const fetchData = useCallback(
    async (range: DateRange) => {
      if (!range.start || !range.end) return;

      const payload = {
        p_start_date: formatDate(range.start),
        p_end_date: formatDate(range.end),
        p_project_id:
          selectedProject.value === "all" ? null : selectedProject.value,
        p_status: selectedStatus.value === "all" ? null : selectedStatus.value,
      };

      try {
        const [calendarRes, projectRes] = await Promise.all([
          getTasksCalendarStats(payload),
          getTasksCountPerProject({
            p_start_date: payload.p_start_date,
            p_end_date: payload.p_end_date,
          }),
        ]);
        onDataFetchedRef.current(
          // ← use ref, not prop directly
          calendarRes.data as CalendarStatsResponse,
          projectRes.data as ProjectStatItem[],
        );
      } catch (err) {
        console.error("API error", err);
      }
    },
    [selectedProject.value, selectedStatus.value],
  );

  async function handleApply() {
    if (!pendingRange.start || !pendingRange.end) return;

    setDateRange(pendingRange);
    setPickerOpen(false);

    await fetchData(pendingRange);
  }
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    fetchData(dateRange);
  }, [dateRange, fetchData]);
  function handleCancel() {
    setPendingRange(dateRange);
    setPickerOpen(false);
  }

  function openPicker() {
    setPendingRange(dateRange);
    setPickerOpen(true);
  }

  const displayRange: DateRange = pickerOpen ? pendingRange : dateRange;

  const baseSelectStyles: StylesConfig<SelectOption> = {
    control: (base) => ({
      ...base,
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      minHeight: 40,
      boxShadow: "none",
      background: "#fff",
      paddingLeft: 4,
      cursor: "pointer",
      "&:hover": { borderColor: "#94a3b8" },
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? "#eff6ff"
        : state.isFocused
          ? "#f8fafc"
          : "#fff",
      color: "#1e293b",
      fontSize: 14,
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1e293b",
      fontSize: 14,
      fontWeight: 500,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
    menu: (base) => ({
      ...base,
      borderRadius: 10,
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      border: "1px solid #e2e8f0",
    }),
  };

  const statusSelectStyles: StylesConfig<StatusOption> = {
    control: (base) => ({
      ...base,
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      minHeight: 40,
      boxShadow: "none",
      background: "#fff",
      paddingLeft: 6,
      cursor: "pointer",
      "&:hover": { borderColor: "#94a3b8" },
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? "#f8fafc" : "#fff",
      cursor: "pointer",
      padding: "8px 12px",
    }),
    singleValue: (base) => ({ ...base, fontSize: 14 }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
    menu: (base) => ({
      ...base,
      borderRadius: 10,
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      border: "1px solid #e2e8f0",
    }),
  };

  return (
    <div className="flex items-center justify-between gap-3 py-3 my-7 flex-wrap bg-(--color-surface-low)">
      <div className="relative" ref={pickerRef}>
        <Button
          variant="text"
          onClick={openPicker}
          className="flex items-center gap-2.5 px-4 cursor-pointer h-10 whitespace-nowrap"
        >
          <span className="text-slate-400 text-lg font-normal leading-none">
            ‹
          </span>
          <span className="text-slate-800 font-semibold text-sm">
            {dateRange.start
              ? formatRangeLabel(dateRange)
              : (() => {
                  const now = new Date();
                  const mon = new Date(now);
                  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
                  const sun = new Date(mon);
                  sun.setDate(mon.getDate() + 6);
                  const fmt = (d: Date) =>
                    d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  return `${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`;
                })()}
          </span>
          <span className="text-slate-400 text-lg font-normal leading-none">
            ›
          </span>
        </Button>

        {pickerOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-100 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.13)] border border-slate-200 p-5 min-w-75">
            <Calendar
              range={displayRange}
              onSelect={handleDaySelect}
              onCancel={handleCancel}
              onApply={handleApply}
              error={rangeError}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2.5 mx-2">
        <div className="min-w-auto sm:min-w-45 ">
          <Select<SelectOption>
            options={projects}
            value={selectedProject}
            onChange={(opt) => opt && setSelectedProject(opt)}
            styles={baseSelectStyles}
            isSearchable={false}
          />
        </div>

        <div className="min-w-auto sm:min-w-45">
          <Select<StatusOption>
            options={statusOptions}
            value={selectedStatus}
            onChange={(opt: SingleValue<StatusOption>) =>
              opt && setSelectedStatus(opt)
            }
            styles={statusSelectStyles}
            isSearchable={false}
            formatOptionLabel={(option) => (
              <StatusOptionLabel option={option} />
            )}
          />
        </div>
      </div>
    </div>
  );
}
