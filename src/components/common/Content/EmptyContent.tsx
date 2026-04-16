import React from "react";

type EmptyContentProps = {
  image?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

const EmptyContent = ({
  image,
  title = "No Data",
  description = "Nothing to show here yet.",
  children,
}: EmptyContentProps) => {
  return (
    <div className="flex flex-col justify-center items-center text-center py-10 px-4">
      {image && (
        <img
          src={image}
          alt="empty"
          className="w-60 h-auto mb-6 object-contain"
        />
      )}

      <h3 className="text-[#041B3C] font-semibold text-[28px] mb-2">
        {title}
      </h3>

      <p className="text-[16px] text-[#434654] max-w-md mb-6">
        {description}
      </p>

      {children}
    </div>
  );
};

export default EmptyContent;