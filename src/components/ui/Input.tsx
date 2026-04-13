

type Props = {
  isValid?: boolean;
  placeholder?: string;
};

const Input = ({ isValid = true, placeholder }: Props) => {
  let style: React.CSSProperties = {};

  if (isValid) {
    style = {
    //   width: "568px",
      height: "44px",
      borderRadius: "4px",
      padding: "13px 16px 14px 16px",
      background: "var(--color-surface-highest)",
      border: "none",
      outline: "none",
    };
  } else {
    style = {
    //   width: "568px",
      height: "44px",
      borderRadius: "4px",
      padding: "12px 16px",
      background: "var(--color-error-field)",
      border: "none",
      outline: "none",
    };
  }

  return (
    <input
      style={style}
      placeholder={placeholder}
      className={!isValid ? "invalid" : ""}
    />
  );
};

export default Input;