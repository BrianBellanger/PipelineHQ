import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitProject } from '@/api/projects.api';
import { projectKeys } from './useProjects';

export function useSubmitProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => submitProject(projectId),
    onSuccess: (updated) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updated);
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
