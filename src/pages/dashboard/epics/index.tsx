import { useEffect, useState, useRef, useCallback } from "react";
import EpicCard from "../../../components/epic/EpicCard";
import type { ApiResponse } from "../../../types/apiTypes";
import Button from "../../../components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import {
  AddIcon,
  EmprtyEpicContent,
  NextPage,
  PreviousPage,
} from "../../../components/ui/SvgIcons";
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
                    <AddIcon />
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
                <AddIcon />
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
              <PreviousPage />
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
              <NextPage />
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
            <AddIcon />
            Create First Epic
          </Button>
          <div className="flex justify-between align-middle items-center mt-10 w-[70%]">
            <div className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52">
              <div className="bg-white rounded-sm p-2 w-10">
                <EmprtyEpicContent />
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
                <EmprtyEpicContent variant="second" />
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
               <EmprtyEpicContent variant="third" />
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
