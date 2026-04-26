import { useAppSelector } from "../../../hooks/reduxHooks";
import {
  ProjectsIconResponsive,
  EpicsIcon,
  TasksIcon,
  MembersIcon,
  DetailsIcon,
  ProjectsIcon,
} from "./SideBarIcons";
import { NavLink, useLocation, useParams } from "react-router-dom";
import React from "react";

type Props = {
  isMobile: boolean;
};

type SidebarItem = {
  label: string;
  icon: React.ComponentType<{ isActive?: boolean }>;
  path?: string;
};

export default function SidebarBottom({ isMobile }: Props) {
  const isOpen = useAppSelector((state) => state.slider.isSidebarOpen);

  const location = useLocation();
  const { projectId } = useParams();
  const getNavItems: (projectId?: string) => SidebarItem[] = (
    projectId?: string,
  ) => [
    {
      label: "Projects",
      icon: ProjectsIcon,
      path: "/dashboard/projects",
      responsiveIcon: ProjectsIconResponsive,
    },
    ...(projectId
      ? [
          {
            label: "Project Epics",
            icon: EpicsIcon,
            path: `/dashboard/project/${projectId}/epics`,
          },
          {
            label: "Project Tasks",
            icon: TasksIcon,
            path: `/dashboard/project/${projectId}/tasks`,
          },
          {
            label: "Project Members",
            icon: MembersIcon,
            path: `/dashboard/project/${projectId}/members`,
          },
          {
            label: "Project Details",
            icon: DetailsIcon,
            path: `/dashboard/project/${projectId}/edit`,
          },
        ]
      : []),
  ];

  const items = getNavItems(projectId);
  if (!(isMobile && !isOpen)) return null;

  return (
    <div className="flex items-center justify-center align-middle gap-1 mt-auto bg-(--color-surface-low) fixed bottom-0 left-0 right-0 px-2 py-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.includes(
          item.path?.split("/:")[0] || "",
        );

        return (
          <NavLink
            key={item.label}
            to={item.path || "#"}
            className="flex flex-col items-center text-center justify-center px-3 py-2 cursor-pointer"
          >
            <Icon isActive={isActive} />
            <span
              className={`text-[10px] font-semibold pt-1 ${
                isActive ? "text-[#003D9B]" : "text-[#041B3C]"
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </div>
  );
}
