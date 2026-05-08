import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProjectEpics } from '../../services/endpoints';
import type { Epic, ApiResponse } from '../../types/apiTypes';

export const useEpics = (projectId: string, limit: number, offset: number, searchTerm?: string) => {
  return useQuery({
    queryKey: ['epics', projectId, limit, offset, searchTerm],
    queryFn: async () => {
      const res = await getProjectEpics(projectId, limit, offset, searchTerm) as ApiResponse<Epic[]>;
      
      const contentRange = res.headers?.get?.("content-range") ?? null;
      const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 0;
      
      const data = res.data;
        
      return { data, total };
    },
    placeholderData: keepPreviousData,
    enabled: !!projectId,
  });
};
