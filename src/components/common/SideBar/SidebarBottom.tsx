import { useAppSelector } from "../../../hooks/reduxHooks";
import {
  ProjectsIconResponsive,
  EpicsIcon,
  TasksIcon,
  MembersIcon,
  DetailsIcon,
} from "./SideBarIcons";
import { useNavigate,useLocation } from "react-router-dom";
type Props = {
  collapsed: boolean;
  isMobile: boolean;
  onItemClick: (index: number) => void;

};

const items = [
  { label: "Projects", icon: ProjectsIconResponsive, path: "/dashboard/projects" },
  { label: "Epics", icon: EpicsIcon },
  { label: "Tasks", icon: TasksIcon },
  { label: "Members", icon: MembersIcon },
  { label: "Details", icon: DetailsIcon },
];
export default function SidebarBottom({
  isMobile,
}: Props) {
  const isOpen = useAppSelector((state) => state.slider.isSidebarOpen);
  const navigate = useNavigate();
  const location = useLocation();

  if (!(isMobile && !isOpen)) return null;

  const handleClick = (item: unknown) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="flex items-center justify-between gap-1 mt-auto bg-(--color-surface-low) fixed bottom-0 left-0 right-0 px-2 py-1">
      {items.map((item, i) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <div
            key={item.label}
            onClick={() => handleClick(item, i)}
            className="flex flex-col items-center justify-center px-3 py-2 cursor-pointer"
          >
            <Icon isActive={isActive} />
            <span
              className={`text-[10px] font-semibold pt-1 ${
                isActive ? "text-[#003D9B]" : "text-[#041B3C]"
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}