import { ICONS } from "../../assets/index";

export type ViewOption = {
  value: "board" | "list";
  label: string;
  icon: string;
};

export const VIEW_OPTIONS: ViewOption[] = [
  { value: "board", label: "Board View", icon: ICONS.boardViewIcon },
  { value: "list", label: "List View", icon: ICONS.listViewIcon },
];
export const STATUS_OPTIONS = [
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "READY_FOR_QA",
  "READY_FOR_PRODUCTION",
  "DONE",
  "REOPENED",
] as const;
export const STATUS_MAP: Record<
  string,
  { label: string; style: string; dotColor: string }
> = {
  TO_DO: {
    label: "To Do",
    style: "bg-gray-200 text-gray-700",
    dotColor: "bg-gray-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    style: "bg-blue-200 text-blue-800",
    dotColor: "bg-blue-500",
  },
  IN_REVIEW: {
    label: "In Review",
    style: "bg-yellow-100 text-yellow-800",
    dotColor: "bg-yellow-400",
  },
  BLOCKED: {
    label: "Blocked",
    style: "bg-red-100 text-red-700",
    dotColor: "bg-red-400",
  },
  READY_FOR_QA: {
    label: "Ready for QA",
    style: "bg-purple-100 text-purple-700",
    dotColor: "bg-purple-400",
  },
  READY_FOR_PRODUCTION: {
    label: "Ready for Prod",
    style: "bg-indigo-100 text-indigo-700",
    dotColor: "bg-indigo-400",
  },
  DONE: {
    label: "Done",
    style: "bg-green-200 text-green-800",
    dotColor: "bg-emerald-500",
  },
  REOPENED: {
    label: "Reopened",
    style: "bg-orange-100 text-orange-700",
    dotColor: "bg-orange-400",
  },
};
