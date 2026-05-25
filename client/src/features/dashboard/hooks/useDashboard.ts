import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getDashboardActivity } from '@/api/dashboard.api';

const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
  activity: ['dashboard', 'activity'] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: getDashboardSummary,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity,
    queryFn: getDashboardActivity,
  });
}
