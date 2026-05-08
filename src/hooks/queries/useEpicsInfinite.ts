import { useInfiniteQuery } from '@tanstack/react-query';
import { getProjectEpics } from '../../services/endpoints';
import type { Epic, ApiResponse } from '../../types/apiTypes';

const PAGE_SIZE = 10;

export const useEpicsInfinite = (projectId: string, searchTerm?: string) => {
  return useInfiniteQuery({
    queryKey: ['epics', 'infinite', projectId, searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getProjectEpics(projectId, PAGE_SIZE, pageParam as number, searchTerm) as ApiResponse<Epic[]>;
      
      const contentRange = res.headers?.get?.("content-range") ?? null;
      const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 0;
      
      const data = res.data;
        
      return { data, total };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.length * PAGE_SIZE;
      return fetchedCount < lastPage.total ? fetchedCount : undefined;
    },
    enabled: !!projectId,
  });
};
