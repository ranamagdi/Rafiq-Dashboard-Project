import { useInfiniteQuery } from '@tanstack/react-query';
import { getProjects } from '../../services/endpoints';
import type { Project, ApiResponse } from '../../types/apiTypes';

const PAGE_SIZE = 10;

function parseResponse(res: unknown): { data: Project[]; total: number } {
  const data = Array.isArray(res)
    ? (res as Project[])
    : ((res as ApiResponse<Project[]>)?.data ?? []);

  const total = (() => {
    if (res && typeof res === 'object' && 'headers' in res) {
      const headers = (res as { headers?: Headers }).headers;
      const contentRange = headers?.get?.('content-range') ?? null;
      if (contentRange) return parseInt(contentRange.split('/')[1], 10);
    }
    return 0;
  })();

  return { data, total };
}

export const useProjectsInfinite = (options?: { enabled?: boolean }) => {
  return useInfiniteQuery({
    queryKey: ['projects', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getProjects(PAGE_SIZE, pageParam);
      return parseResponse(res);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + page.data.length, 0);
      return totalFetched < lastPage.total ? totalFetched : undefined;
    },
    enabled: options?.enabled ?? true,  
  });
};