import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { writeAuditEntry } from '../../utils/auditLog';
import type { CreateCommentBody } from './comments.schema';

const userSnippet = { select: { id: true, name: true, email: true } };

const commentSelect = {
  id: true,
  body: true,
  createdAt: true,
  author: userSnippet,
} satisfies Prisma.CommentSelect;

export async function listComments(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

  return prisma.comment.findMany({
    where: { projectId },
    select: commentSelect,
    orderBy: { createdAt: 'asc' },
  });
}

export async function createComment(
  projectId: string,
  body: CreateCommentBody,
  actorId: string
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

  const comment = await prisma.comment.create({
    data: { projectId, authorId: actorId, body: body.body },
    select: commentSelect,
  });

  await writeAuditEntry({ projectId, actorId, action: 'COMMENT_ADDED' });

  return comment;
}
