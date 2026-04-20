import { useCookie } from "../../../hooks/useCookie";

import { useAppSelector } from "../../../hooks/reduxHooks";
import Logo from "/favicon.svg";
import useIsMobile from "../../../hooks/useIsMobile";

const Header = () => {
  const { getCookie } = useCookie();
  const isMobile = useIsMobile();
  const isSidebarOpen = useAppSelector((state) => state.slider.isSidebarOpen);
  const accessToken = getCookie("access_token");

  const user = useAppSelector((state) => state.user.userMetaData);

  const getInitials = (name: string | undefined) => {
    if (!name) return "";

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }

    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user?.name);
const showLogo =
  (!isMobile && !isSidebarOpen) ||
  (!accessToken && !isSidebarOpen && isMobile);
  return (
    <header className={accessToken ? "border-b border-gray-200" : ""}>
      <nav className="mx-auto flex items-center justify-between p-6">
        <div className="flex lg:flex-1">
                 {showLogo && (
          <a href="#" className="flex items-center gap-2">
            <img src={Logo} alt="Your Company" className="h-8 w-auto" />
            <span className="logo-name">TASKLY</span>
          </a>
        )}
        </div>

        {accessToken && user && (
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="font-medium">{user.name}</p>
              <p className="uppercase font-medium text-xs text-(--color-primary)">
                {user.department}
              </p>
            </div>

            <div className="w-10 h-10 flex items-center justify-center rounded bg-(--color-primary) text-white">
              {initials}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
