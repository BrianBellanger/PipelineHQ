export type UserRole = 'ADMIN' | 'REVIEWER' | 'SUBMITTER';

export type AuditAction =
  | 'PROJECT_CREATED'
  | 'PROJECT_SUBMITTED'
  | 'PROJECT_UPDATED'
  | 'REVIEW_SUBMITTED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'OWNER_ASSIGNED';

export type ProjectStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ON_HOLD';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ReviewDecision = 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  businessJustification: string;
  priority: Priority;
  status: ProjectStatus;
  dueDate: string | null;
  requestedById: string;
  ownerId: string | null;
  categoryId: string;
  departmentId: string;
  requestedBy: Pick<User, 'id' | 'name' | 'email'>;
  owner: Pick<User, 'id' | 'name' | 'email'> | null;
  category: Category;
  department: Department;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectReview {
  id: string;
  projectId: string;
  reviewerId: string;
  decision: ReviewDecision;
  notes: string | null;
  reviewer: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  body: string;
  author: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
}

export interface ReviewSnippet {
  id: string;
  decision: ReviewDecision;
  notes: string | null;
  createdAt: string;
  reviewer: Pick<User, 'id' | 'name' | 'email'>;
}

export interface CommentSnippet {
  id: string;
  body: string;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'email'>;
}

export interface ProjectDetail extends Project {
  reviews: ReviewSnippet[];
  comments: CommentSnippet[];
}

export interface DashboardSummary {
  byStatus: Partial<Record<ProjectStatus, number>>;
  byPriority: Partial<Record<Priority, number>>;
}

export interface ActivityEntry {
  id: string;
  action: AuditAction;
  fromStatus: ProjectStatus | null;
  toStatus: ProjectStatus | null;
  createdAt: string;
  project: { id: string; title: string };
  actor: { id: string; name: string };
}
