import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment } from '@/api/comments.api';
import { projectKeys } from './useProjects';

export function useCreateComment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => createComment(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}
