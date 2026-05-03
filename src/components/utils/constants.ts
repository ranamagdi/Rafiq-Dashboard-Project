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