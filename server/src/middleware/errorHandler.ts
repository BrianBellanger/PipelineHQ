import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { fail } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode = 500,
    public code = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'root';
      (fields[key] ??= []).push(issue.message);
    }
    res.status(422).json(fail('Validation failed', 'VALIDATION_ERROR', fields));
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json(fail('A record with that value already exists', 'CONFLICT'));
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json(fail('Record not found', 'NOT_FOUND'));
      return;
    }
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.message, err.code));
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json(fail('An unexpected error occurred', 'INTERNAL_ERROR'));
}
