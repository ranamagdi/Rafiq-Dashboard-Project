import { Navigate, Outlet } from "react-router-dom";
import { useCookie } from "../../hooks/useCookie";

const PublicRoute = () => {
  const { getCookie } = useCookie();
  const token = getCookie("access_token");

  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;