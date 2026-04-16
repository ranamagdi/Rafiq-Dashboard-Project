import React from "react";

type ErrorContentProps = {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

const ErrorContent = ({
  icon,
  title = "No Data",
  description = "Nothing to show here yet.",
  children,
}: ErrorContentProps) => {
  return (
    <div className="flex flex-col justify-center items-center text-center py-10 px-4">
      {icon && (
        <div className="w-14 h-14 bg-[#FFDAD6] rounded-2xl flex items-center justify-center mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-[#041B3C] font-semibold text-[20px] mb-2">
        {title}
      </h3>

      <p className="text-[16px] text-[#434654] max-w-md mb-6">
        {description}
      </p>

      {children}
    </div>
  );
};

export default ErrorContent;