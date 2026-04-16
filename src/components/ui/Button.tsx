import React from "react";

type Props = {
  variant?: "primary" | "text";
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  children: React.ReactNode;
  className?: string;
  backGround?:string
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  variant = "primary",
  color,
  fontSize,
  fontWeight,
  children,
  className,
  disabled,
  backGround,
  type = "button",
  ...rest
}: Props) => {
  let style: React.CSSProperties = {};

  if (variant === "primary") {
    style = {
      background:backGround||
        "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
      color: color || "#fff",
      padding: "10px 24px",
      borderRadius: "4px",
      fontSize: "var(--body-md-size)",
      fontWeight: "var(--headline-lg-weight)",
      border: "none",
      height: "40px",
     
      boxShadow: "0px 1px 2px #0000000D",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    };
  } else {
    style = {
      background: "transparent",
      color: color || "var(--color-primary)",
      padding: "10px 24px",
      fontSize: fontSize || "var(--body-md-size)",
      fontWeight: fontWeight || "var(--headline-lg-weight)",
      border: "none",
      height: "40px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    };
  }

  return (
    <button
      style={style}
      className={className}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
