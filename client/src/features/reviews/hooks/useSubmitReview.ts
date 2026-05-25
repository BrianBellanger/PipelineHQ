import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReview } from '@/api/reviews.api';
import type { SubmitReviewPayload } from '@/api/reviews.api';
import { projectKeys } from '@/features/projects/hooks/useProjects';
import { reviewKeys } from './useReviewQueue';

export function useSubmitReview(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) => submitReview(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: reviewKeys.queue });
    },
  });
}
