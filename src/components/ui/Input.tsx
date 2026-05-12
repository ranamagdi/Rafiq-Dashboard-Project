import React from "react";
import { cn } from "../utils/cn";

type Props = {
  isValid?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  specialStyle?: string;
  hideIconOnMd?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      isValid = true,
      icon,
      iconPosition = "right",
      hideIconOnMd,
      specialStyle,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div className="relative w-full mt-1">
        <input
          ref={ref}
          className={cn(
            "w-full h-11 rounded-sm outline-none border-none pr-10 pl-4",
            icon
              ? iconPosition === "right"
                ? "pr-10 pl-4"
                : "pl-10 pr-4"
              : "px-4",
            isValid
              ? specialStyle || "bg-(--color-surface-highest)"
              : "bg-(--color-error-field)",
            className,
          )}
          {...rest}
        />

        {icon && (
          <span
            className={cn(
              "absolute inset-y-0 flex items-center justify-center w-10 h-full opacity-60",
              iconPosition === "right" ? "right-0 pr-3" : "left-0 pl-3",
              hideIconOnMd && "md:hidden",
            )}
          >
            <img src={icon} alt="icon" className="w-5 h-5" />
          </span>
        )}
      </div>
    );
  },
);

export default Input;
