import { apiClient } from './client';
import type { User } from '@/types';

export interface AuthResponse {
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  token: string;
}

export function login(email: string, password: string) {
  return apiClient.post<never, AuthResponse>('/auth/login', { email, password });
}

export function register(name: string, email: string, password: string) {
  return apiClient.post<never, AuthResponse>('/auth/register', { name, email, password });
}

export function getMe() {
  return apiClient.get<never, Pick<User, 'id' | 'name' | 'email' | 'role'>>('/auth/me');
}
