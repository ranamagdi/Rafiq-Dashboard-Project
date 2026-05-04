import type { Task, StatusVariant } from "../../types/apiTypes";

const STATUS_OPTIONS = [
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "READY_FOR_QA",
  "READY_FOR_PRODUCTION",
  "DONE",
  "REOPENED",
] as const;

interface Props {
  task: Task;
  isEditing: boolean;
  isSaving: boolean;
  startEdit: () => void;
  onChange: (status: StatusVariant) => void;
  onBlur: () => void;
}

const EditableStatus = ({
  task,
  isEditing,
  isSaving,
  startEdit,
  onChange,
  onBlur,
}: Props) => {
  if (isEditing) {
    return (
      <select
        autoFocus
        defaultValue={task.status}
        onChange={(e) =>
          onChange(e.target.value as StatusVariant)
        }
        onBlur={onBlur}
        className="w-full text-sm border rounded px-2 py-1.5"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button onClick={startEdit} className="w-full text-left">
      {isSaving ? "Saving..." : task.status}
    </button>
  );
};

export default EditableStatus;