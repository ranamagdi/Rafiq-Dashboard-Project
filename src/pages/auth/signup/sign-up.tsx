
import { ICONS } from "../../../assets/index";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { signUp } from "../../../services/endpoints";
import { useState } from "react";
import { useCookie } from "../../../hooks/useCookie";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { fetchUser } from "../../../store/slices/user/userSlice";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { setCookie } = useCookie();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signUpSchema = z
    .object({
      name: z
        .string()
        .nonempty("Name is required")
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be less than 50 characters")
        .regex(
          /^[\p{L}]+(?:\s[\p{L}]+)*$/u,
          "Name must only contain letters and single spaces between words, with no numbers, special characters, or emojis",
        ),
      email: z.email("Invalid email address").nonempty("Email is required"),
      department: z.string().optional().or(z.literal("")),
      password: z
        .string()
        .nonempty("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must be less than 64 characters")
        .regex(/^\S*$/, "Password must not contain spaces")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
          /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
          "Password must contain at least one special character",
        ),
      confirmPassword: z.string().nonempty("Confirm Password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type FormData = z.infer<typeof signUpSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(signUpSchema),
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpperLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const handleSubmitForm: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await signUp({
        email: data.email,
        password: data.password,
        data: {
          name: data.name,
          department: data.department || "",
        },
      });
      const { access_token, refresh_token } = response.data;

      setCookie("access_token", access_token);
      setCookie("refresh_token", refresh_token);

       dispatch(fetchUser());


      navigate("/dashboard");
      console.log("Sign up successful:", response.data);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An error occurred during sign up");
      }
    }
  };

  return (
    <div className="flex items-center justify-center pb-12">
      <div
        className="flex flex-col
      md:bg-white bg-transparent
      md:shadow-[0px_24px_48px_0px_#041b3c0f] shadow-none
      md:rounded-(--radius-form) rounded-none
      max-w-full md:max-w-xl
      mx-auto
      p-2 md:p-12"
      >
        <h3 className="text-center text-[30px] font-(--headline-lg-weight) text-(--color-slate-dark-blue) leading-9">
          Create your workspace
        </h3>
        <p className="text-center text-sm text-(--color-slate-medium-blue) mt-2">
          Join the editorial approach to task management.
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
        <form className="flex flex-col items-start text-left pt-10 pb-4 w-full" onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="mb-5 w-full">
            <label className={`
                  text-(length:--label-sm-size)
                  font-(--label-sm-weight)
                  text-(--color-slate-medium-blue)
                  uppercase mb-3
                  ${errors.name ? "text-(--color-error)" : ""}
                `}>
              Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              {...register("name")}
            />
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-5 w-full">
            <label className={`
                  text-(length:--label-sm-size)
                  font-(--label-sm-weight)
                  text-(--color-slate-medium-blue)
                  uppercase mb-3
                  ${errors.email ? "text-(--color-error)" : ""}
                `}>
              Email
            </label>
            <Input
              type="text"
              placeholder="yourname@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-5 w-full">
            <label className={`
                  text-(length:--label-sm-size)
                  font-(--label-sm-weight)
                  text-(--color-slate-medium-blue)
                  uppercase mb-3
                  ${errors.department ? "text-(--color-error)" : ""}
                `}>
              Job Title <span className=" text-(length:--label-sm-size)
              font-(--body-md-weight)
              text-(--color-slate-medium-blue)
              uppercase
              mb-3">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Project Manager"
              {...register("department")}
            />
            {errors.department && (
              <p className="error-message">{errors.department.message}</p>
            )}
          </div>

          <div className="mb-5 w-full grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <label className={`
                  text-(length:--label-sm-size)
                  font-(--label-sm-weight)
                  text-(--color-slate-medium-blue)
                  uppercase mb-3
                  ${errors.password ? "text-(--color-error)" : ""}
                `}>
                Password
              </label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className={`
                  text-(length:--label-sm-size)
                  font-(--label-sm-weight)
                  text-(--color-slate-medium-blue)
                  uppercase mb-3
                  ${errors.confirmPassword ? "text-(--color-error)" : ""}
                `}>
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Repeat your password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="error-message">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-5 w-full md:flex hidden flex-col
              p-4
              rounded-(--radius-form)
              bg-(--color-surface-highest)  gap-3">
            {[
              {
                passed: passwordChecks.minLength,
                label: "At least 8 characters",
              },
              {
                passed: passwordChecks.hasUpperLower && passwordChecks.hasDigit,
                label: "One uppercase, lowercase, and digit",
              },
              {
                passed: passwordChecks.hasSpecial,
                label: "One special character",
              },
            ].map(({ passed, label }) => (
              <label
                key={label}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className={`w-3 h-3  rounded-full flex items-center justify-center transition-colors ${passed ? "bg-primary" : "border-gray-300 border-2"}`}
                >
                  {passed && (
                    <img
                      src={ICONS.iconchecked}
                      className="w-3 h-3"
                      alt="checked"
                    />
                  )}
                </div>
                <p className={` text-(length:--label-sm-size)
                font-(--body-md-weight)
                text-(--color-forms-texts)
                m-0
                capitalize ${passed ? "text-primary" : ""}`}>{label}</p>
              </label>
            ))}
          </div>

          <Button disabled={isSubmitting} type="submit" className="w-full">
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="text-center text-(length:--body-md-size)
            font-(--body-md-weight)
            text-(--color-slate-medium-blue)
            leading-5
            mt-4">
          Already have an account?{" "}
          <span
            className="text-primary cursor-pointer text-(--color-primary)
  font-(--headline-lg-weight)"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
