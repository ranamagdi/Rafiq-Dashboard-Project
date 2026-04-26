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
import { ProjectTeamIcon, ProjectTeamResponsiveIcon } from "../ui/SvgIcons";
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
        <ProjectTeamIcon/>
        </div>

        <div className="flex items-center justify-center text-center w-full md:hidden mb-4">
         <ProjectTeamResponsiveIcon/>
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
