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
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { msg?: string } } };
      setErrorMessage(err.response?.data?.msg || "Something went wrong, please try again.");
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resendAttempts >= 3) return;
    try {
      setErrorMessage(null);
      await forgotPassword(getValues("email"));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { msg?: string } } };
      setErrorMessage(err.response?.data?.msg || "Something went wrong, please try again.");
    } finally {
      setTimer(300);
      setResendAttempts((prev) => prev + 1);
    }
  };

  const isResendDisabled = timer > 0 || resendAttempts >= 3;

  return (
    <div className="h-screen flex items-center justify-center">
    
      <div
        className="
          flex flex-col
          bg-white shadow-[0px_24px_48px_0px_#041b3c0f]
          rounded-(--radius-form)
          max-w-107 w-full mx-auto p-12
          max-md:bg-white max-md:shadow-[0px_24px_48px_0px_#041b3c0f]
          max-md:rounded-(--radius-form) max-md:max-w-[90%] max-md:p-10
        "
      >
                <div className="sm:bg-white">
        <div
          className="
            flex md:hidden items-center justify-center
            bg-(--color-surface-highest) rounded-full
            w-12 h-12 mx-auto mb-5.75
          "
        >
          <img src={ICONS.lockForgot} alt="Lock" />
        </div>

            
        <h3
          className="
            text-center text-[30px] font-(--headline-lg-weight)
            text-(--color-slate-dark-blue) leading-9
          "
        >
          Forgot password?
        </h3>

     
        <p
          className="
            text-center text-(length:--body-md-size)
            font-(--body-md-weight) text-(--color-slate-medium-blue)
            leading-5 mt-2
          "
        >
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

   
        <form
          className="pt-10 pb-4 flex flex-col justify-start items-start text-left w-full"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
       
          <div className="mb-5 w-full">
            <label
              className={`
                block text-(length:--label-sm-size) font-(--label-sm-weight)
                text-(--color-slate-medium-blue) leading-[16.5px] mb-3.5 uppercase
                ${errors.email ? "text-(--color-error)" : ""}
              `}
            >
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

          <Button disabled={isSubmitting} type="submit" className="w-full">
            {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
          </Button>
        </form>

        
        <p className="text-center text-(length:--body-md-size) font-(--body-md-weight) text-(--color-slate-medium-blue) leading-5 mt-4">
          <span
            className="text-(--color-primary) font-(--headline-lg-weight) cursor-pointer gap-2 flex items-center justify-center"
            onClick={() => navigate("/login")}
          >
            <img src={ICONS.backArrow} alt="Arrow" />
            Back to log in
          </span>
        </p>

        {successMessage && (
          <>
            <hr className="mt-7 border border-[#C3C6D6]/15" />

       
            <div className="hidden md:block">
           
              <div
                className="
                 bg-[#82f9be33]
                  text-(length:--body-md-size) font-(--body-md-weight)
                  text-[#005235] p-4 gap-3 leading-[17.5px]
                  rounded-(--radius-form) mt-6 flex items-start
                "
              >
          
                <p
                  className="
                    bg-[#005235] rounded-full flex items-center justify-center
                    w-5 h-5 shrink-0
                  "
                >
                  <span className="text-white text-xs">✓</span>
                </p>
                <span>
                  If an account exists with this email, we've sent a password
                  reset link.
                </span>
              </div>

       
              <div className="mt-3">
              
                <p
                  className="
                    text-center text-(length:--label-sm-size)
                    font-(--label-sm-weight) text-(--color-forms-texts)
                    uppercase
                  "
                >
                  Didn't receive the email?
                </p>
                <Button
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  backGround="var(--color-surface-low)"
                  color="#737685"
                  className="flex justify-center gap-2 mt-3 w-full"
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

   
            <div className="block md:hidden mt-10">
              <div
                className="
                  text-(length:--body-md-size) font-(--body-md-weight)
                  text-[#005235] bg-[#82f9be33] leading-[17.5px]
                  rounded-(--radius-form) mx-5
                    p-1 
                "
              >
                <div className="mt-6 flex items-start gap-4 px-4 pb-4">
             
                  <p
                    className="
                      bg-[#005235] rounded-full flex items-center justify-center
                      w-5 h-5 shrink-0
                    "
                  >
                    <span className="text-white text-xs">✓</span>
                  </p>
                  <span>
                    If an account exists with this email, we've sent a password
                    reset link.
                  </span>
                </div>

                <hr className="border border-[#C3C6D6]/15" />

                <div className="flex justify-between mt-3 px-4 pb-4">
          
                  <p
                    className="
                      text-center text-[#005235]/60
                      text-(length:--label-sm-size) font-(--label-sm-weight)
                      uppercase
                    "
                  >
                    Didn't receive the email?
                  </p>
         
                  <p
                    className="
                      text-center text-(--color-primary)
                      text-(length:--label-sm-size) font-(--label-sm-weight)
                      uppercase
                    "
                  >
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
    </div>
  );
};

export default ForgotPassword;