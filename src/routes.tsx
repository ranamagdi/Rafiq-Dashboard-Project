import { Routes, Route } from "react-router-dom";
import Signup  from "./pages/auth/signup/sign-up";
import Login from "./pages/auth/login/login";
import ForgotPassword from "./pages/auth/forgotpassword/forgot-password";
import ResetPassword from "./pages/auth/resetpassword/reset-password";
import AuthCallback from "./pages/auth/authcallback";
import Dashboard from "./pages/dashboard";

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/sign-up" element={<Signup />}  />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/" element={<AuthCallback />} />

    </Routes>
  );
}   

 export default AppRoutes   