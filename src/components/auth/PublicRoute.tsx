import { Navigate, Outlet } from "react-router-dom";
import { useCookie } from "../../hooks/useCookie";
import Header from "../common/Header/Header";

const PublicRoute = () => {
  const { getCookie } = useCookie();
  const token = getCookie("access_token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default PublicRoute;