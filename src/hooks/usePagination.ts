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
// UsePaginationOptions — replace the root type
root?: React.RefObject<Element | null> | Element | null;
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
  root, // 👈 added
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

  const searchTermRef = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const infiniteNextPage = useRef<number>(1);
  const infiniteHasMore = useRef<boolean>(true);
  const infiniteLoading = useRef<boolean>(false);
const rootRef = useRef<Element | null>(null);
useEffect(() => {
  if (root && "current" in root) {
    rootRef.current = root.current;
  } else {
    rootRef.current = root ?? null;
  }
}, [root]);

  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchPage = useCallback(
    async (
      pageNum: number,
      shouldAppend: boolean,
      term: string = searchTermRef.current,
    ) => {
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

        if (shouldAppend) {
          setItems((prev) => [...prev, ...data]);
        } else {
          setItems(data);
        }

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
          if (mode === "infinite") {
            infiniteHasMore.current = false;
          }
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
        if (mode === "infinite") {
          infiniteLoading.current = false;
        }
      }
    },
    [limit, mode],
  );

  const fetchPageRef = useRef(fetchPage);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  useEffect(() => {
    if (mode !== "infinite") return;
    infiniteNextPage.current = 1;
    infiniteHasMore.current = true;
    infiniteLoading.current = false;
    fetchPageRef.current(1, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode !== "paginated") return;
    if (isInvalidPage) return;
    fetchPageRef.current(currentPage, false);
  }, [currentPage, mode, isInvalidPage]);

  useEffect(() => {
    if (mode !== "paginated") return;
    const params = new URLSearchParams(searchParams);
    if (!params.get("page")) {
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams, mode]);

  const setSearchTerm = useCallback(
    (term: string) => {
      setSearchTermState(term);
      searchTermRef.current = term;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (mode === "paginated") {
          setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", "1");
            return params;
          });
        } else {
          infiniteNextPage.current = 1;
          infiniteHasMore.current = true;
          infiniteLoading.current = false;
          setItems([]);
          setHasMore(true);
          fetchPageRef.current(1, false, term);
        }
      }, 400);
    },
    [setSearchParams, mode],
  );

  const goToPage = useCallback(
    (pageNum: number) => {
      setSearchTermState("");
      searchTermRef.current = "";
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", String(pageNum));
        return params;
      });
      fetchPageRef.current(pageNum, false);
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

  // 👈 Only change: reads rootRef.current so the observer uses the column
  //    scroll container instead of the viewport. Re-attaches whenever the
  //    node changes (same as before) — rootRef always has the latest value.
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (mode !== "infinite") return;
      observer.current?.disconnect();
      if (!node) return;
      observer.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            infiniteHasMore.current &&
            !infiniteLoading.current
          ) {
            fetchPageRef.current(infiniteNextPage.current, true);
          }
        },
        {
          root: rootRef.current,   // 👈 column div, not the viewport
          rootMargin: "100px",
          threshold: 0,
        },
      );
      observer.current.observe(node);
    },
    [mode], // rootRef is a ref so it doesn't need to be a dep
  );

  const refresh = useCallback(() => {
    if (mode === "infinite") {
      infiniteNextPage.current = 1;
      infiniteHasMore.current = true;
      infiniteLoading.current = false;
      setItems([]);
      setHasMore(true);
      fetchPageRef.current(1, false);
    } else {
      fetchPageRef.current(currentPage, false);
    }
  }, [currentPage, mode]);

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