import React from "react";
import { cn } from "../utils/cn";

type Props = {
  isValid?: boolean;
  icon?: string;
  specialStyle?: string;
  hideIconOnMd?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ isValid = true, icon, hideIconOnMd, specialStyle, className, ...rest }, ref) => {
    return (
      <div className="relative w-full mt-1">
        <input
          ref={ref}
          className={cn(
            "w-full h-11 rounded-sm outline-none border-none pr-10 pl-4",
            isValid
              ? specialStyle || "bg-(--color-surface-highest)"
              : "bg-(--color-error-field)",
            className
          )}
          {...rest}
        />

        {icon && (
          <img
            src={icon}
            alt="icon"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60",
              hideIconOnMd && "md:hidden"
            )}
          />
        )}
      </div>
    );
  }
);

export default Input;