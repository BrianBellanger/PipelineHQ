import { apiClient } from './client';
import type { Department, Category } from '@/types';

export function getDepartments() {
  return apiClient.get<never, Department[]>('/departments');
}

export function getCategories() {
  return apiClient.get<never, Category[]>('/categories');
}
