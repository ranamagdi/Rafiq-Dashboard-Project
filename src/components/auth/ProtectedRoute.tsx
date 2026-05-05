import { Navigate, Outlet } from "react-router-dom";
import { useCookie } from "../../hooks/useCookie";
import Header from "../common/Header/Header";

const ProtectedRoute = () => {
  const { getCookie } = useCookie();
  const token = getCookie("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default ProtectedRoute;