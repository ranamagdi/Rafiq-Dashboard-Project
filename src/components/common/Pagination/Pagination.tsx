import Button from "../../ui/Button";
import { NextPage, PreviousPage } from "../../ui/SvgIcons";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  hasMore: boolean;
  itemsShown: number;
  mode?: "default" | "compact" | "infinite"; // add "infinite"
  onLoadMore?: () => void; // add this
  pageSize: number;

  label: string;

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
  pageSize,
  mode = "default",
  onLoadMore,
  label,
  getVisiblePages,
  handlePreviousPage,
  handleNextPage,
  handlePageClick,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="flex justify-between items-center">
      <p className="text-(--color-forms-texts) text-[12px] font-medium">
        Showing {itemsShown} of {totalItems} active {label}
      </p>

      {mode === "infinite" ? (
        <div className="py-8">
          <Button
            disabled={!hasMore}
            onClick={onLoadMore}
            className="bg-transparent border border-solid border-[#C3C6D6] border-opacity-30 px-4 h-8 text-sm font-medium"
          >
            {hasMore ? "Load more" : "All items loaded"}
          </Button>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-4 py-8">
          <Button
            disabled={currentPage === 1}
            onClick={handlePreviousPage}
            className="bg-transparent border border-solid border-[#C3C6D6] border-opacity-30 px-3 h-8"
          >
            <PreviousPage />
          </Button>

          {mode === "default" && (
            <div className="flex items-center gap-2">
              {getVisiblePages().map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="h-8 w-8 flex items-center justify-center text-gray-400 text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <span
                    key={p}
                    onClick={() => handlePageClick(p)}
                    className={`h-8 w-8 flex items-center justify-center cursor-pointer rounded-sm text-sm font-semibold
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
          )}

          {mode === "compact" && (
            <button
              onClick={() => {}}
              className="h-8 px-3 text-sm font-medium text-gray-700"
            >
              Page {currentPage} of {totalPages}
            </button>
          )}

          <Button
            disabled={!hasMore}
            onClick={handleNextPage}
            className="bg-transparent border border-solid border-[#C3C6D6] border-opacity-30 px-3 h-8"
          >
            <NextPage />
          </Button>
        </div>
      )}
    </div>
  );
}
