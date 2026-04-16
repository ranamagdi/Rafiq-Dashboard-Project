type ProjectCardProps = {
  title?: string;
  description?: string;
  createdAt?: string;
  onClick?: () => void;
  className?:string;
  variant?: "default" | "add";
};
const formatDate = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
export default function ProjectCard({
  title,
  description,
  createdAt,
  onClick,
  className,
  variant = "default",
}: ProjectCardProps) {
  if (variant === "add") {
    return (
      <div
        onClick={onClick}
        className={`
        bg-white rounded-lg p-8
          border-2 border-dashed border-[#C3C6D633]
        hover:shadow-md transition cursor-pointer
        flex flex-col gap-2 text-center items-center
        justify-center align-middle ${className}`

        }
      >
        <div className="w-10 h-10 rounded-xl bg-[#F1F3FF] flex items-center justify-center mb-3 p-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 15H11V11H15V9H11V5H9V9H5V11H9V15ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
              fill="#041B3C"
            />
          </svg>
        </div>

        <p className="text-[14px] font-bold text-[#434654] uppercase">
          ADD PROJECT
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg p-8 
       
        flex flex-col gap-2
        ${className}`
      }
    >
      {title && (
        <h3 className="text-[18px] font-medium text-[#041B3C]">{title}</h3>
      )}

      {description && (
        <p className="text-[14px] text-[#434654] line-clamp-3 font-normal">
          {description}
        </p>
      )}
      <hr className="mt-7 mb-3 border border-[#C3C6D6]/15" />
   {createdAt && (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-2">
    

    <span className="text-[11px] font-bold text-[#737685] uppercase">
      Created at
    </span>

    <div className="flex items-center gap-2 text-[14px] font-medium text-[#434654]">
      
    
      <svg
        className="sm:hidden"
        width="11"
        height="12"
        viewBox="0 0 11 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.16667 11.6667C0.845833 11.6667 0.571181 11.5524 0.342708 11.324C0.114236 11.0955 0 10.8208 0 10.5V2.33333C0 2.0125 0.114236 1.73785 0.342708 1.50937C0.571181 1.2809 0.845833 1.16667 1.16667 1.16667H1.75V0H2.91667V1.16667H7.58333V0H8.75V1.16667H9.33333C9.65417 1.16667 9.92882 1.2809 10.1573 1.50937C10.3858 1.73785 10.5 2.0125 10.5 2.33333V10.5C10.5 10.8208 10.3858 11.0955 10.1573 11.324C9.92882 11.5524 9.65417 11.6667 9.33333 11.6667H1.16667ZM1.16667 10.5H9.33333V4.66667H1.16667V10.5ZM1.16667 3.5H9.33333V2.33333H1.16667V3.5ZM1.16667 3.5V2.33333V3.5Z"
          fill="#434654"
        />
      </svg>

      <span>{formatDate(createdAt)}</span>
    </div>
  </div>
)}
    </div>
  );
}
