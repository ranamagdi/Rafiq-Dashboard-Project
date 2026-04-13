type Props = {
  variant?: "primary" | "text";
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  children: React.ReactNode;
};

const Button = ({
  variant = "primary",
  color,
  fontSize,
  fontWeight,
  children,
}: Props) => {
  let style: React.CSSProperties = {};

  if (variant === "primary") {
    style = {
      background:"linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
      color: color || "#fff",
      padding: "10px 24px",
      borderRadius: "2px",
      fontSize: "var(--body-md-size)",
      fontWeight: "var(--headline-lg-weight)",
      border: "none",
      height: "40px",
      boxShadow: "0px 1px 2px #0000000D",
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
    };
  }

  return <button style={style}>{children}</button>;
};

export default Button;
