import { useEffect, useState, useRef, useCallback } from "react";
import EpicCard from "../../../components/epic/EpicCard";
import type { ApiResponse } from "../../../types/apiTypes";
import Button from "../../../components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import EmptyContent from "../../../components/common/Content/EmptyContent";
import ErrorContent from "../../../components/common/Content/ErrorContent";
import { IMAGES, ICONS } from "../../../assets/index";
import { getProjectEpics } from "../../../services/endpoints";
import EpicCardSkeleton from "../../../components/epic/EpicCardSkelton";
import useIsMobile from "../../../hooks/useIsMobile";
import Input from "../../../components/ui/Input";
import EpicDetailsPopup from "../../../components/epic/EpicDetailsPopup";

export default function Epics() {
  type Epic = {
    id: string;
    title: string;
    project_id: string;
    epic_id: string;
    deadline?: string;
    assignee: { name: string };
    created_by: { name: string };
    created_at: string;
    description?: string;
  };
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const { projectId } = useParams();
  const observer = useRef<IntersectionObserver | null>(null);
  const isMobile = useIsMobile();
  const limit = 10;
  const [totalEpics, setTotalEpics] = useState(0);
  const handleDeleteEpic = (id: string) => {
    setEpics((prev) => prev.filter((epic) => epic.id !== id));
  };
  const fetchEpics = useCallback(
    async (pageNum: number, shouldAppend: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const offset = (pageNum - 1) * limit;
        const res = await getProjectEpics(projectId!, limit, offset);
        const contentRange = res.headers.get("content-range");

        const total = contentRange
          ? parseInt(contentRange.split("/")[1], 10)
          : 0;

        const data: Epic[] = Array.isArray(res)
          ? res
          : ((res as ApiResponse<Epic[]>)?.data ?? []);

        setHasMore(offset + data.length < total);
        if (shouldAppend) {
          setEpics((prev) => [...prev, ...data]);
          setTotalEpics((prev) => prev + data.length);
        } else {
          setEpics(data);
          setTotalEpics(total);
        }
      } catch (err: unknown) {
        setError(new Error((err as Error)?.message || "Failed to load epics"));
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  const prevIsMobileRef = useRef(isMobile);

  useEffect(() => {
    if (isMobile) return;

    if (prevIsMobileRef.current === true) {
      prevIsMobileRef.current = false;
      return;
    }

    prevIsMobileRef.current = false;
    fetchEpics(page, false);
  }, [page, fetchEpics, isMobile]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isMobile) {
      if (hasFetched.current) return;
      hasFetched.current = true;
      setEpics([]);
      setTotalEpics(0);
      setPage(1);
      setHasMore(true);
      fetchEpics(1, false);
    }
  }, [isMobile, fetchEpics]);

  const lastEpicElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (!isMobile || loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchEpics(nextPage, true);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isMobile, loading, hasMore, page, fetchEpics],
  );

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const getVisiblePages = () => {
    const pages = [];

    if (page > 1) pages.push(page - 1);
    pages.push(page);
    if (hasMore) pages.push(page + 1);

    return pages;
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
      {!error && (epics.length !== 0 || loading) && (
        <>
          <>
            <div className="md:flex items-center gap-2 mt-5 hidden ">
              <p
                onClick={() => navigate("/dashboard/projects")}
                className="text-[#43465499] text-[12px] font-bold uppercase cursor-pointer hover:text-[#003D9B]"
              >
                Projects
              </p>

              <span className="text-[#43465466] text-[12px] font-bold">
                &gt;
              </span>
              <p
                onClick={() =>
                  navigate("/dashboard/project/" + projectId + "/epics")
                }
                className="text-[#003D9B] text-[12px] font-bold uppercase cursor-pointer"
              >
                Epics
              </p>
            </div>
          </>
          <>
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-12 md:col-span-8">
                <h2 className="text-[#041B3C] text-[30px] font-semibold hidden sm:block">
                  Project Epics
                </h2>
              </div>
              <div className="col-span-12 md:col-span-4 flex">
                <div className="w-full mt-4 sm:mt-0">
                  <Input
                    placeholder="Search epics..."
                    iconPosition="left"
                    className="h-12 w-full sm:h-10 "
                    icon={ICONS.search}
                  />
                </div>

                <div className="hidden sm:flex items-center ml-2">
                  <Button
                    onClick={() =>
                      navigate(`/dashboard/project/${projectId}/epic/add`)
                    }
                    className="flex items-center gap-2 whitespace-nowrap mt-1"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path
                        d="M4.5 6H0V4.5H4.5V0H6V4.5H10.5V6H6V10.5H4.5V6Z"
                        fill="white"
                      />
                    </svg>
                    New Epic
                  </Button>
                </div>
              </div>
            </div>
          </>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
        {epics.map((epic, index) => {
          const isLastElement = isMobile && epics.length === index + 1;
          return (
            <div key={epic.id} ref={isLastElement ? lastEpicElementRef : null}>
              <EpicCard
                id={epic.id}
                title={epic.title}
                createdAt={epic.created_at}
                projectId={epic.project_id}
                epicId={epic.epic_id}
                assigneeName={epic.assignee.name}
                createdBy={epic.created_by.name}
                deadline={epic.deadline}
                onDelete={handleDeleteEpic}
                onClick={() => setSelectedEpic(epic)}
              />
            </div>
          );
        })}
        {!loading && epics.length > 0 && (
          <>
            <div className="sm:hidden flex justify-end">
              <div
                onClick={() =>
                  navigate("/dashboard/project/" + projectId + "/epic/add")
                }
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
          </>
        )}
        {loading &&
          Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <EpicCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {!isMobile && !loading && epics.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-(--color-forms-texts) text-[12px] font-medium">
            Showing {epics.length} of {totalEpics} active epics
          </p>
          <div className="flex justify-center items-center gap-4 py-8">
            <Button
              disabled={page === 1}
              onClick={handlePreviousPage}
              className="bg-transparent border border-solid border-[#C3C6D6] border-opacity-30 px-3 h-8"
            >
              <svg
                width="5"
                height="7"
                viewBox="0 0 5 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 7L0 3.5L3.5 0L4.31667 0.816667L1.63333 3.5L4.31667 6.18333L3.5 7Z"
                  fill="#434654"
                />
              </svg>
            </Button>
            <div className="flex items-center gap-2">
              {getVisiblePages().map((p, i) => (
                <span
                  key={i}
                  className={`h-8 w-8 rounded-sm text-sm font-semibold flex items-center justify-center
                    ${
                      p === page
                        ? "text-white bg-(--color-primary-container)"
                        : "text-gray-700"
                    }`}
                >
                  {p}
                </span>
              ))}

              {hasMore && (
                <span className="text-gray-700 font-medium text-sm">...</span>
              )}
            </div>

            <Button
              disabled={!hasMore}
              onClick={handleNextPage}
              className="bg-transparent border border-solid border-[#C3C6D6] border-opacity-30 px-3 h-8"
            >
              <svg
                width="5"
                height="7"
                viewBox="0 0 5 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.68333 3.5L0 0.816667L0.816667 0L4.31667 3.5L0.816667 7L0 6.18333L2.68333 3.5Z"
                  fill="#434654"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-center py-4">
        {isMobile &&
          loading &&
          epics.length > 0 &&
          Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <EpicCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {error && (
        <ErrorContent
          title="Something went wrong"
          icon={<img src={ICONS.error} alt="error" className="w-6 h-6" />}
          description="We're having trouble retrieving your
            project epics right now. Please try
            again in a moment."
        >
          <Button onClick={() => window.location.reload()}>
            Retry connection
          </Button>
        </ErrorContent>
      )}

      {!loading && epics.length === 0 && !error && (
        <EmptyContent
          className="bg-white border border-[#FFFFFF66] backdrop-blur-xs rounded-4xl"
          image={IMAGES.EpicEmpty}
          title="No epics in this project yet."
          description="Break down your large project into manageable
          epics to track progress better and maintain
          architectural clarity."
        >
          <Button
            className="flex items-center gap-2 justify-center align-middle"
            onClick={() =>
              navigate("/dashboard/project/" + projectId + "/epic/add")
            }
          >
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.55 16.2L11.725 10H7.725L8.45 4.325L3.825 11H7.3L6.55 16.2ZM4 20L5 13H0L9 0H11L10 8H16L6 20H4Z"
                fill="white"
              />
            </svg>
            Create First Epic
          </Button>
          <div className="flex justify-between align-middle items-center mt-10 w-[70%]">
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 8L16.75 5.25L14 4L16.75 2.75L18 0L19.25 2.75L22 4L19.25 5.25L18 8ZM18 22L16.75 19.25L14 18L16.75 16.75L18 14L19.25 16.75L22 18L19.25 19.25L18 22ZM8 19L5.5 13.5L0 11L5.5 8.5L8 3L10.5 8.5L16 11L10.5 13.5L8 19ZM8 14.15L9 12L11.15 11L9 10L8 7.85L7 10L4.85 11L7 12L8 14.15Z"
                    fill="#003D9B"
                  />
                </svg>
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                High-Level Goals
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Define the broad objectives that span across multiple cycles.
              </p>
            </div>
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <svg
                  width="17"
                  height="22"
                  viewBox="0 0 17 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 22V16H2.5V14H0V8H2.5V6H0V0H7V6H4.5V8H7V10H10V8H17V14H10V12H7V14H4.5V16H7V22H0ZM2 20H5V18H2V20ZM2 12H5V10H2V12ZM12 12H15V10H12V12ZM2 4H5V2H2V4Z"
                    fill="#003D9B"
                  />
                </svg>
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                Hierarchy Design
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Link individual tasks to parent epics for a consolidated view.
              </p>
            </div>
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <svg
                  width="22"
                  height="12"
                  viewBox="0 0 22 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 12C1.45 12 0.979167 11.8042 0.5875 11.4125C0.195833 11.0208 0 10.55 0 10C0 9.45 0.195833 8.97917 0.5875 8.5875C0.979167 8.19583 1.45 8 2 8C2.1 8 2.1875 8 2.2625 8C2.3375 8 2.41667 8.01667 2.5 8.05L7.05 3.5C7.01667 3.41667 7 3.3375 7 3.2625C7 3.1875 7 3.1 7 3C7 2.45 7.19583 1.97917 7.5875 1.5875C7.97917 1.19583 8.45 1 9 1C9.55 1 10.0208 1.19583 10.4125 1.5875C10.8042 1.97917 11 2.45 11 3C11 3.03333 10.9833 3.2 10.95 3.5L13.5 6.05C13.5833 6.01667 13.6625 6 13.7375 6C13.8125 6 13.9 6 14 6C14.1 6 14.1875 6 14.2625 6C14.3375 6 14.4167 6.01667 14.5 6.05L18.05 2.5C18.0167 2.41667 18 2.3375 18 2.2625C18 2.1875 18 2.1 18 2C18 1.45 18.1958 0.979167 18.5875 0.5875C18.9792 0.195833 19.45 0 20 0C20.55 0 21.0208 0.195833 21.4125 0.5875C21.8042 0.979167 22 1.45 22 2C22 2.55 21.8042 3.02083 21.4125 3.4125C21.0208 3.80417 20.55 4 20 4C19.9 4 19.8125 4 19.7375 4C19.6625 4 19.5833 3.98333 19.5 3.95L15.95 7.5C15.9833 7.58333 16 7.6625 16 7.7375C16 7.8125 16 7.9 16 8C16 8.55 15.8042 9.02083 15.4125 9.4125C15.0208 9.80417 14.55 10 14 10C13.45 10 12.9792 9.80417 12.5875 9.4125C12.1958 9.02083 12 8.55 12 8C12 7.9 12 7.8125 12 7.7375C12 7.6625 12.0167 7.58333 12.05 7.5L9.5 4.95C9.41667 4.98333 9.3375 5 9.2625 5C9.1875 5 9.1 5 9 5C8.96667 5 8.8 4.98333 8.5 4.95L3.95 9.5C3.98333 9.58333 4 9.6625 4 9.7375C4 9.8125 4 9.9 4 10C4 10.55 3.80417 11.0208 3.4125 11.4125C3.02083 11.8042 2.55 12 2 12Z"
                    fill="#003D9B"
                  />
                </svg>
              </div>
              <h4 className="text-[#041B3C] font-semibold text-[16px]">
                Track Velocity
              </h4>
              <p className="text-[12px] font-normal text-[#434654] text-left">
                Visualize percentage completion at a macro project level.
              </p>
            </div>
          </div>
        </EmptyContent>
      )}
      {selectedEpic && (
        <EpicDetailsPopup
          id={selectedEpic?.id}
          epicId={selectedEpic.epic_id}
          projectId={projectId}
          title={selectedEpic?.title}
          description={selectedEpic?.description}
          assigneeName={selectedEpic?.assignee.name}
          createdBy={selectedEpic?.created_by.name}
          deadline={selectedEpic?.deadline}
          isOpen={true}
          onClose={() => setSelectedEpic(null)}
        />
      )}
    </div>
  );
}
