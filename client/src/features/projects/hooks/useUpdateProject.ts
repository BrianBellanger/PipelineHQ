import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/api/projects.api';
import type { CreateProjectPayload } from '@/api/projects.api';
import { projectKeys } from './useProjects';
import { toast } from 'sonner';

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateProjectPayload>) => updateProject(projectId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updated);
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project updated');
    },
    onError: () => {
      toast.error('Failed to update project');
    },
  });
}
