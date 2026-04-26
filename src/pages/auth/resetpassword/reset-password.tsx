
import { ICONS } from "../../../assets/index";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {HidePassword,ShowPassword} from '../../../components/ui/SvgIcons'
import { updatePassword } from "../../../services/endpoints";
import { useState } from "react";
import { useCookie } from "../../../hooks/useCookie";
import useIsMobile from "../../../hooks/useIsMobile";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { deleteCookie } = useCookie();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const accessToken = searchParams.get("access_token");
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetSchema = z
    .object({
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

  type FormData = z.infer<typeof resetSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(resetSchema),
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordChecks = {
    length: password.length >= 8 && password.length <= 64,

    hasLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
  const isMobile = useIsMobile();

  const checks = isMobile
    ? [
        {
          passed: passwordChecks.length,
          label: "8-64 characters",
        },
        {
          passed: passwordChecks.hasLower && passwordChecks.hasUpper,
          label: "Uppercase & lowercase",
        },

        {
          passed: passwordChecks.hasDigit,
          label: "At least one digit",
        },
        {
          passed: passwordChecks.hasSpecial,
          label: "Special character (e.g. !@#S)",
        },
      ]
    : [
        {
          passed: passwordChecks.length,
          label: "8-64 characters",
        },
        {
          passed: passwordChecks.hasLower,
          label: "Lowercase letter",
        },
        {
          passed: passwordChecks.hasUpper,
          label: "Uppercase letter",
        },
        {
          passed: passwordChecks.hasSpecial,
          label: "Special character",
        },
        {
          passed: passwordChecks.hasDigit,
          label: "One digit",
        },
      ];
  const handleSubmitForm: SubmitHandler<FormData> = async (data) => {
    try {
      await updatePassword(data.password);

      setSuccessMessage(
        "Your password has been updated successfully. You can now log in",
      );
      deleteCookie("access_token");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An error occurred during password reset");
      }
    }
  };
  if (!accessToken) {
    return (
      <div className="flex items-center justify-center pb-12">
        <div
          className="
          flex flex-col
          bg-white
          shadow-[0px_24px_48px_0px_#041b3c0f]
          rounded-(--radius-form)
          max-w-119
          mx-auto
          p-12
        "
        >
          <h3 className="text-[30px] font-(--headline-lg-weight) text-(--color-slate-dark-blue) leading-9">Invalid Reset Link</h3>
          <p className="mt-4 text-red-500 text-sm">
            Invalid or expired reset link. Please request a new password reset.
          </p>
          <button
            className="cursor-pointer mt-6 text-sm w-full"
            style={{ color: "var(--color-primary)" }}
            onClick={() => navigate("/forgot-password")}
          >
            Request a new link
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center pb-12">
      <div className="
    flex flex-col
    bg-white
    shadow-[0px_24px_48px_0px_#041b3c0f]
    rounded-(--radius-form)
    max-w-119
    mx-auto
    p-12
  ">
        <h3 className="text-[30px] font-(--headline-lg-weight) text-(--color-slate-dark-blue) leading-9">Create A New Password</h3>
        <p className="text-[14px] text-(--color-slate-medium-blue) leading-5">
          Create a new, strong password to secure your workstation access.
        </p>
        {errorMessage ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm flex items-center justify-between">
            <span className="text-(length:--label-sm-size)
            font-(--body-md-weight)
            text-(--color-slate-medium-blue)
            uppercase
            mb-3">{errorMessage}</span>

            <button
              onClick={() => setErrorMessage(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ) : successMessage ? (
          <div className="mt-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-600 text-sm flex items-center justify-between">
            <span className="text-(length:--label-sm-size)
  font-(--body-md-weight)
  text-(--color-slate-medium-blue)
  uppercase
  mb-3">{successMessage}</span>
          </div>
        ) : null}
        <div className="bg-transparent">
          <form
            className="flex flex-col items-start text-left pt-10 pb-4 w-full"
            onSubmit={handleSubmit(handleSubmitForm)}
            style={{
              opacity: successMessage ? 0.6 : 1,
              pointerEvents: successMessage ? "none" : "auto",
            }}
          >
            <div className="mb-5 w-full">
              <div>
                <label>New Password</label>
                <div className="relative">
                  <Input
                    type={show ? "text" : "password"}
                    specialStyle="special-style"
                    placeholder="Enter password"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShow((prev) => !prev)}
                    className="absolute inset-y-0 inset-e-0 flex items-center px-3 text-muted-foreground hover:text-primary-focus"
                  >
                    {show ? (
                     <ShowPassword/>
                    ) : (
                     <HidePassword/>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="mb-5 w-full">
              <div>
                <label>Confirm Password</label>
                <Input
                  type="password"
                  specialStyle="specialStyle"
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

            <div className="mb-5 w-full  p-4
                rounded-(--radius-form)
                bg-(--color-special-feild)
                border border-[#c3c6d64d] ">
              <p className="text-(length:--label-sm-size)
                  font-(--label-sm-weight)
                  text-(--color-forms-texts)">Security Requirements</p>
              <hr className="mt-4 border border-[#C3C6D6]/15" />
              <div className="flex flex-wrap justify-between items-center gap-3 mt-3">
                {checks.map(({ passed, label }) => (
                  <label
                    key={label}
                    className="flex items-center gap-2 cursor-pointer  verification-reset-label"
                  >
                    <div
                      className={`w-3 h-3 rounded-full transition-colors ${
                        passed ? "bg-primary" : "border-gray-300 border-2"
                      }`}
                    >
                      {passed && (
                        <>
                          <img
                            src={ICONS.iconchecked}
                            className="w-3 h-3 hidden md:block"
                            alt="checked"
                          />
                          <img
                            src={ICONS.filledIconCheck}
                            className="w-3 h-3 block md:hidden"
                            alt="checked mobile"
                          />
                        </>
                      )}
                    </div>
                    <p className={passed ? "text-(--color-slate-dark-blue)" : "text-(--color-forms-texts)"} >
                      {label}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            <Button disabled={isSubmitting} type="submit" className="mt-3 w-full">
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
          <p className="text-center text-(length:--body-md-size)
            font-(--body-md-weight)
            text-(--color-slate-medium-blue)
            leading-5
            mt-4">
            <span
            
              className="text-(--color-primary) cursor-pointer "
              onClick={() => navigate("/login")}
            >
              Back to Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
