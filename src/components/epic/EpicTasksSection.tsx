import Button from "../ui/Button";
import { PlusIcon, TasksEmptyIcon,PlusRoundedIcon } from "../ui/SvgIcons";
import useIsMobile from "../../hooks/useIsMobile";
import { getEpicTasks } from "../../services/endpoints";
import { useEffect, useState } from "react";
import type { Task } from "../../types/apiTypes";
import { getInitials } from "../utils/nameUtils";
import { CheckIcon } from "../../components/ui/SvgIcons";

interface Props {
  epicId: string | null;
  onAddTask?: () => void;
}

export default function EpicTasksSection({ epicId, onAddTask }: Props) {
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!epicId) return;

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getEpicTasks(epicId);

        const data: Task[] = Array.isArray(res) ? res : (res?.data ?? []);

        setTasks(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [epicId]);
  return (
    <div className="px-7 py-2">
      {/* Header */}
      <div className="flex items-center mb-1">
        <h3 className="text-[15px] text-(--color-slate-dark-blue) font-semibold uppercase">
          Tasks
        </h3>

        <Button
          onClick={onAddTask}
          variant="text"
          className="md:flex items-center gap-1.5 ml-auto px-0 hidden "
        >
          <PlusIcon />
          Add Task
        </Button>
        <div className="flex items-center gap-1.5 ml-auto rounded-2xl px-2 bg-(--color-circular) sm:hidden text-[15px] text-(--color-slate-dark-blue) font-medium uppercase)">
          {tasks.length} Tasks
        </div>
      </div>
  
      {error && <p className="text-sm text-red-500 py-4">{error}</p>}

      {/* Empty State */}
      {!loading && tasks.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-10 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #F0F4FF 0%, #EEF2FB 100%)",
            border: "2px dashed #C7D2E8",
          }}
        >
          <div className="w-14 h-14 bg-(--color-surface-highest) rounded-2xl flex items-center justify-center mb-2">
            <TasksEmptyIcon opacity={!isMobile ? "0.3" : "1"} />
          </div>

          <p className="px-4 text-center sm:px-0 text-[16px] sm:text-(--color-slate-dark-blue) text-(--color-slate-medium-blue) font-medium">
            No tasks have been added to this epic yet
          </p>

          <Button onClick={onAddTask} className="gap-2 mt-2">
            <PlusIcon />
            Add Task
          </Button>
        </div>
      ) : (
       <ul className="flex flex-col divide-y divide-(--color-border-light) border border-(--color-border-light) rounded-2xl overflow-hidden mt-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-5 py-4 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                  
                    <div className="w-5 h-5 rounded-full " />

                    <div className="flex flex-col gap-2">
                    
                      <div className="h-3 w-40 bg-(--color-surface-highest) animate-pulse  rounded" />

                      
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-xl bg-(--color-surface-highest) animate-pulse" />
                        <div className="h-2 w-20 bg-(--color-surface-highest) animate-pulse rounded" />
                      </div>
                    </div>
                  </div>

               
                  <div className="flex flex-col items-end gap-2">
                    <div className="h-2 w-12 bg-(--color-surface-highest) animate-pulse rounded" />
                    <div className="h-3 w-20 bg-(--color-surface-highest) animate-pulse rounded" />
                  </div>
                </li>
              ))
            : tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between px-5 py-4 bg-white hover:bg-[#F9FAFB] transition"
                >
                  <div className="flex items-center gap-4">
                    <CheckIcon />

                    <div className="flex flex-col">
                      <span className="font-semibold text-[#041B3C]">
                        {task.title}
                      </span>

                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <div className="w-6 h-6 rounded-xl bg-(--color-circular) flex items-center justify-center text-[8px] font-semibold text-(--color-primary)">
                          {getInitials(task.assignee?.name || "U")}
                        </div>

                        <span>{task.assignee?.name || "Unassigned"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <p className="text-gray-400 uppercase text-[11px] tracking-wide">
                      Due Date
                    </p>
                    <p className="font-medium text-[12px] text-(--color-date)">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </li>
                
              ))}
              
        </ul>
        
        
      )}
      
          <Button onClick={onAddTask} variant="text" className="gap-2 mt-2 w-full border-dashed border-2 border-[#C3C6D64D] text-(--color-button-text)">
            <PlusRoundedIcon />
            Add New Task
          </Button>
    </div>
  );
}
