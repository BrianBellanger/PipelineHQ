import { apiClient } from './client';
import type { User, PaginationMeta } from '@/types';

export interface UsersPage {
  items: User[];
  meta: PaginationMeta;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: string;
}

export interface UpdateUserPayload {
  name?: string;
  role?: string;
}

export function listUsers(params: ListUsersParams = {}): Promise<UsersPage> {
  return apiClient.get('/users', { params });
}

export function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  return apiClient.patch(`/users/${id}`, payload);
}
