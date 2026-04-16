import { useState } from "react";
import Logo from "/favicon.svg";
import useIsMobile from "../../../hooks/useIsMobile";
import { logout } from "../../../services/endpoints";
import { clearUserMetaData } from "../../../features/user/userSlice";
import { useCookie } from "../../../hooks/useCookie";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { closeSidebar, openSidebar } from "../../../features/ui/sliderSlice";
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
  path?: string;
  icon: React.ComponentType<IconProps>;
  responsiveIcon?: React.ComponentType<IconProps>;
};

const navItems: NavItem[] = [
  {
    label: "Projects",
    icon: ProjectsIcon,
    path: "/dashboard/projects",
    responsiveIcon: ProjectsIconResponsive,
  },
  { label: "Project Epics", icon: EpicsIcon },
  { label: "Project Tasks", icon: TasksIcon },
  { label: "Project Members", icon: MembersIcon },
  { label: "Project Details", icon: DetailsIcon },
];

export default function Sidebar() {
  const { deleteCookie } = useCookie();
  const dispatch = useAppDispatch();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.slider.isSidebarOpen);
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await logout();

      deleteCookie("access_token");
      deleteCookie("refresh_token");
      dispatch(clearUserMetaData());

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <>
      {isMobile && isOpen && (
        <div
          onClick={() => dispatch(closeSidebar())}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}
      <div
        className={`
          h-screen
          bg-(--color-surface-low)
          transition-all duration-300 ease-in-out
          flex flex-col py-4
          

          ${
            isMobile
              ? `w-64 px-3 fixed top-0 left-0 z-50 ${isOpen ? "translate-x-0 " : " -translate-x-full"}`
              : `${collapsed ? "w-14 px-2 " : "w-52 px-3  fixed top-0 left-0 z-50"}`
          }
        `}
      >
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

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            const IconComponent =
              isMobile && item.responsiveIcon ? item.responsiveIcon : item.icon;

            return (
              <div
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) dispatch(closeSidebar());
                }}
                title={collapsed ? item.label : undefined}
                className={`
          group relative flex items-center gap-2.5 py-2.5 px-3 rounded-sm cursor-pointer 
          ${isActive ? "bg-white shadow-[0px_1px_2px_0px_#0000000D]" : ""}
        `}
              >
                <span className="shrink-0">
                  <IconComponent isActive={isActive} />
                </span>

                {!collapsed && (
                  <span
                    className={`text-[14px] font-medium ${
                      isActive ? "text-[#003D9B]" : "text-[#041B3C]"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex-1" />
        <hr className="mt-7 mb-3 border border-[#C3C6D6]/15" />

        <div className="flex flex-col gap-0.5">
          {!isMobile && (
            <div
              onClick={() => setCollapsed(!collapsed)}
              className="group flex items-center gap-2.5 px-2.5 py-2 cursor-pointer"
            >
              <span className="shrink-0">
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </span>
              {!collapsed && (
                <span className="text-[14px] font-medium">Collapse</span>
              )}
            </div>
          )}

          <div
            onClick={() => setShowLogoutDialog(true)}
            className="group flex items-center gap-2.5 px-2.5 py-2 cursor-pointer"
          >
            <span className="shrink-0">
              <LogoutIcon />
            </span>
            {!collapsed && (
              <span className="text-[14px] font-medium text-[#BA1A1A]">
                Logout
              </span>
            )}
          </div>
        </div>
      </div>

      {isMobile && (
        <button
          onClick={() => dispatch(openSidebar())}
          className="absolute  top-5 left-1 p-2  md:hidden flex items-center justify-between gap-2 "
        >
          <Menu />

          <span className="logo-name px-2">TASKLY</span>
        </button>
      )}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLogoutDialog(false)}
          />

          <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-5 z-101">
            <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-3 py-2 text-sm rounded-md border"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm rounded-md bg-red-600 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
