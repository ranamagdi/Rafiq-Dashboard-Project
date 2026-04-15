import { useState } from "react";
import Logo from "/favicon.svg";
import useIsMobile from "../../../hooks/useIsMobile";
import {
  ProjectsIcon,
  EpicsIcon,
  TasksIcon,
  MembersIcon,
  DetailsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  Menu,
  ProjectsIconResponsive,
} from "./SideBarIcons";

type IconProps = {
  isActive?: boolean;
};

type NavItem = {
  label: string;
  icon: React.ComponentType<IconProps>;
  responsiveIcon?: React.ComponentType<IconProps>;
};

const navItems: NavItem[] = [
  {
    label: "Projects",
    icon: ProjectsIcon,
    responsiveIcon: ProjectsIconResponsive,
  },
  { label: "Project Epics", icon: EpicsIcon },
  { label: "Project Tasks", icon: TasksIcon },
  { label: "Project Members", icon: MembersIcon },
  { label: "Project Details", icon: DetailsIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false); 
  const isMobile = useIsMobile();

  return (
    <>
   
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

  
      <div
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-(--color-surface-low)
          transition-all duration-300 ease-in-out
          flex flex-col py-4

          ${
            isMobile
              ? `w-64 px-3 ${
                  isOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `${collapsed ? "w-14 px-2" : "w-52 px-3"}`
          }
        `}
      >
        {/* ✅ Logo (hidden when collapsed desktop) */}
        <div className="flex items-center gap-2.5 mb-6 pl-1">
          {!collapsed && (
            <>
              <a href="#">
                <img src={Logo} alt="logo" className="h-8 w-auto" />
              </a>
              <span className="logo-name">TASKLY</span>
            </>
          )}
        </div>

        {/* ✅ Nav Items */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item, i) => {
            const isActive = activeIndex === i;

            const IconComponent =
              isMobile && item.responsiveIcon
                ? item.responsiveIcon
                : item.icon;

            return (
              <div
                key={item.label}
                onClick={() => {
                  setActiveIndex(i);
                  if (isMobile) setIsOpen(false);
                }}
                title={collapsed ? item.label : undefined}
                className={`
                  group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors
                  ${
                    isActive
                      ? "bg-white text-blue-900"
                      : "text-gray-600 hover:bg-blue-900/[0.07]"
                  }
                `}
              >
       
                <span className="shrink-0">
                  <IconComponent isActive={isActive} />
                </span>

                {!collapsed && (
                  <span
                    className={`text-[13px] whitespace-nowrap ${
                      isActive ? "font-medium text-blue-900" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                )}

             
                {collapsed && !isMobile && (
                  <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex-1" />

      
        <div className="flex flex-col gap-0.5">
     
          {!isMobile && (
            <div
              onClick={() => setCollapsed(!collapsed)}
              className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-gray-600 hover:bg-blue-900/[0.07]"
            >
              <span className="shrink-0">
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </span>
              {!collapsed && <span className="text-[13px]">Collapse</span>}
            </div>
          )}

        
          <div className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-red-50">
            <span className="shrink-0">
              <LogoutIcon />
            </span>
            {!collapsed && (
              <span className="text-[13px] text-red-600">Logout</span>
            )}
          </div>
        </div>
      </div>

   
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-7 left-1 p-2  md:hidden"
        >
         <Menu/>
        </button>
      )}
    </>
  );
}