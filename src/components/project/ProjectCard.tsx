import { formatDate } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import { ICONS } from "../../assets";
import { useNavigate, NavLink } from "react-router-dom";
import { AddIcon, CalendarIcon, ProjectIcon } from "../ui/SvgIcons";
import { useDispatch } from "react-redux";
import { setProject } from "../../store/project/projectSlice";

type ProjectCardProps = {
  title?: string;
  description?: string;
  createdAt?: string;
  projectId?: string;
  onClick?: () => void;
  to?: string;
  className?: string;
  variant?: "default" | "add";
};

export default function ProjectCard({
  title,
  description,
  createdAt,
  onClick,
  to,
  projectId,
  className,
  variant = "default",
}: ProjectCardProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (variant === "add") {
    return (
      <div
        onClick={onClick}
        className={`
        bg-white rounded-lg p-8
          border-2 border-dashed border-[#C3C6D633]
        hover:shadow-md transition cursor-pointer
        flex flex-col gap-2 text-center items-center
        justify-center align-middle ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-[#F1F3FF] flex items-center justify-center mb-3 p-3">
          <AddIcon color="var(--color-slate-medium-blue)" />
        </div>

        <p className="text-[14px] font-bold text-[#434654] uppercase">
          ADD PROJECT
        </p>
      </div>
    );
  }

  return (
    <NavLink
      to={to ?? ""}
      className={`
        bg-white rounded-lg p-8 
        hover:shadow-md transition cursor-pointer
        flex flex-col gap-2
        ${className}`}
      onClick={() => {
        if (projectId && title) {
          dispatch(setProject({ id: projectId, title }));
        }
      }}
    >
      <div className="flex justify-between items-start relative" ref={menuRef}>
        {title && (
          <h3 className="text-[18px] font-medium text-[#041B3C]">{title}</h3>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu((prev) => !prev);
          }}
          className="p-1"
        >
          <ProjectIcon />
        </button>

        {openMenu && (
          <div className="absolute right-0 top-6 w-40 bg-white shadow-lg border border-gray-100 rounded-md z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/project/${projectId}/edit`);
                setOpenMenu(false);
              }}
              className="w-full text-left
              
              px-4 py-2 text-sm hover:bg-gray-50"
            >
              <img src={ICONS.pen} alt="Edit" className="inline w-4 h-4 mr-2" />
              Edit Project
            </button>
          </div>
        )}
      </div>

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
            <CalendarIcon className="sm:hidden" />

            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      )}
    </NavLink>
  );
}
