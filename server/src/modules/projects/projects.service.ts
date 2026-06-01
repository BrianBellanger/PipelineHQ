import type { ProjectStatus, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { writeAuditEntry } from '../../utils/auditLog';
import type {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQuery,
  AssignOwnerBody,
  OverrideStatusBody,
} from './projects.schema';

// ── Reusable select shapes ─────────────────────────────────────────────────────

const userSnippet = { select: { id: true, name: true, email: true } };

const summarySelect = {
  id: true,
  title: true,
  priority: true,
  status: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  requestedBy: userSnippet,
  owner: userSnippet,
  category: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
} satisfies Prisma.ProjectSelect;

const detailSelect = {
  ...summarySelect,
  description: true,
  businessJustification: true,
  requestedById: true,
  ownerId: true,
  categoryId: true,
  departmentId: true,
  reviews: {
    select: {
      id: true,
      decision: true,
      notes: true,
      createdAt: true,
      reviewer: userSnippet,
    },
    orderBy: { createdAt: 'asc' as const },
  },
  comments: {
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: userSnippet,
    },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.ProjectSelect;

// ── Service functions ──────────────────────────────────────────────────────────

export async function createProject(body: CreateProjectBody, actorId: string) {
  const project = await prisma.project.create({
    data: {
      title: body.title,
      description: body.description,
      businessJustification: body.businessJustification,
      priority: body.priority,
      categoryId: body.categoryId,
      departmentId: body.departmentId,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      requestedById: actorId,
    },
    select: detailSelect,
  });

  await writeAuditEntry({
    projectId: project.id,
    actorId,
    action: 'PROJECT_CREATED',
    toStatus: 'DRAFT',
  });

  return project;
}

export async function listProjects(query: ListProjectsQuery) {
  const { page, limit, status, priority, categoryId, departmentId } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectWhereInput = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(categoryId && { categoryId }),
    ...(departmentId && { departmentId }),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      select: summarySelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: detailSelect,
  });

  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  return project;
}

export async function updateProject(
  id: string,
  body: UpdateProjectBody,
  actorId: string,
  actorRole: string
) {
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');
  if (project.status !== 'DRAFT') {
    throw new AppError('Only DRAFT projects can be edited', 409, 'INVALID_STATE');
  }
  if (project.requestedById !== actorId && actorRole !== 'ADMIN') {
    throw new AppError('Not authorized to edit this project', 403, 'FORBIDDEN');
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.businessJustification !== undefined && {
        businessJustification: body.businessJustification,
      }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
      ...(body.departmentId !== undefined && { departmentId: body.departmentId }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
    },
    select: detailSelect,
  });

  await writeAuditEntry({ projectId: id, actorId, action: 'PROJECT_UPDATED' });

  return updated;
}

export async function submitProject(id: string, actorId: string, actorRole: string) {
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');
  if (project.status !== 'DRAFT') {
    throw new AppError('Only DRAFT projects can be submitted', 409, 'INVALID_STATE');
  }
  if (project.requestedById !== actorId && actorRole !== 'ADMIN') {
    throw new AppError('Not authorized to submit this project', 403, 'FORBIDDEN');
  }

  const updated = await prisma.project.update({
    where: { id },
    data: { status: 'SUBMITTED' },
    select: detailSelect,
  });

  await writeAuditEntry({
    projectId: id,
    actorId,
    action: 'PROJECT_SUBMITTED',
    fromStatus: 'DRAFT',
    toStatus: 'SUBMITTED',
  });

  return updated;
}

export async function assignOwner(id: string, body: AssignOwnerBody, actorId: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

  const owner = await prisma.user.findUnique({ where: { id: body.ownerId } });
  if (!owner) throw new AppError('User not found', 404, 'NOT_FOUND');

  const updated = await prisma.project.update({
    where: { id },
    data: { ownerId: body.ownerId },
    select: detailSelect,
  });

  await writeAuditEntry({ projectId: id, actorId, action: 'OWNER_ASSIGNED' });

  return updated;
}

export async function overrideStatus(
  id: string,
  body: OverrideStatusBody,
  actorId: string
) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

  const fromStatus = project.status as ProjectStatus;
  const toStatus = body.status as ProjectStatus;

  const updated = await prisma.project.update({
    where: { id },
    data: { status: toStatus },
    select: detailSelect,
  });

  await writeAuditEntry({
    projectId: id,
    actorId,
    action: 'STATUS_CHANGED',
    fromStatus,
    toStatus,
  });

  return updated;
}
