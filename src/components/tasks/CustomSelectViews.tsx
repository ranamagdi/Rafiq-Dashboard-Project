import type { StylesConfig } from "react-select";
import type { ViewOption } from "../utils/constants";

export const viewSelectStyles: StylesConfig<ViewOption, false> = {
  control: (base, state) => ({
    ...base,
    height: "40px",
    minHeight: "40px",
    backgroundColor: "white",
    border: state.menuIsOpen ? "1px solid #d1d5db" : "1px solid #d1d5db",
    borderRadius: "8px",
    boxShadow: "none",
    cursor: "pointer",
    paddingLeft: "4px",
    paddingRight: "0px",
    "&:hover": { borderColor: "#d1d5db" },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 4px",
    gap: "8px",
    display: "flex",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#041B3C",
    fontSize: "14px",
    fontWeight: 500,
    margin: 0,
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: "#041B3C",
    padding: "0 8px",
    transition: "transform 0.2s",
    transform: state.selectProps.menuIsOpen
      ? "rotate(180deg)"
      : "rotate(0deg)",
    "&:hover": { color: "#041B3C" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "8px",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    border: "1px solid #f3f4f6",
    overflow: "hidden",
   
    right: 0,
    left: "auto",
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#eff6ff"
      : state.isFocused
        ? "#f9fafb"
        : "white",
    color: state.isSelected ? "#2563eb" : "#041B3C",
    "&:active": { backgroundColor: "#eff6ff" },
  }),
};
