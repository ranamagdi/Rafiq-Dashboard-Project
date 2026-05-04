import { useEffect, useRef } from "react";

interface EditableDescriptionProps {
  value: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  onCancel: () => void;
}

const EditableDescription = ({
  value,
  isEditing,
  isSaving,
  onEdit,
  onChange,
  onBlur,
  onCancel,
}: EditableDescriptionProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();

      textareaRef.current.setSelectionRange(0, 0);

    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={value}
        dir="ltr"
        style={{ direction: "ltr", textAlign: "left" }}
        rows={5}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onCancel();
          }
        }}
        className="w-full text-sm text-gray-600 bg-gray-50 border border-blue-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 resize-none"
        maxLength={500}
        placeholder="Add a description..."
      />
    );
  }

  return (
    <div className="group relative">
      <p className="text-sm text-gray-600 leading-relaxed pr-7">
        {value || (
          <span className="text-gray-400 italic">
            No description provided.
          </span>
        )}
      </p>

      <button
        onClick={onEdit}
        disabled={isSaving}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500"
      >
        {isSaving ? "..." : "✏️"}
      </button>
    </div>
  );
};

export default EditableDescription;