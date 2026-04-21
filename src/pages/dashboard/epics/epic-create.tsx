import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useState } from "react";
import { createEpic } from "../../../services/endpoints";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const epicSchema = z.object({
  title: z
    .string()
    .nonempty("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  assignee: z.string().optional(),
  deadline: z.string().optional(),
});

type EpicFormValues = z.infer<typeof epicSchema>;

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function CreateEpic() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema),
  });

  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const descriptionValue = useWatch({
    control,
    name: "description",
    defaultValue: "",
  });

  const handleSubmitForm: SubmitHandler<EpicFormValues> = async (data) => {
    try {
      await createEpic({
        title: data.title,
        description: data.description,
        assignee_id: data.assignee,
        deadline: data.deadline,
        project_id: projectId,
      });

      reset();

      setStatus({
        type: "success",
        message: "Epic created successfully",
      });
    } catch (err: unknown) {
      const error = err as ApiError;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      setStatus({
        type: "error",
        message: `Failed to create epic: ${message}`,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="py-5">
        <h3 className="text-[30px] font-(--headline-lg-weight) text-(--color-slate-dark-blue)">
          Create New Epic
        </h3>
        <p className="text-sm text-(--color-slate-medium-blue) mt-2 max-w-lg">
          Define a major project phase or high-level milestone to group related
          tasks and track architectural progress.
        </p>
      </div>

      {/* Form Card */}
      <div
        className="
          flex flex-col
          md:bg-white bg-transparent
          md:shadow-[0px_24px_48px_0px_#041b3c0f] shadow-none
          md:rounded-(--radius-form) rounded-none
          mx-auto
          p-2 md:p-12
        "
      >
        {/* Status Banner */}
        {status.type && (
          <div
            className={`relative p-3 pr-10 rounded-sm text-sm border transition-all mb-6 ${
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
          className="flex flex-col items-start pb-4 w-full"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          {/* Title Field */}
          <div className="mb-6 w-full flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
            <div className="w-full sm:w-40 shrink-0 sm:pt-2">
              <label
                className={`text-[11px] font-semibold uppercase tracking-wide block ${
                  errors.title
                    ? "text-(--color-error)"
                    : "text-(--color-slate-medium-blue)"
                }`}
              >
                TITLE <span className="text-(--color-error)">*</span>
              </label>
            </div>
            <div className="flex-1 w-full">
              <Input
                type="text"
                placeholder="e.g. Structural Foundation Phase"
                isValid={!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="error-message flex items-center gap-1 mt-1">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    className="shrink-0"
                  >
                    <circle
                      cx="6.5"
                      cy="6.5"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <path
                      d="M6.5 3.5v3.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <circle cx="6.5" cy="9" r="0.6" fill="currentColor" />
                  </svg>
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div className="mb-6 w-full flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
            <div className="w-full sm:w-40 shrink-0 sm:pt-2">
              <label
                className={`text-[11px] font-semibold uppercase tracking-wide block ${
                  errors.description
                    ? "text-(--color-error)"
                    : "text-(--color-slate-medium-blue)"
                }`}
              >
                DESCRIPTION
              </label>
              <span className="text-[11px] text-(--color-slate-medium-blue) opacity-60 mt-1 block">
                Optional
              </span>
            </div>
            <div className="flex-1 w-full">
              <div className="relative">
                <textarea
                  placeholder="Describe the scope and objectives of this epic..."
                  rows={5}
                  className={`
                    px-4 py-3 pb-8 resize-none w-full rounded-sm outline-none border-none
                    pr-10 pl-4 bg-(--color-surface-highest) text-sm
                    ${errors.description ? "bg-(--color-error-field)" : ""}
                  `}
                  {...register("description")}
                />
                <span className="absolute bottom-3 right-4 text-[11px] text-(--color-slate-medium-blue) opacity-60 pointer-events-none">
                  {(descriptionValue ?? "").length} / 500 characters
                </span>
              </div>
              {errors.description && (
                <p className="error-message mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-8 w-full flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
          
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
             
              <div className="flex-1">
              
              <label className="text-[11px] font-semibold uppercase tracking-wide text-(--color-slate-medium-blue) block">
                ASSIGNEE
              </label>
          
                <div className="relative mt-2">
                  <select
                    className="
                      w-full appearance-none
                      bg-(--color-surface-highest)
                      rounded-sm px-4 py-2.5 text-sm
                      text-(--color-slate-medium-blue)
                      outline-none border-none cursor-pointer
                    "
                    {...register("assignee")}
                  >
                    <option value="">Select a member...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="var(--color-slate-medium-blue)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Deadline Input */}
              <div className="flex-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-(--color-slate-medium-blue) block mb-1.5">
                  DEADLINE
                </label>
                <Input
                  type="date"
                  placeholder="mm/dd/yyyy"
                  {...register("deadline")}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end w-full gap-3 pt-6">
            <Button
              type="button"
              variant="text"
              color="var(--color-slate-medium-blue)"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Epic"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
