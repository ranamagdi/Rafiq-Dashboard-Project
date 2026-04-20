import React from "react";
import { cn } from "../utils/cn";

type Props = {
  variant?: "primary" | "text";
  className?: string;
  backGround?: string; 
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  variant = "primary",
  className,
  disabled,
  backGround,
  children,
  type = "button",
  ...rest
}: Props) => {
  const base = "h-10 px-6 rounded-sm text-sm font-semibold transition flex items-center justify-center";

  const variants = {
    primary:
      "text-white shadow-[0px_1px_2px_0px_#0000000D] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)]",
    text: "bg-transparent text-[var(--color-primary)]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        base,
        variants[variant],
        disabled && "opacity-60 cursor-not-allowed **:cursor-not-allowed",
        className
      )}
      style={
        backGround
          ? { background: backGround }
          : undefined
      }
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;