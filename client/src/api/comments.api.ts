import { apiClient } from './client';
import type { CommentSnippet } from '@/types';

export function createComment(projectId: string, body: string): Promise<CommentSnippet> {
  return apiClient.post(`/projects/${projectId}/comments`, { body });
}
