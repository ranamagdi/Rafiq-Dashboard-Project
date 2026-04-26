import Button from "../../ui/Button";
import { NextPage, PreviousPage } from "../../ui/SvgIcons";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  hasMore: boolean;
  itemsShown: number;
  label: string; // e.g. "projects" or "epics" or "tasks"
  getVisiblePages: () => (number | "...")[];
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handlePageClick: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  hasMore,
  itemsShown,
  label,
  getVisiblePages,
  handlePreviousPage,
  handleNextPage,
  handlePageClick,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-(--color-forms-texts) text-[12px] font-medium">
        Showing {itemsShown} of {totalItems} active {label}
      </p>
      <div className="flex justify-center items-center gap-4 py-8">
        <Button
          disabled={currentPage === 1}
          onClick={handlePreviousPage}
          className="bg-transparent border border-solid border-[#C3C6D6] border-opacity-30 px-3 h-8"
        >
          <PreviousPage />
        </Button>

        <div className="flex items-center gap-2">
          {getVisiblePages().map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="h-8 w-8 flex items-center justify-center text-gray-400 text-sm select-none"
              >
                ...
              </span>
            ) : (
              <span
                key={p}
                onClick={() => handlePageClick(p)}
                className={`h-8 w-8 rounded-sm text-sm font-semibold flex items-center justify-center cursor-pointer transition-colors
                  ${
                    p === currentPage
                      ? "text-white bg-(--color-primary-container)"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {p}
              </span>
            ),
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
  );
}