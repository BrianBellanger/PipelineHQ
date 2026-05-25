import { useQuery } from '@tanstack/react-query';
import { getReviewQueue } from '@/api/reviews.api';

export const reviewKeys = {
  queue: ['reviews', 'queue'] as const,
};

export function useReviewQueue() {
  return useQuery({
    queryKey: reviewKeys.queue,
    queryFn: getReviewQueue,
  });
}
