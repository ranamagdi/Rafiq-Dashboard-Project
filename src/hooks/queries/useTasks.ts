import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProjectTasks } from '../../services/endpoints';
import type { Task, StatusVariant } from '../../types/apiTypes';

export const useTasks = (
  projectId: string,
  status?: StatusVariant,
  limit?: number,
  offset?: number,
  searchTerm?: string
) => {
  return useQuery({
    queryKey: ['tasks', projectId, status, limit, offset, searchTerm],
    queryFn: async () => {
      const res = await getProjectTasks(projectId, status, limit, offset, searchTerm) as ApiResponse<Task[]>;
      
      const contentRange = res.headers?.get?.("content-range") ?? null;
      const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 0;
      
      const data = res.data;
        
      return { data, total };
    },
    placeholderData: keepPreviousData,
    enabled: !!projectId,
  });
};
