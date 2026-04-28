import { NavLink, useLocation, useParams } from "react-router-dom";
import { useAppSelector } from "../../../hooks/reduxHooks";

export default function Breadcrumb() {
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { projectTitle } = useAppSelector((s) => s.project);

  const segments = location.pathname.split("/").filter(Boolean);

  const basePath = "/dashboard/projects";

  const routesMap: Record<string, string> = {
    projects: "Projects",
    edit: "Edit",
    epics: "Epics",
    members: "Members",
    add: "Add",
  };
  const isEditPage = location.pathname.includes("/edit");
  return (
    <div className="text-sm md:flex items-center gap-2 mt-5 hidden">
      <NavLink
        to={basePath}
        className="text-(--color-forms-texts) text-[12px] font-semibold uppercase cursor-pointer hover:text-(--color-primary)"
      >
        Projects
      </NavLink>

      {projectId && !isEditPage && (
        <>
          <span>/</span>

          <NavLink
            to={`/dashboard/project/${projectId}/edit`}
            className="text-(--color-forms-texts) text-[12px] font-semibold uppercase cursor-pointer hover:text-(--color-primary)"
          >
            {projectTitle ?? "Project"}
          </NavLink>
        </>
      )}
      {segments.slice(3).map((segment, index) => {
        const to = "/" + segments.slice(0, index + 4).join("/");

        const label = routesMap[segment] || segment;

        const isLast = index === segments.slice(3).length - 1;

        return (
          <div key={to} className="flex gap-2">
            <span>/</span>

            <NavLink
              to={to}
              className={() =>
                 isLast
                  ? "text-(--color-primary) font-bold uppercase  text-[12px]"
                  : "text-(--color-forms-texts) font-semibold uppercase hover:text-(--color-primary)  text-[12px]"
              }
            >
              {label}
            </NavLink>
          </div>
        );
      })}
    </div>
  );
}
