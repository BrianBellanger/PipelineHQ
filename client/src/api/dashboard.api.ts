import { apiClient } from './client';
import type { DashboardSummary, ActivityEntry } from '@/types';

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiClient.get('/dashboard/summary');
}

export function getDashboardActivity(): Promise<ActivityEntry[]> {
  return apiClient.get('/dashboard/activity');
}
