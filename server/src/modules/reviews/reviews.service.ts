import type { ProjectStatus, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { writeAuditEntry } from '../../utils/auditLog';
import type { SubmitReviewBody } from './reviews.schema';

const userSnippet = { select: { id: true, name: true, email: true } };

const reviewSelect = {
  id: true,
  decision: true,
  notes: true,
  createdAt: true,
  reviewer: userSnippet,
} satisfies Prisma.ProjectReviewSelect;

const queueProjectSelect = {
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

export async function listProjectReviews(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

  return prisma.projectReview.findMany({
    where: { projectId },
    select: reviewSelect,
    orderBy: { createdAt: 'asc' },
  });
}

export async function submitReview(
  projectId: string,
  body: SubmitReviewBody,
  actorId: string
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

  if (project.status !== 'SUBMITTED' && project.status !== 'UNDER_REVIEW') {
    throw new AppError(
      'Reviews can only be submitted for SUBMITTED or UNDER_REVIEW projects',
      409,
      'INVALID_STATE'
    );
  }

  const review = await prisma.projectReview.create({
    data: {
      projectId,
      reviewerId: actorId,
      decision: body.decision,
      notes: body.notes ?? null,
    },
    select: reviewSelect,
  });

  await writeAuditEntry({ projectId, actorId, action: 'REVIEW_SUBMITTED' });

  let newStatus: ProjectStatus;
  if (body.decision === 'REJECTED') {
    newStatus = 'REJECTED';
  } else if (body.decision === 'NEEDS_INFO') {
    newStatus = 'ON_HOLD';
  } else {
    const rejectedCount = await prisma.projectReview.count({
      where: { projectId, decision: 'REJECTED' },
    });
    newStatus = rejectedCount > 0 ? 'UNDER_REVIEW' : 'APPROVED';
  }

  const fromStatus = project.status as ProjectStatus;

  await prisma.project.update({ where: { id: projectId }, data: { status: newStatus } });

  if (fromStatus !== newStatus) {
    await writeAuditEntry({
      projectId,
      actorId,
      action: 'STATUS_CHANGED',
      fromStatus,
      toStatus: newStatus,
    });
  }

  return review;
}

export async function getReviewQueue(actorId: string) {
  return prisma.project.findMany({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      reviews: { none: { reviewerId: actorId } },
    },
    select: queueProjectSelect,
    orderBy: { updatedAt: 'asc' },
  });
}
