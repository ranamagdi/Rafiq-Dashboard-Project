import { Navigate, Outlet } from "react-router-dom";
import { useCookie } from "../../hooks/useCookie";

const ProtectedRoute = () => {
  const { getCookie } = useCookie();
  const token = getCookie("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;