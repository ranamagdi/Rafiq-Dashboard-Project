import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject } from '../../services/endpoints';

export const useProjects = (limit: number, offset: number) => {
  return useQuery({
    queryKey: ['projects', limit, offset],
    queryFn: () => getProjects(limit, offset),
    placeholderData: (previousData) => previousData, // Keeps UI stable during pagination
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
