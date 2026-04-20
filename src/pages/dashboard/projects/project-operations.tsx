import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useState, useEffect, useRef } from "react";
import {
  createProject,
  updateProject,
  getProject,
} from "../../../services/endpoints";
import { useForm } from "react-hook-form";
import { useWatch, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const projectSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;
type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function Projects() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [initialName, setInitialName] = useState("");
  const [initialDescription, setInitialDescription] = useState("");

  const hasFetched = useRef(false);
  const isEditMode = !!projectId;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialName,
      description: initialDescription,
    },
  });

  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const descriptionValue = useWatch({
    control,
    name: "description",
    defaultValue: initialDescription,
  });
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        const res = await getProject(projectId);
        const data = Array.isArray(res) ? res[0] : res?.data;

        if (!data) {
          setStatus({ type: "error", message: "Project not found" });
          return;
        }

        const name = data.name || "";
        const description = data.description || "";

        setInitialName(name);
        setInitialDescription(description);
        reset({ name, description });
      } catch (err: unknown) {
        const error = err as ApiError;
        setStatus({
          type: "error",
          message: `Failed to fetch project: ${error?.response?.data?.message || error?.message || "Unknown error"}`,
        });
      }
    };

    fetchProject();
  }, [projectId, reset]);

  const handleSubmitForm: SubmitHandler<ProjectFormValues> = async (data) => {
    try {
      if (isEditMode) {
        await updateProject(projectId, {
          name: data.name,
          description: data.description ?? "",
        });

        setStatus({
          type: "success",
          message: "Project updated successfully",
        });
      } else {
        await createProject({
          name: data.name,
          description: data.description ?? "",
        });

        reset();

        setStatus({
          type: "success",
          message: "Project created successfully",
        });
      }
      setTimeout(() => {
        navigate("/dashboard/projects");
      }, 1500);
    } catch (err: unknown) {
      const error = err as ApiError;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      setStatus({
        type: "error",
        message: `Failed to ${isEditMode ? "update" : "create"} project: ${message}`,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="md:flex items-center gap-2 mt-5 hidden ">
        <p
          onClick={() => navigate("/dashboard/projects")}
          className="text-[#43465499] text-[12px] font-bold uppercase cursor-pointer hover:text-[#003D9B]"
        >
          Projects
        </p>

        <span className="text-[#43465466] text-[12px] font-bold">&gt;</span>

        <p className="text-[#003D9B] text-[12px] font-bold uppercase cursor-pointer">
          {isEditMode ? "Edit Project" : "Add New Project"}
        </p>
      </div>

      <div className="hidden grid-cols-12 items-center md:grid">
        <div className="col-span-12 md:col-span-10 ">
          <h2 className="text-[#041B3C] text-[30px] font-semibold ">
            {isEditMode ? "Edit Project" : "Add New Project"}
          </h2>
        </div>
        <div className="col-span-12 md:col-span-2 justify-end hidden sm:flex">
          <Button className="flex justify-center gap-2 items-center">
            <svg
              width="19"
              height="14"
              viewBox="0 0 19 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1667 8.33333V5.83333H11.6667V4.16667H14.1667V1.66667H15.8333V4.16667H18.3333V5.83333H15.8333V8.33333H14.1667ZM6.66667 6.66667C5.75 6.66667 4.96528 6.34028 4.3125 5.6875C3.65972 5.03472 3.33333 4.25 3.33333 3.33333C3.33333 2.41667 3.65972 1.63194 4.3125 0.979167C4.96528 0.326389 5.75 0 6.66667 0C7.58333 0 8.36806 0.326389 9.02083 0.979167C9.67361 1.63194 10 2.41667 10 3.33333C10 4.25 9.67361 5.03472 9.02083 5.6875C8.36806 6.34028 7.58333 6.66667 6.66667 6.66667ZM0 13.3333V11C0 10.5278 0.121528 10.0938 0.364583 9.69792C0.607639 9.30208 0.930556 9 1.33333 8.79167C2.19444 8.36111 3.06944 8.03819 3.95833 7.82292C4.84722 7.60764 5.75 7.5 6.66667 7.5C7.58333 7.5 8.48611 7.60764 9.375 7.82292C10.2639 8.03819 11.1389 8.36111 12 8.79167C12.4028 9 12.7257 9.30208 12.9688 9.69792C13.2118 10.0938 13.3333 10.5278 13.3333 11V13.3333H0Z"
                fill="white"
              />
            </svg>
            Invite Member
          </Button>
        </div>
      </div>

      <div
        className="
        flex flex-col
        md:bg-white bg-transparent
        md:shadow-[0px_24px_48px_0px_#041b3c0f] shadow-none
        md:rounded-(--radius-form) rounded-none
        max-w-full md:max-w-xl
        mx-auto
        p-2 md:p-12
      "
      >
        <div className="flex gap-2 items-center">
          <div className="bg-[#0052CC1A] rounded-sm w-14 h-14 items-center justify-center hidden md:flex">
            <svg
              width="22"
              height="20"
              viewBox="0 0 22 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.0833 0 12.1083 0.158333 13.075 0.475C14.0417 0.791667 14.9333 1.23333 15.75 1.8L14.3 3.275C13.6667 2.875 12.9917 2.5625 12.275 2.3375C11.5583 2.1125 10.8 2 10 2C7.78333 2 5.89583 2.77917 4.3375 4.3375C2.77917 5.89583 2 7.78333 2 10C2 12.2167 2.77917 14.1042 4.3375 15.6625C5.89583 17.2208 7.78333 18 10 18C10.5333 18 11.05 17.95 11.55 17.85C12.05 17.75 12.5333 17.6083 13 17.425L14.5 18.95C13.8167 19.2833 13.1 19.5417 12.35 19.725C11.6 19.9083 10.8167 20 10 20ZM17 18V15H14V13H17V10H19V13H22V15H19V18H17ZM8.6 14.6L4.35 10.35L5.75 8.95L8.6 11.8L18.6 1.775L20 3.175L8.6 14.6Z"
                fill="var(--color-primary)"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-[30px] font-(--headline-lg-weight) text-(--color-slate-dark-blue)">
              {isEditMode ? "Edit Project" : "Initialize New Project"}
            </h3>
            <p className="text-sm text-(--color-slate-medium-blue) mt-2">
              {isEditMode
                ? "Update the details of your project."
                : "Define the scope and foundational details of your project."}
            </p>
          </div>
        </div>

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
          className="flex flex-col items-start pt-10 pb-4 w-full"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <div className="mb-5 w-full">
            <label
              className={`
                text-(length:--label-sm-size)
                font-(--label-sm-weight)
                text-(--color-slate-medium-blue)
                uppercase mb-3
                ${errors.name ? "text-(--color-error)" : ""}
              `}
            >
              PROJECT TITLE <span className="error-label"> *</span>
            </label>

            <Input
              type="text"
              placeholder="Project Title"
              isValid={!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-5 w-full">
            <div className="flex items-center justify-between">
              <label
                className={`
                  text-(length:--label-sm-size)
                  font-(--label-sm-weight)
                  text-(--color-slate-medium-blue)
                  uppercase mb-3
                  ${errors.description ? "text-(--color-error)" : ""}
                `}
              >
                DESCRIPTION
              </label>
              <span className="text-[var(--color-slate-medium-blue)99] text-[11px] font-normal">
                Optional
              </span>
            </div>

            <div className="relative">
              <textarea
                placeholder="Provide a high-level overview of the project's architectural objectives and key milestones..."
                rows={5}
                className={`
                  px-4 py-3 pb-8 resize-none
                  w-full rounded-sm outline-none border-none
                  pr-10 pl-4 bg-(--color-surface-highest)
                  ${errors.description ? "bg-(--color-error-field)" : ""}
                `}
                {...register("description")}
              />
              <span className="absolute bottom-3 right-4 text-[var(--color-slate-medium-blue)99] text-[11px] pointer-events-none">
                {(descriptionValue ?? "").length} / 500 characters
              </span>
            </div>

            {errors.description && (
              <p className="error-message">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row w-full gap-3 sm:gap-0 sm:items-center">
            <div className="w-full sm:w-1/2 sm:flex sm:justify-start">
              <Button
                className="w-full sm:w-auto"
                type="button"
                variant="text"
                color="var(--color-slate-medium-blue)"
                onClick={() => navigate("/dashboard/projects")}
              >
                Cancel
              </Button>
            </div>

            <div className="w-full sm:w-1/2 sm:flex sm:justify-end">
              <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Project"
                    : "Create Project"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-(--color-surface-highest) flex justify-between gap-2 p-3 rounded-sm max-w-full md:max-w-xl mx-auto mb-3">
        <svg
          width="12"
          height="15"
          viewBox="0 0 12 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.625 15C5.2125 15 4.85938 14.8531 4.56563 14.5594C4.27188 14.2656 4.125 13.9125 4.125 13.5H7.125C7.125 13.9125 6.97812 14.2656 6.68437 14.5594C6.39062 14.8531 6.0375 15 5.625 15ZM2.625 12.75V11.25H8.625V12.75H2.625ZM2.8125 10.5C1.95 9.9875 1.26562 9.3 0.759375 8.4375C0.253125 7.575 0 6.6375 0 5.625C0 4.0625 0.546875 2.73438 1.64062 1.64062C2.73438 0.546875 4.0625 0 5.625 0C7.1875 0 8.51562 0.546875 9.60938 1.64062C10.7031 2.73438 11.25 4.0625 11.25 5.625C11.25 6.6375 10.9969 7.575 10.4906 8.4375C9.98438 9.3 9.3 9.9875 8.4375 10.5H2.8125ZM3.2625 9H7.9875C8.55 8.6 8.98438 8.10625 9.29062 7.51875C9.59687 6.93125 9.75 6.3 9.75 5.625C9.75 4.475 9.35 3.5 8.55 2.7C7.75 1.9 6.775 1.5 5.625 1.5C4.475 1.5 3.5 1.9 2.7 2.7C1.9 3.5 1.5 4.475 1.5 5.625C1.5 6.3 1.65313 6.93125 1.95938 7.51875C2.26562 8.10625 2.7 8.6 3.2625 9Z"
            fill="var(--color-slate-medium-blue)"
          />
        </svg>
        <span className="text-(--color-slate-medium-blue) font-normal text-[12px]">
          <span className="font-bold">Pro Tip:</span> You can invite project
          members and assign epics immediately after the initial creation
          process.
        </span>
      </div>
    </div>
  );
}
