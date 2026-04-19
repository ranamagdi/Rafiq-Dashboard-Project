import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Signup from "./pages/auth/signup/sign-up";
import Login from "./pages/auth/login/login";
import ForgotPassword from "./pages/auth/forgotpassword/forgot-password";
import ResetPassword from "./pages/auth/resetpassword/reset-password";
import AuthCallback from "./pages/auth/authcallback";
import Dashboard from "./pages/dashboard";
import Projects from "./pages/dashboard/projects/index";
import CreateProject from  "./pages/dashboard/projects/create-project";

const AppRoutes = () => {
  return (
    <Routes>
       <Route path="/sign-up" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="projects" element={<Projects />} />
          <Route path="create-project" element={<CreateProject />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
