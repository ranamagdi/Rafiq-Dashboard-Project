import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useState, useEffect } from "react";
import { SelectArrow } from "../../../components/ui/SvgIcons";
import { ICONS } from "../../../assets/index";
import { PlusIcon } from "../../../components/ui/SvgIcons";
import {
  createTask,
  getProjectMembers,
  getProjectEpic,
} from "../../../services/endpoints";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import type {
  ApiError,
  Member,
  StatusVariant,
  Epic,
} from "../../../types/apiTypes";
import Breadcrumb from "../../../components/common/Breadcramb/Breadcrumb";

const tasksSchema = z.object({
  title: z.string().nonempty("Title is required"),

  epic_id: z.string().optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  assignee_id: z.string().optional(),
  status: z.enum([
    "TO_DO",
    "IN_PROGRESS",
    "DONE",
    "BLOCKED",
    "IN_REVIEW",
    "READY_FOR_QA",
    "REOPENED",
    "READY_FOR_PRODUCTION",
  ]),

  due_date: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selected = new Date(value);
      return selected >= today;
    }, "Due date must be today or a future date"),
});

type TaskFormValues = z.infer<typeof tasksSchema>;

export default function CreateTask() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const STATUS_OPTIONS: StatusVariant[] = [
    "TO_DO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "BLOCKED",
    "READY_FOR_QA",
    "READY_FOR_PRODUCTION",
    "DONE",
    "REOPENED",
  ];
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    mode: "onChange",
    resolver: zodResolver(tasksSchema),
    defaultValues: {
      status: "TO_DO",
    },
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
  useEffect(() => {
    if (!projectId) return;

    const fetchMembers = async () => {
      try {
        const res = await getProjectMembers(projectId);
        const data: Member[] = res.data as Member[];

        setMembers(data || []);
      } catch (err) {
        console.error("Failed to fetch members", err);
      }
    };

    fetchMembers();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    const fetchEpics = async () => {
      try {
        const res = await getProjectEpic(projectId);
        const data: Epic[] = res.data as Epic[];

        setEpics(data || []);
      } catch (err) {
        console.error("Failed to fetch epics", err);
      }
    };

    fetchEpics();
  }, [projectId]);
  const handleSubmitForm: SubmitHandler<TaskFormValues> = async (data) => {
    try {
      await createTask({
        ...data,
        project_id: projectId!,
      });

      reset();

      setStatus({
        type: "success",
        message: "Epic created successfully",
      });
      setTimeout(() => {
        navigate(`/dashboard/project/${projectId}/tasks`);
      }, 1500);
    } catch (err: unknown) {
      const error = err as ApiError;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      setStatus({
        type: "error",
        message: `Failed to create Task: ${message}`,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <Breadcrumb />

      <div className="py-5">
        <h3 className="text-[30px] font-(--headline-lg-weight) text-(--color-slate-dark-blue)">
          Create New Task
        </h3>
        <p className="text-sm text-(--color-slate-medium-blue) mt-2 max-w-lg">
          Initialize a new work item within the Architectural Workspace
          ecosystem.
        </p>
      </div>

      <div
        className="
          flex flex-col
          md:bg-white bg-transparent
          md:shadow-[0px_24px_48px_0px_#041b3c0f] shadow-none
          md:rounded-(--radius-form) rounded-none
          mx-auto
          mb-2
          p-2 md:p-8
        "
      >
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
          <div className="mb-6 w-full flex flex-col sm:items-start gap-2 sm:gap-6">
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
                placeholder="e.g., Finalize structural schematics"
                isValid={!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="error-message mt-1">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="mb-6 w-full flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-(--color-slate-medium-blue)">
                  STATUS <span className="text-(--color-error)">*</span>
                </label>

                <div className="relative mt-2">
                  <select
                    {...register("status")}
                    defaultValue=""
                    className="w-full appearance-none bg-(--color-surface-highest) rounded-sm px-4 py-2.5 text-sm outline-none border-none"
                  >
                    <option value="" disabled hidden>
                      Select status
                    </option>

                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <SelectArrow />
                  </div>
                </div>

                {errors.status && (
                  <p className="error-message mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-4 mt-2">
              <div className="flex-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-(--color-slate-medium-blue) block">
                  ASSIGNEE
                </label>

                <div className="relative mt-2">
                  <select
                    {...register("assignee_id")}
                    defaultValue=""
                    className="w-full appearance-none bg-(--color-surface-highest) rounded-sm px-4 py-2.5 text-sm text-[#041B3C] outline-none border-none cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      Select a member...
                    </option>

                    {members.map((member) => (
                      <option key={member.member_id} value={member.user_id}>
                        {member.metadata?.name || member.email}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <SelectArrow />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 w-full">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-(--color-slate-medium-blue)">
              EPIC
            </label>

            <div className="relative mt-2">
              <select
                {...register("epic_id")}
                defaultValue=""
                className="w-full appearance-none bg-(--color-surface-highest) rounded-sm px-4 py-2.5 text-sm outline-none border-none"
              >
                <option value="">Select Epic Link</option>

                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <SelectArrow />
              </div>
            </div>
          </div>

          <div className="mb-6 w-full">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-(--color-slate-medium-blue) block mb-1.5">
              Due Date
            </label>
            <Input
              type="date"
              placeholder="mm/dd/yyyy"
              {...register("due_date")}
              className="hide-date-icon"
              icon={ICONS.calender}
              hideIconOnMd={true}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.due_date && (
              <p className="error-message mt-1">{errors.due_date.message}</p>
            )}
          </div>
          <div className="mb-6 w-full flex flex-col sm:items-start gap-2 sm:gap-6">
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
            </div>
            <div className="flex-1 w-full">
              <div className="relative">
                <textarea
                  placeholder="Provide detailed context for this task..."
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
          <div
            className="
                sm:static fixed bottom-0 left-0 w-full
                sm:bg-transparent bg-white
                sm:border-0 border-t border-gray-200
                px-4 sm:px-0 py-4 sm:py-0
                flex flex-col-reverse sm:flex-row justify-end gap-3
                z-50
            "
          >
            <div className="max-w-7xl mx-auto w-full flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                className="w-full sm:w-auto"
                type="button"
                variant="text"
                onClick={() => navigate(-1)}
                color="var(--color-slate-medium-blue)"
              >
               
                Back
              </Button>

              <Button
                className="w-full sm:w-auto gap-2"
                disabled={isSubmitting}
                type="submit"
              >
                 <PlusIcon className=" sm:hidden"/>
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
