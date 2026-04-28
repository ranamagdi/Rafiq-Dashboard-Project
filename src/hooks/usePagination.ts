import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { ApiError } from "../types/apiTypes";

const LIMIT = 10;

function getValidPage(param: string | null): number | null {
  if (param === null) return null;
  const num = parseInt(param, 10);
  return Number.isInteger(num) && num >= 1 ? num : null;
}

interface UsePaginationOptions<T> {
  fetchFn: (
    limit: number,
    offset: number,
    searchTerm: string,
  ) => Promise<{ data: T[]; total: number }>;
  limit?: number;
}

interface UsePaginationReturn<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  totalItems: number;
  hasMore: boolean;
  isInvalidPage: boolean;
  isOutOfRange: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  goToPage: (pageNum: number) => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handlePageClick: (pageNum: number) => void;
  getVisiblePages: () => (number | "...")[];
  lastElementRef: (node: HTMLDivElement | null) => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  refresh: () => void;
}

export function usePagination<T>({
  fetchFn,
  limit = LIMIT,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = searchParams.get("page");
  const validatedPage = getValidPage(rawPage);
  const isInvalidPage = rawPage !== null && validatedPage === null;
  const currentPage = validatedPage ?? 1;

  const [isOutOfRange, setIsOutOfRange] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTermState] = useState("");

  const searchTermRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const hasMountedRef = useRef(false);

  const fetchPage = useCallback(
    async (
      pageNum: number,
      shouldAppend: boolean,
      term = searchTermRef.current,
    ) => {
      setLoading(true);
      setError(null);
      setIsOutOfRange(false);
      try {
        const offset = (pageNum - 1) * limit;
        const { data, total } = await fetchFn(limit, offset, term);

        setHasMore(offset + data.length < total);

        if (shouldAppend) {
          setItems((prev) => [...prev, ...data]);
        } else {
          setItems(data);
          setTotalItems(total);
        }
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const code = apiErr?.response?.data?.code;

        if (code === "PGRST103") {
          setIsOutOfRange(true);
          setItems([]);
          setTotalItems(0);
          setHasMore(false);
        } else {
          setError(
            new Error(
              apiErr?.response?.data?.message ||
                apiErr?.message ||
                "Failed to load data",
            ),
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, limit],
  );

  const setSearchTerm = useCallback(
    (term: string) => {
      setSearchTermState(term);
      searchTermRef.current = term;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchParams({ page: "1" });
        fetchPage(1, false, term);
      }, 400);
    },
    [fetchPage, setSearchParams],
  );

  useEffect(() => {
    if (rawPage === null) {
      setSearchParams({ page: "1" }, { replace: true });
    }
  }, [rawPage, setSearchParams]);

  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;
    if (!isInvalidPage) {
      setTimeout(() => {
        fetchPage(currentPage, false);
      }, 0);
    }
  }, [fetchPage, searchParams, isInvalidPage, currentPage]);

  const goToPage = useCallback(
    (pageNum: number) => {
      setSearchTermState("");
      searchTermRef.current = ""; 
      setSearchParams({ page: String(pageNum) });
      fetchPage(pageNum, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams, fetchPage],
  );

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleNextPage = useCallback(() => {
    if (hasMore) goToPage(currentPage + 1);
  }, [hasMore, currentPage, goToPage]);

  const handlePageClick = useCallback(
    (pageNum: number) => {
      if (pageNum !== currentPage) goToPage(pageNum);
    },
    [currentPage, goToPage],
  );

  const getVisiblePages = useCallback((): (number | "...")[] => {
    const totalPages = Math.ceil(totalItems / limit);
    if (totalPages < 1) return [];

    const pages: (number | "...")[] = [];
    const showLeft = currentPage > 3;
    const showRight = currentPage < totalPages - 2;

    pages.push(1);
    if (showLeft) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (showRight) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }, [totalItems, currentPage, limit]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !node) return;
      observer.current?.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPage(currentPage + 1, true);
        }
      });
      observer.current.observe(node);
    },
    [loading, hasMore, currentPage, fetchPage],
  );

  const refresh = useCallback(() => {
    fetchPage(currentPage, false);
  }, [fetchPage, currentPage]);

  return {
    items,
    loading,
    error,
    currentPage,
    totalItems,
    hasMore,
    isInvalidPage,
    isOutOfRange,
    searchTerm,
    setSearchTerm,
    goToPage,
    handlePreviousPage,
    handleNextPage,
    handlePageClick,
    getVisiblePages,
    lastElementRef,
    setItems,
    setError,
    refresh,
  };
}
