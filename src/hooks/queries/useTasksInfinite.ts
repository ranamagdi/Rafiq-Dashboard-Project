import { useInfiniteQuery } from '@tanstack/react-query';
import { getProjectTasks } from '../../services/endpoints';
import type { Task, StatusVariant, ApiResponse } from '../../types/apiTypes';

const PAGE_SIZE = 10;

export const useTasksInfinite = (
  projectId: string, 
  status?: StatusVariant, 
  searchTerm?: string
) => {
  return useInfiniteQuery({
    queryKey: ['tasks', 'infinite', projectId, status, searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getProjectTasks(projectId, status, PAGE_SIZE, pageParam as number, searchTerm) as ApiResponse<Task[]>;
      
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
