import { formatDate } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import type { StatusVariant } from "../../types/apiTypes";
import {getInitials}from "../utils/nameUtils";
import { deleteEpic } from "../../services/endpoints";
import {DotsIcon,CalendarIcon,PersonIcon,TrashIcon}from '../ui/SvgIcons'

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
                {/* <button
              
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#434654] hover:bg-gray-50 transition-colors"
                >
                  <PenIcon />
                  Edit Epic
                </button> */}
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