import { formatDate } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import type { StatusVariant } from "../../types/apiTypes";
import {getInitials}from "../utils/nameUtils";
import { deleteEpic } from "../../services/endpoints";


type EpicCardProps = {
    id: string;
  title?: string;
  description?: string;
  createdAt?: string;
  projectId?: string;
  epicId?: string;
  assigneeName?: string;  
  assigneeColor?: string;
  status?: StatusVariant;
  createdBy?: string;
  deadline?: string;
  onClick?: () => void;
    onDelete?: (id: string) => void;
  className?: string;

};



// const STATUS_CONFIG: Record<
//   StatusVariant,
//   { label: string; bg: string; text: string }
// > = {
//   TO_DO: {
//     label: "TO DO",
//     bg: "bg-[#EEF2FF]",
//     text: "text-[#5B6DB8]",
//   },
//   IN_PROGRESS: {
//     label: "IN PROGRESS",
//     bg: "bg-[#FFF7ED]",
//     text: "text-[#C2610C]",
//   },
//   DONE: {
//     label: "Done",
//     bg: "bg-[#EEF2FF]",
//     text: "text-[#3B5BDB]",
//   },

// };


const DotsIcon = () => (
  <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
    <circle cx="1.5" cy="1.5" r="1.5" fill="#C3C6D6" />
    <circle cx="1.5" cy="6.5" r="1.5" fill="#C3C6D6" />
    <circle cx="1.5" cy="11.5" r="1.5" fill="#C3C6D6" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.16667 11.6667C0.845833 11.6667 0.571181 11.5524 0.342708 11.324C0.114236 11.0955 0 10.8208 0 10.5V2.33333C0 2.0125 0.114236 1.73785 0.342708 1.50937C0.571181 1.2809 0.845833 1.16667 1.16667 1.16667H1.75V0H2.91667V1.16667H7.58333V0H8.75V1.16667H9.33333C9.65417 1.16667 9.92882 1.2809 10.1573 1.50937C10.3858 1.73785 10.5 2.0125 10.5 2.33333V10.5C10.5 10.8208 10.3858 11.0955 10.1573 11.324C9.92882 11.5524 9.65417 11.6667 9.33333 11.6667H1.16667ZM1.16667 10.5H9.33333V4.66667H1.16667V10.5ZM1.16667 3.5H9.33333V2.33333H1.16667V3.5ZM1.16667 3.5V2.33333V3.5Z" fill="#434654" fillOpacity="0.8"/>
</svg>

);

const PersonIcon = () => (
<svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 9.33333V7.7C0 7.36944 0.0850694 7.06563 0.255208 6.78854C0.425347 6.51146 0.651389 6.3 0.933333 6.15417C1.53611 5.85278 2.14861 5.62674 2.77083 5.47604C3.39306 5.32535 4.025 5.25 4.66667 5.25C5.02639 5.25 5.38125 5.27188 5.73125 5.31563C6.08125 5.35938 6.43125 5.42986 6.78125 5.52708L5.80417 6.51875C5.60972 6.48958 5.42014 6.46528 5.23542 6.44583C5.05069 6.42639 4.86111 6.41667 4.66667 6.41667C4.12222 6.41667 3.58264 6.48229 3.04792 6.61354C2.51319 6.74479 1.98333 6.94167 1.45833 7.20417C1.37083 7.25278 1.30035 7.32083 1.24688 7.40833C1.1934 7.49583 1.16667 7.59306 1.16667 7.7V8.16667H4.66667V9.33333H0ZM5.83333 9.91667V8.12292L9.05625 4.91458C9.14375 4.82708 9.24097 4.76389 9.34792 4.725C9.45486 4.68611 9.56181 4.66667 9.66875 4.66667C9.78542 4.66667 9.89722 4.68854 10.0042 4.73229C10.1111 4.77604 10.2083 4.84167 10.2958 4.92917L10.8354 5.46875C10.9132 5.55625 10.974 5.65347 11.0177 5.76042C11.0615 5.86736 11.0833 5.97431 11.0833 6.08125C11.0833 6.18819 11.0639 6.29757 11.025 6.40938C10.9861 6.52118 10.9229 6.62083 10.8354 6.70833L7.62708 9.91667H5.83333ZM10.2083 6.08125L9.66875 5.54167L10.2083 6.08125ZM6.70833 9.04167H7.2625L9.02708 7.2625L8.76458 6.98542L8.4875 6.72292L6.70833 8.4875V9.04167ZM8.76458 6.98542L8.4875 6.72292L9.02708 7.2625L8.76458 6.98542ZM4.66667 4.66667C4.025 4.66667 3.47569 4.43819 3.01875 3.98125C2.56181 3.52431 2.33333 2.975 2.33333 2.33333C2.33333 1.69167 2.56181 1.14236 3.01875 0.685417C3.47569 0.228472 4.025 0 4.66667 0C5.30833 0 5.85764 0.228472 6.31458 0.685417C6.77153 1.14236 7 1.69167 7 2.33333C7 2.975 6.77153 3.52431 6.31458 3.98125C5.85764 4.43819 5.30833 4.66667 4.66667 4.66667ZM4.66667 3.5C4.9875 3.5 5.26215 3.38576 5.49062 3.15729C5.7191 2.92882 5.83333 2.65417 5.83333 2.33333C5.83333 2.0125 5.7191 1.73785 5.49062 1.50937C5.26215 1.2809 4.9875 1.16667 4.66667 1.16667C4.34583 1.16667 4.07118 1.2809 3.84271 1.50937C3.61424 1.73785 3.5 2.0125 3.5 2.33333C3.5 2.65417 3.61424 2.92882 3.84271 3.15729C4.07118 3.38576 4.34583 3.5 4.66667 3.5Z" fill="#434654" fillOpacity="0.8"/>
</svg>

);

const PenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M1 13H3L11.5 4.5L9.5 2.5L1 11V13ZM12.5 1.5L13 2L11.5 3.5L10.5 2.5L12 1L12.5 1.5Z"
      fill="#434654"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2.5 13V4H1.5V3H5V2H9V3H12.5V4H11.5V13H2.5ZM4 11.5H5.5V5H4V11.5ZM8.5 11.5H10V5H8.5V11.5Z"
      fill="#E74C3C"
    />
  </svg>
);



export default function EpicCard({
    id,
  title,
  createdAt,
  onClick, 
  epicId,
  assigneeName, 
  status = "TO_DO",
  createdBy,
  className,
  deadline,
    onDelete,
 
}: EpicCardProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
const [showConfirm, setShowConfirm] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
  const initials = getInitials(assigneeName);
//   const statusCfg = STATUS_CONFIG[status];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleDelete = async () => {
  if (!id) return;

  try {
    setIsDeleting(true);
    await deleteEpic(id);

    setShowConfirm(false);


    onDelete?.(id);
  } catch (err) {
    console.error("Delete failed", err);
  } finally {
    setIsDeleting(false);
  }
};
function getInitialsBg() {
 if(status === "DONE"){
  
  return "var(--color-primary)"
 }
    return "#65DCA4"
}


 
  return (
    <>
    <div
      onClick={onClick}
      className={`
        relative  rounded-2xl
        border-4 border-transparent
        shadow-[0px_1px_2px_0px_#0000000D]
        hover:shadow-[0_4px_24px_rgba(4,27,60,0.08)] transition-all duration-200 cursor-pointer
        flex flex-col gap-0 overflow-hidden
         ${status===
            "DONE"?'bg-[#E0E8FF]':'bg-white'
         }
        ${className}
      `}
    >

      <div
        className={`absolute left-0 top-0 bottom-0 w-[3.5px] rounded-xl ${
          status === "DONE" 
            ? ""
            : "bg-[#004E32]"
        }`}
      />

      <div className="pl-5 pr-4 pt-4 pb-4 flex flex-col gap-3">
       
        <div className="flex items-center justify-between" ref={menuRef}>
          {epicId && (
            <span
              className={`
                inline-flex items-center px-2.5 py-1 text-(--primary-color) rounded-xs text-[11px] font-bold tracking-wider uppercase
                ${
                  status === "DONE" 
                    ? "bg-[#FFFFFF] border border-[#003D9B]/20"
                    : "bg-[#82F9BE] "
                }
              `}
            >
              {epicId}
            </span>
          )}

         
          <div className="relative ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((prev) => !prev);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <DotsIcon />
            </button>

            {openMenu && (
              <div className="absolute right-0 top-8 w-44 bg-white shadow-xl border border-gray-100
               rounded-xl z-50 overflow-hidden">
                <button
              
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#434654] hover:bg-gray-50 transition-colors"
                >
                  <PenIcon />
                  Edit Epic
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(false);
                    setShowConfirm(true);
                  
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon />
                  Delete Epic
                </button>
              </div>
            )}
          </div>
        </div>

    
        {title && (
          <h3 className="text-[17px] font-semibold text-[#041B3C] leading-snug capitalize">
            {title}
          </h3>
        )}

  
        <div className="flex items-center justify-between mt-1">
 
          <div className="flex items-center gap-2.5">
            {initials && (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center  text-[13px] font-bold shrink-0"
                style={{ backgroundColor: getInitialsBg(),color:status === "DONE" ? "white" : "#002113" }}

              >
                {initials}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-medium tracking-wide">
                Assignee
              </span>
              {assigneeName && (
                <span className="text-[13px] font-semibold text-[#041B3C]">
                  {assigneeName}
                </span>
              )}
            </div>
          </div>
        {/* <span
            className={`md:inline-flex hidden items-center px-3 py-1 rounded-lg text-[12px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}
          >
            {statusCfg.label}
          </span> */}
            {deadline && (
                <div className="flex flex-col items-center ">
                    <h4 className="uppercase text-[10px] font-bold text-[#737685] ">Deadline</h4>
                    <p className="text-[12px] text-[#041B3C]  font-medium ">
                        {formatDate(deadline)}
                    </p>
                </div>
            )}
        </div>

      
        <hr className="border-[#C3C6D6]/20 mt-1 md:block hidden" />

      
        <div className="md:flex hidden items-center justify-between">
      
          <div className="flex items-center gap-1.5">
            <PersonIcon />
            {createdBy && (
              <span className="text-[12px] text-[#737685]">
                Created by:{" "}
                <span className="font-medium text-[#434654]">{createdBy}</span>
              </span>
            )}
          </div>

      
          {createdAt && (
            <div className="flex items-center gap-1.5">
              <CalendarIcon />
              <span className="text-[12px] text-[#434654] font-medium">
                {formatDate(createdAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
    {showConfirm && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setShowConfirm(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl"
    >
      <h3 className="text-lg font-semibold text-[#041B3C]">
        Delete Epic?
      </h3>

      <p className="text-sm text-[#737685] mt-2">
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-black"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
  )}
  </>

  );
}