import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import Signup from "./pages/auth/signup/sign-up";
import Login from "./pages/auth/login/login";
import ForgotPassword from "./pages/auth/forgotpassword/forgot-password";
import ResetPassword from "./pages/auth/resetpassword/reset-password";
import AuthCallback from "./pages/auth/authcallback";
import Dashboard from "./pages/dashboard";
import Projects from "./pages/dashboard/projects/index";
import ProjectOps from "./pages/dashboard/projects/project-operations";
import Epics from "./pages/dashboard/epics";
import EpicCreate from "./pages/dashboard/epics/epic-create";
import Members from "./pages/dashboard/members";
import TaskCreate from "./pages/dashboard/tasks/task-create";
import Tasks from './pages/dashboard/tasks/index'
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/" element={<AuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="projects" element={<Projects />} />
          <Route path="project/add" element={<ProjectOps />} />
          <Route path="project/:projectId/edit" element={<ProjectOps />} />
          <Route path="project/:projectId/epics" element={<Epics />} />
          <Route path="project/:projectId/epic/add" element={<EpicCreate />} />
          <Route path="project/:projectId/members" element={<Members />} />
          <Route path="project/:projectId/:epicId?/tasks/new" element={<TaskCreate />} />
           <Route path="project/:projectId/tasks/" element={<Tasks />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
