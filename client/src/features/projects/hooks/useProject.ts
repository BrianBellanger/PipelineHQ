import { useQuery } from '@tanstack/react-query';
import { getProject } from '@/api/projects.api';
import { projectKeys } from './useProjects';

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}
