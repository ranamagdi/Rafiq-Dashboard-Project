import Input from "../ui/Input";
import Button from "../ui/Button";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiError } from "../../types/apiTypes";
import { inviteMember } from "../../services/endpoints";
import z from "zod";
import { useState } from "react";
const BASE_URL = import.meta.env.VITE_API_URL;

const NewMembersPopup = ({ onClose }: { onClose: () => void }) => {
  const newMemberSchema = z.object({
    email: z.email("Invalid email address").nonempty("Email is required"),
  });

  type MembersFormValues = z.infer<typeof newMemberSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MembersFormValues>({
    resolver: zodResolver(newMemberSchema),
  });
  const handleClose = () => {
    reset();
    setStatus({ type: null, message: "" });
    onClose();
  };
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const { projectId } = useParams();
  const onSubmit: SubmitHandler<{ email: string }> = async (data) => {
    try {
      await inviteMember({
        p_email: data.email,
        p_project_id: projectId!,
        p_app_url: window.location.origin,
        p_base_url: BASE_URL,
      });

      setStatus({ type: "success", message: "Invitation sent!" });
      reset();
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: unknown) {
      const error = err as ApiError;
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message || error?.message || "Unknown error",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center  "  onClick={handleClose}>
      <div
        className="
            bg-white w-full max-w-md
            rounded-t-2xl md:rounded-lg
            shadow-lg p-6 relative
            animate-slide-up md:animate-none
            "
            onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-7 right-7 text-gray-500 hover:text-black font-bold"
        >
          ✕
        </button>

        <div className="bg-[#0052CC1A] rounded-sm w-14 h-14 items-center justify-center hidden md:flex mb-4">
          <svg
            width="22"
            height="16"
            viewBox="0 0 22 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 10V7H14V5H17V2H19V5H22V7H19V10H17ZM8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0Z"
              fill="#003D9B"
            />
          </svg>
        </div>

        <div className="flex items-center justify-center text-center w-full md:hidden mb-4">
          <svg
            width="48"
            height="6"
            viewBox="0 0 48 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="48"
              height="6"
              rx="3"
              fill="#C3C6D6"
              fillOpacity="0.3"
            />
          </svg>
        </div>

        <h3 className="text-[24px] font-semibold text-(--color-slate-dark-blue)">
          Invite Team Member
        </h3>

        <p className="text-sm text-(--color-slate-medium-blue)  mt-2 mb-5">
          Send an invitation to join the Architectural Studio work
        </p>
        {status.type && (
          <div
            className={`relative p-3 pr-10 rounded-sm text-sm border transition-all mt-5 ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {status.message}
            <button
              type="button"
              onClick={() => setStatus({ type: null, message: "" })}
              className="absolute top-2 right-2 text-lg leading-none text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-5"
        >
          <div className="flex flex-col">
            <label
              className={`text-xs uppercase mb-1 font-bold ${
                errors.email
                  ? "text-(--color-error)"
                  : "text-(--color-slate-medium-blue)"
              }`}
            >
              Email Address
            </label>

            <Input placeholder="Enter email address" {...register("email")} />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="text" onClick={handleClose}>
              Cancel
            </Button>

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NewMembersPopup;
