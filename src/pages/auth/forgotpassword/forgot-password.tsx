import "../authStyle.css";
import { ICONS } from "../../../assets/index";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { forgotPassword } from "../../../services/endpoints";
import { useState, useEffect } from "react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const loginSchema = z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
  });

  type FormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
  });

  const handleSubmitForm: SubmitHandler<FormData> = async (data) => {
    try {
      setErrorMessage(null);
      await forgotPassword(data.email);
      setSuccessMessage(true);
      setTimer(300);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg = error?.response?.data?.msg;
      setErrorMessage(msg || "Something went wrong, please try again.");
    }
  };
  const handleResend = async () => {
    if (timer > 0 || resendAttempts >= 3) return;

    try {
      setErrorMessage(null);
      await forgotPassword(getValues("email"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg =
        error?.response?.data?.msg ||
        error?.message ||
        "Something went wrong, please try again.";
      setErrorMessage(msg);
    } finally {
      setTimer(300);
      setResendAttempts((prev) => prev + 1);
    }
  };

  const isResendDisabled = timer > 0 || resendAttempts >= 3;

  return (
    <div className="h-screen items-center">
      <div className="auth-container auth-container-forgot">
        <div className="lockforgot-container mx-auto">
          <img src={ICONS.lockForgot} alt="Lock" />
        </div>
        <h3 className="h3-auth-container">Forgot password?</h3>
        <p className="h3-auth-container">
          No worries, we'll send you reset instructions.
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
            <label className={errors.email ? "error-label" : ""}>
              Email Address
            </label>
            <Input
              type="text"
              placeholder="Enter your email"
              isValid={!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center auth-text">
          <span
            className="text-primary cursor-pointer gap-2 flex items-center justify-center"
            onClick={() => navigate("/login")}
          >
            <img src={ICONS.backArrow} alt="Arrow" />
            Back to log in
          </span>
        </p>

        {successMessage && (
          <>
            <hr className="mt-7 border border-[#C3C6D6]/15" />

            <div className="desktop-send-section">
              <div className="verify-email mt-6 flex align-top">
                <p className="check-forgot">
                  <span className="text-white">✓</span>
                </p>
                <span>
                  If an account exists with this email, we've sent a password
                  reset link.
                </span>
              </div>
              <div className="not-receive-section mt-3">
                <p className="text-center">Didn't receive the email?</p>
                <Button
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  backGround="var(--color-surface-low)"
                  color="#737685"
                  className="flex justify-center gap-2 mt-3"
                >
                  <img src={ICONS.clock} alt="clock" />
                  {resendAttempts >= 3 ? (
                    <span>Maximum attempts reached</span>
                  ) : timer > 0 ? (
                    <span>Resend in {formatTime(timer)}</span>
                  ) : (
                    <span>Don't Receive An Email? Resend</span>
                  )}
                </Button>
              </div>
            </div>

            <div className="responsive-send-section mt-10">
              <div className="verify-email mx-5">
                <div className="mt-6 flex align-top gap-4 px-4">
                  <p className="check-forgot">
                    <span className="text-white">✓</span>
                  </p>
                  <span>
                    If an account exists with this email, we've sent a password
                    reset link.
                  </span>
                </div>
                <hr className="mt-7 border border-[#C3C6D6]/15" />
                <div className="flex justify-between mt-3">
                  <p className="text-center responsive-not-recived">
                    Didn't receive the email?
                  </p>
                  <p className="text-center responsive-counter">
                    {resendAttempts >= 3
                      ? "No attempts left"
                      : timer > 0
                        ? `Resend in ${formatTime(timer)}`
                        : "Resend"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
