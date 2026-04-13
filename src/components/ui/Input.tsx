import React from "react";

type Props = {
  isValid?: boolean;
  placeholder?: string;
  type?: string;
  icon?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ isValid = true, placeholder, type, icon, ...rest }, ref) => {
    return (
      <div className="relative w-full mt-1">
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            w-full h-11 rounded-sm outline-none border-none
            pr-10 pl-4
            ${
              isValid
                ? "bg-(--color-surface-highest)"
                : "bg-(--color-error-field)"
            }
          `}
          {...rest} 
        />

        {icon && (
          <img
            src={icon}
            alt="icon"
            className="absolute right-3 top-1/2 md:hidden -translate-y-1/2 w-5 h-5 opacity-60"
          />
        )}
      </div>
    );
  }
);

export default Input;