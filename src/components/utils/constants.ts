import { ICONS } from "../../assets/index";
import type { Column, StatusVariant, StatusOption } from "../../types/apiTypes";

export type ViewOption = {
  value: "board" | "list";
  label: string;
  icon: string;
};

export const VIEW_OPTIONS: ViewOption[] = [
  { value: "board", label: "Board View", icon: ICONS.boardViewIcon },
  { value: "list", label: "List View", icon: ICONS.listViewIcon },
];
export const COLUMNS: Column[] = [
  {
    id: "todo",
    label: "TO DO",
    status: "TO_DO",
    dotColor: "#6b7280",
    badgeClass: "bg-gray-100 text-gray-600",
  },
  {
    id: "in_progress",
    label: "IN PROGRESS",
    status: "IN_PROGRESS",
    dotColor: "#3b82f6",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    id: "in_review",
    label: "IN REVIEW",
    status: "IN_REVIEW",
    dotColor: "#8b5cf6",
    badgeClass: "bg-violet-100 text-violet-700",
  },
  {
    id: "ready_qa",
    label: "READY FOR QA",
    status: "READY_FOR_QA",
    dotColor: "#f59e0b",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  {
    id: "blocked",
    label: "BLOCKED",
    status: "BLOCKED",
    dotColor: "#ef4444",
    badgeClass: "bg-red-100 text-red-700",
  },
  {
    id: "ready_prod",
    label: "READY FOR PROD",
    status: "READY_FOR_PRODUCTION",
    dotColor: "#06b6d4",
    badgeClass: "bg-cyan-100 text-cyan-700",
  },
  {
    id: "reopened",
    label: "REOPENED",
    status: "REOPENED",
    dotColor: "#f97316",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  {
    id: "done",
    label: "DONE",
    status: "DONE",
    dotColor: "#22c55e",
    badgeClass: "bg-green-100 text-green-700",
  },
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
  { label: string; style: string; dotColor: string; color: string }
> = {
  TO_DO:                { label: "To Do",            style: "bg-gray-200 text-gray-700",    dotColor: "bg-gray-400",    color: "#9ca3af" },
  IN_PROGRESS:          { label: "In Progress",      style: "bg-blue-200 text-blue-800",    dotColor: "bg-blue-500",    color: "#3b82f6" },
  IN_REVIEW:            { label: "In Review",        style: "bg-yellow-100 text-yellow-800",dotColor: "bg-yellow-400",  color: "#facc15" },
  BLOCKED:              { label: "Blocked",          style: "bg-red-100 text-red-700",      dotColor: "bg-red-400",     color: "#f87171" },
  READY_FOR_QA:         { label: "Ready for QA",     style: "bg-purple-100 text-purple-700",dotColor: "bg-purple-400",  color: "#c084fc" },
  READY_FOR_PRODUCTION: { label: "Ready for Prod",   style: "bg-indigo-100 text-indigo-700",dotColor: "bg-indigo-400",  color: "#818cf8" },
  DONE:                 { label: "Done",             style: "bg-green-200 text-green-800",  dotColor: "bg-emerald-500", color: "#10b981" },
  REOPENED:             { label: "Reopened",         style: "bg-orange-100 text-orange-700",dotColor: "bg-orange-400",  color: "#fb923c" },
};

const STATUS_LABEL_MAP: Record<StatusVariant, string> = {
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  BLOCKED: "Blocked",
  IN_REVIEW: "In Review",
  READY_FOR_QA: "Ready for QA",
  REOPENED: "Reopened",
  READY_FOR_PRODUCTION: "Ready for Production",
};
export const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export const statusOptions: StatusOption[] = [
  { value: "all", label: "All Statuses" },
  ...(Object.keys(STATUS_LABEL_MAP) as StatusVariant[]).map((key) => ({
    value: key,
    label: STATUS_LABEL_MAP[key],
  })),
];
