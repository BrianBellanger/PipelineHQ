import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/api/projects.api';
import { projectKeys } from './useProjects';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
