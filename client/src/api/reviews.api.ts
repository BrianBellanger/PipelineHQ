import { apiClient } from './client';
import type { Project, ReviewSnippet } from '@/types';

export interface SubmitReviewPayload {
  decision: 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';
  notes?: string;
}

export function getReviewQueue(): Promise<Project[]> {
  return apiClient.get('/reviews/queue');
}

export function submitReview(
  projectId: string,
  payload: SubmitReviewPayload
): Promise<ReviewSnippet> {
  return apiClient.post(`/projects/${projectId}/reviews`, payload);
}
