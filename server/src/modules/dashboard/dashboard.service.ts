import type { ProjectStatus, Priority } from '@prisma/client';
import { prisma } from '../../db/prisma';

export async function getSummary() {
  const [statusGroups, priorityGroups] = await Promise.all([
    prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.project.groupBy({ by: ['priority'], _count: { _all: true } }),
  ]);

  const byStatus = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count._all])
  ) as Partial<Record<ProjectStatus, number>>;

  const byPriority = Object.fromEntries(
    priorityGroups.map((g) => [g.priority, g._count._all])
  ) as Partial<Record<Priority, number>>;

  return { byStatus, byPriority };
}

export async function getActivity() {
  return prisma.auditLog.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      action: true,
      fromStatus: true,
      toStatus: true,
      createdAt: true,
      project: { select: { id: true, title: true } },
      actor: { select: { id: true, name: true } },
    },
  });
}
