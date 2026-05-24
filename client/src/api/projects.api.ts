import { apiClient } from './client';
import type { Project, PaginationMeta } from '@/types';

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  categoryId?: string;
  departmentId?: string;
}

export interface ProjectsPage {
  items: Project[];
  meta: PaginationMeta;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  businessJustification: string;
  priority: string;
  categoryId: string;
  departmentId: string;
  dueDate?: string | null;
}

export function listProjects(params: ListProjectsParams = {}) {
  return apiClient.get<never, ProjectsPage>('/projects', { params });
}

export function getProject(id: string) {
  return apiClient.get<never, Project>(`/projects/${id}`);
}

export function createProject(payload: CreateProjectPayload) {
  return apiClient.post<never, Project>('/projects', payload);
}

export function updateProject(id: string, payload: Partial<CreateProjectPayload>) {
  return apiClient.patch<never, Project>(`/projects/${id}`, payload);
}

export function submitProject(id: string) {
  return apiClient.post<never, Project>(`/projects/${id}/submit`);
}

export function assignOwner(id: string, ownerId: string) {
  return apiClient.patch<never, Project>(`/projects/${id}/owner`, { ownerId });
}

export function overrideStatus(id: string, status: string) {
  return apiClient.patch<never, Project>(`/projects/${id}/status`, { status });
}
