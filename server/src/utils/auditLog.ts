import type { AuditAction, ProjectStatus, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

interface WriteAuditEntryParams {
  projectId: string;
  actorId: string;
  action: AuditAction;
  fromStatus?: ProjectStatus;
  toStatus?: ProjectStatus;
  metadata?: Prisma.InputJsonValue;
}

export function writeAuditEntry(params: WriteAuditEntryParams) {
  return prisma.auditLog.create({ data: params });
}
