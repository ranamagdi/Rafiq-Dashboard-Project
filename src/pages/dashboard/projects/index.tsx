import { useEffect, useState, useRef } from "react";
import ProjectCard from "../../../components/project/ProjectCard";
import Button from "../../../components/ui/Button";

import { useNavigate } from "react-router-dom";
import EmptyContent from "../../../components/common/Content/EmptyContent";
import ErrorContent from "../../../components/common/Content/ErrorContent";
import { IMAGES } from "../../../assets/index";
import { getProjects } from "../../../services/endpoints";
import ProjectCardSkeleton from "../../../components/project/ProjectCardSkeleton";

export default function Projects() {
  type Project = {
    id: string;
    name: string;
    description: string;
    created_at: string;
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        const data: Project[] = Array.isArray(res) ? res : (res?.data ?? []);

        setProjects(data);
      } catch (err: unknown) {
        console.error("Failed to fetch projects:", err);

        const error = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
          message?: string;
        };

        setError(
          new Error(
            error?.response?.data?.message || error?.message || "Unknown error",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9 ">
      {!error && projects.length !== 0 && (
        <div className="grid grid-cols-12 items-center mt-4">
          <div className="col-span-12 md:col-span-10">
            <h2 className="text-[#041B3C] text-[30px] font-semibold">
              Projects
            </h2>
            <p className="text-[#434654] text-[14px] font-normal">
              Manage and curate your projects
            </p>
          </div>

          <div className="col-span-12 md:col-span-2 justify-end hidden sm:flex">
            <Button
              className="flex justify-center gap-2 items-center"
              onClick={() => navigate("/dashboard/project/add")}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.5 6H0V4.5H4.5V0H6V4.5H10.5V6H6V10.5H4.5V6Z"
                  fill="white"
                />
              </svg>
              Create New Project
            </Button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorContent
          title="Something went wrong"
          description="We're having trouble retrieving your
 projects right now. Please try
again in a moment."
          icon={
            <svg
              width="28"
              height="25"
              viewBox="0 0 28 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.5 24.75L20.1875 21.5H6.875C4.95833 21.5 3.33333 20.8333 2 19.5C0.666667 18.1667 0 16.5417 0 14.625C0 13.0208 0.494792 11.5938 1.48438 10.3438C2.47396 9.09375 3.75 8.29167 5.3125 7.9375C5.375 7.77083 5.4375 7.60938 5.5 7.45312C5.5625 7.29688 5.625 7.125 5.6875 6.9375L0.5 1.75L2.25 0L25.25 23L23.5 24.75ZM6.875 19H17.6875L7.625 8.9375C7.58333 9.16667 7.55208 9.38542 7.53125 9.59375C7.51042 9.80208 7.5 10.0208 7.5 10.25H6.875C5.66667 10.25 4.63542 10.6771 3.78125 11.5312C2.92708 12.3854 2.5 13.4167 2.5 14.625C2.5 15.8333 2.92708 16.8646 3.78125 17.7188C4.63542 18.5729 5.66667 19 6.875 19ZM25.75 19.9375L23.9375 18.1875C24.2917 17.8958 24.5573 17.5573 24.7344 17.1719C24.9115 16.7865 25 16.3542 25 15.875C25 15 24.6979 14.2604 24.0938 13.6562C23.4896 13.0521 22.75 12.75 21.875 12.75H20V10.25C20 8.52083 19.3906 7.04688 18.1719 5.82812C16.9531 4.60938 15.4792 4 13.75 4C13.1875 4 12.6458 4.06771 12.125 4.20312C11.6042 4.33854 11.1042 4.55208 10.625 4.84375L8.8125 3.03125C9.54167 2.53125 10.3177 2.15104 11.1406 1.89062C11.9635 1.63021 12.8333 1.5 13.75 1.5C16.1875 1.5 18.2552 2.34896 19.9531 4.04688C21.651 5.74479 22.5 7.8125 22.5 10.25C23.9375 10.4167 25.1302 11.0365 26.0781 12.1094C27.026 13.1823 27.5 14.4375 27.5 15.875C27.5 16.6875 27.3438 17.4427 27.0312 18.1406C26.7188 18.8385 26.2917 19.4375 25.75 19.9375Z"
                fill="#BA1A1A"
              />
            </svg>
          }
        >
          <Button onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </ErrorContent>
      ) : projects.length === 0 ? (
        <EmptyContent
          image={IMAGES.projectEmpty}
          title="No Projects"
          description="No Projects
You don’t have any projects yet. Start by defining
your first architectural workspace to begin tracking
tasks and epics.
Create New Project"
        >
          <Button
            className="flex items-center gap-2 justify-center align-middle"
            onClick={() => navigate("/dashboard/project/add")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 15H11V11H15V9H11V5H9V9H5V11H9V15ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
                fill="white"
              />
            </svg>
            Create New Project
          </Button>
        </EmptyContent>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id || index}
              title={project.name}
              description={project.description}
              createdAt={project.created_at}
              projectId={project.id}
            />
          ))}

          <ProjectCard
            className="hidden sm:flex"
            variant="add"
            onClick={() => navigate("/dashboard/project/add")}
          />
        </div>
      )}
      <div className="sm:hidden flex justify-end">
        <div
          onClick={() => navigate("/dashboard/project/add")}
          style={{
            marginBottom: "80px",
            background:
              "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
          }}
          className="w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
