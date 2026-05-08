import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProjects } from '../../services/endpoints';
import type { Project, ApiResponse } from '../../types/apiTypes';

export const useProjects = (
  limit: number,
  offset: number,
  searchTerm?: string,
  options?: { enabled?: boolean }  
) => {
  return useQuery({
    queryKey: ['projects', limit, offset, searchTerm],
    queryFn: async () => {
      const res = await getProjects(limit, offset) as ApiResponse<Project[]>;
      const contentRange = res.headers?.get?.("content-range") ?? null;
      const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 0;
      const data = res.data;
      return { data, total };
    },
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,  
  });
};