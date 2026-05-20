// Shared TypeScript types consumed by both client and server.
// No runtime code — types only.

export type UserRole = 'ADMIN' | 'REVIEWER' | 'SUBMITTER';

export type ProjectStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ON_HOLD';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ReviewDecision = 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';

export type AuditAction =
  | 'PROJECT_CREATED'
  | 'PROJECT_SUBMITTED'
  | 'PROJECT_UPDATED'
  | 'REVIEW_SUBMITTED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'OWNER_ASSIGNED';

// ── API response envelope ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
