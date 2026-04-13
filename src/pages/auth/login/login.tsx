import "../authStyle.css";
import { ICONS } from "../../../assets/index";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { login } from "../../../services/endpoints";
import { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const loginSchema = z.object({
    email: z.email("Invalid email address").nonempty("Email is required"),

    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });
  type FormData = z.infer<typeof loginSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
  });
const handleSubmitForm: SubmitHandler<FormData> = async (data) => {
  try {
    setErrorMessage(null); 

    const response = await login(data.email, data.password);

    const { access_token, refresh_token, user } = response.data;

    Cookies.set("access_token", access_token, {
      secure: true,
      sameSite: "Strict",
    });

    Cookies.set("refresh_token", refresh_token, {
      secure: true,
      sameSite: "Strict",
    });

    localStorage.setItem("user", JSON.stringify(user));

    navigate("/dashboard");
  } catch (error) {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message || "An error occurred during sign up";
    setErrorMessage(message);
  } else {
    setErrorMessage("An error occurred during sign up");
  }
}
};

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="auth-container">
        <h3 className="text-center">Welcome Back</h3>
        <p className="text-center">
          Please enter your details to access your workspace
        </p>
        {errorMessage && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm flex items-center justify-between">
            <span>{errorMessage}</span>

            <button
              onClick={() => setErrorMessage(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="form-section">
            <label className={errors.email ? "error-label" : ""}>email</label>
            <Input
              type="text"
              placeholder="yourname@company.com"
              icon={ICONS.mailgrey}
              isValid={!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>
          <div className="form-section ">
            <div className="flex items-center justify-between">
              <label className={errors.password ? "error-label" : ""}>
                password
              </label>
              <a href="#" className="forget-password-responsive">
                Forgot?
              </a>
            </div>
            <Input
              type="password"
              placeholder="Minimum 8 characters"
              icon={ICONS.lock}
              isValid={!errors.password}
              {...register("password")}
              style={{ marginTop: "-10px" }}
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none mt-3">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer hidden"
            />

            <div
              className="
      w-4 h-4
      border border-[#C3C6D6]
      rounded-sm
      flex items-center justify-center
      transition
      bg-[#F1F3FF]
      peer-checked:bg-primary
    "
            >
              {remember && (
                <span className="text-[14px] font-bold leading-none">✓</span>
              )}
            </div>

            <p className="remember-me">Remember me</p>
          </label>

          <Button
            className="login-disktop"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
          <Button
            className="flex items-center gap-2 justify-center login-responsive"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
            <img src={ICONS.arrow} alt="Arrow" />
          </Button>
        </form>
        <p className="text-center auth-text">
          Don't have an account?{" "}
          <span
            className="text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
