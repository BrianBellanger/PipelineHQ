import { useQuery } from '@tanstack/react-query';
import { listProjects } from '@/api/projects.api';
import type { ListProjectsParams } from '@/api/projects.api';

export const projectKeys = {
  all: ['projects'] as const,
  list: (filters: ListProjectsParams) => ['projects', 'list', filters] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
};

export function useProjects(params: ListProjectsParams = {}) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => listProjects(params),
  });
}
