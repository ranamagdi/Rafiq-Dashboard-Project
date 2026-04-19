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
import { useCookie } from "../../../hooks/useCookie";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { setUserMetaData } from "../../../store/slices/user/userSlice";

const Login = () => {
  const { setCookie } = useCookie();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
      const { access_token, refresh_token, user } = response;
      setCookie("access_token", access_token);
      setCookie("refresh_token", refresh_token);
      dispatch(setUserMetaData(user.user_metadata));
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An error occurred during sign in");
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
  
      <div
        className="
          flex flex-col
          bg-white shadow-[0px_24px_48px_0px_#041b3c0f]
          rounded-(--radius-form)
          max-w-xl w-full mx-auto px-12 py-12
          max-md:bg-transparent max-md:shadow-none max-md:rounded-none
          max-md:max-w-full max-md:px-2.5 max-md:py-2.5
        "
      >
  
        <h3
          className="
            text-center text-[30px] font-(--headline-lg-weight)
            text-(--color-slate-dark-blue) leading-9
          "
        >
          Welcome Back
        </h3>


        <p
          className="
            text-center text-(length:--body-md-size)
            font-(--body-md-weight) text-(--color-slate-medium-blue)
            leading-5 mt-2
          "
        >
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

      
        <form
          className="
            pt-10 pb-4 flex flex-col justify-start items-start text-left
            max-md:px-5
          "
          onSubmit={handleSubmit(handleSubmitForm)}
        > 
          <div className="mb-5 w-full">
         
            <label
              className={`
                block text-(length:--label-sm-size) font-(--label-sm-weight)
                text-(--color-slate-medium-blue) leading-[16.5px] mb-3.5 uppercase
                ${errors.email ? "error-label" : ""}
              `}
            >
              email address
            </label>
            <Input
              type="text"
              placeholder="yourname@company.com"
              icon={ICONS.mailgrey}
              hideIconOnMd={true}
              isValid={!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-5 w-full">
            <div className="flex items-center justify-between">
              <label
                className={`
                  block text-(length:--label-sm-size) font-(--label-sm-weight)
                  text-(--color-slate-medium-blue) leading-[16.5px] mb-3.5 uppercase
                  ${errors.password ? "error-label" : ""}
                `}
              >
                password
              </label>
          
              <span
                className="
                  hidden max-md:block cursor-pointer
                  text-(length:--label-sm-size) font-(--display-lg-weight)
                  text-(--color-primary) leading-[16.5px]
                "
                onClick={() => navigate("/forgot-password")}
              >
                Forgot?
              </span>
            </div>
            <Input
              type="password"
              placeholder="Minimum 8 characters"
              icon={ICONS.lock}
              hideIconOnMd={true}
              isValid={!errors.password}
              {...register("password")}
              style={{ marginTop: "-10px" }}
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

   
          <div className="flex items-center justify-between mt-2 w-full">
            <label className="flex items-center gap-2 cursor-pointer select-none mt-3">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="peer hidden"
              />
              <div
                className="
                  w-4 h-4 border border-[#C3C6D6] rounded-sm
                  flex items-center justify-center transition bg-[#F1F3FF]
                  peer-checked:bg-primary
                "
              >
                {remember && (
                  <span className="text-[14px] font-bold leading-none">✓</span>
                )}
              </div>
        
              <p
                className="
                  text-(length:--body-md-size)! font-(--title-md-weight)
                  text-(--color-forms-texts)! leading-[16.5px] m-0 capitalize
                "
              >
                Remember me
              </p>
            </label>

         
            <span
              className="
                hidden md:block cursor-pointer
                text-(length:--body-md-size) font-(--title-md-weight)
                text-(--color-primary) leading-[16.5px]
              "
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          <Button
            className="hidden md:flex w-full mt-4  items-center gap-2 justify-center"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>

         
          <Button
            className="flex md:hidden items-center gap-2 justify-center  w-full mt-4 "
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
            <img src={ICONS.arrow} alt="Arrow" />
          </Button>
        </form>

        <p
          className="
            text-center text-(length:--body-md-size)
            font-(--body-md-weight) text-(--color-slate-medium-blue)
            leading-5 mt-4
          "
        >
          Don't have an account?{" "}
          <span
            className="
              text-(--color-primary) font-(--headline-lg-weight) cursor-pointer
            "
            onClick={() => navigate("/sign-up")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;