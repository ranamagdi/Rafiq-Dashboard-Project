import { Routes, Route } from "react-router-dom";
import Signup  from "./pages/auth/signup/signUp";
import Login from "./pages/auth/login/login";

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
    </Routes>
  );
}   

 export default AppRoutes   