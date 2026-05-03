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
  mode?: "paginated" | "infinite";
  root?: React.RefObject<Element | null>;
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
  mode = "paginated",
  root,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL state (single source of truth)
  const rawPage = searchParams.get("page");
  const validatedPage = getValidPage(rawPage);
  const isInvalidPage = rawPage !== null && validatedPage === null;
  const currentPage = validatedPage ?? 1;
  const searchTerm = searchParams.get("search") ?? "";

  const [isOutOfRange, setIsOutOfRange] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastNodeRef = useRef<HTMLDivElement | null>(null);
  const rootPropRef = useRef<React.RefObject<Element | null> | undefined>(root);

  useEffect(() => {
    rootPropRef.current = root;
  }, [root]);

  const infiniteNextPage = useRef<number>(1);
  const infiniteHasMore = useRef<boolean>(true);
  const infiniteLoading = useRef<boolean>(false);

  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchPage = useCallback(
    async (pageNum: number, shouldAppend: boolean, term: string) => {
      if (mode === "infinite") {
        if (infiniteLoading.current) return;
        infiniteLoading.current = true;
      }

      setLoading(true);
      setError(null);
      setIsOutOfRange(false);

      try {
        const offset = (pageNum - 1) * limit;
        const { data, total } = await fetchFnRef.current(limit, offset, term);

        const more = offset + data.length < total;
        setHasMore(more);
        setTotalItems(total);

        setItems((prev) => (shouldAppend ? [...prev, ...data] : data));

        if (mode === "infinite") {
          infiniteHasMore.current = more;
          infiniteNextPage.current = pageNum + 1;
        }
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const code = apiErr?.response?.data?.code;

        if (code === "PGRST103") {
          setIsOutOfRange(true);
          setItems([]);
          setTotalItems(0);
          setHasMore(false);
          if (mode === "infinite") infiniteHasMore.current = false;
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
        if (mode === "infinite") infiniteLoading.current = false;
      }
    },
    [limit, mode],
  );

  const fetchPageRef = useRef(fetchPage);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  // ── Infinite: initial fetch
  useEffect(() => {
    if (mode !== "infinite") return;
    infiniteNextPage.current = 1;
    infiniteHasMore.current = true;
    infiniteLoading.current = false;
    fetchPageRef.current(1, false, searchTerm);
  }, [mode, searchTerm]);

  // ── Paginated: single fetch trigger
  useEffect(() => {
    if (mode !== "paginated") return;
    if (isInvalidPage) return;
    fetchPageRef.current(currentPage, false, searchTerm);
  }, [currentPage, searchTerm, mode, isInvalidPage]);

  // ── Ensure ?page exists
  useEffect(() => {
    if (mode !== "paginated") return;
    const params = new URLSearchParams(searchParams);
    if (!params.get("page")) {
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams, mode]);

  // ── Search handler (debounced → URL only)
  const setSearchTerm = useCallback(
    (term: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          params.set("search", term);
          params.set("page", "1");
          return params;
        });
      }, 400);
    },
    [setSearchParams],
  );

  const goToPage = useCallback(
    (pageNum: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", String(pageNum));
        return params;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams],
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
      if (mode !== "infinite") return;

      observer.current?.disconnect();
      observer.current = null;
      lastNodeRef.current = node;

      if (!node) return;

      const rootEl = rootPropRef.current?.current ?? null;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            infiniteHasMore.current &&
            !infiniteLoading.current
          ) {
            fetchPageRef.current(
              infiniteNextPage.current,
              true,
              searchTerm,
            );
          }
        },
        { root: rootEl, rootMargin: "100px", threshold: 0 },
      );

      observer.current.observe(node);
    },
    [mode, searchTerm],
  );

  const refresh = useCallback(() => {
    if (mode === "infinite") {
      infiniteNextPage.current = 1;
      infiniteHasMore.current = true;
      infiniteLoading.current = false;
      setItems([]);
      setHasMore(true);
      fetchPageRef.current(1, false, searchTerm);
    } else {
      fetchPageRef.current(currentPage, false, searchTerm);
    }
  }, [currentPage, mode, searchTerm]);

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