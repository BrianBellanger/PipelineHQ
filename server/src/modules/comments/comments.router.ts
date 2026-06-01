import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createCommentSchema } from './comments.schema';
import { listCommentsHandler, createCommentHandler } from './comments.controller';

// Mounted at /api/v1/projects/:id/comments via projectsRouter.use()
// authenticate is already applied by the parent projectsRouter
export const projectCommentsRouter = Router({ mergeParams: true });
projectCommentsRouter.get('/', listCommentsHandler);
projectCommentsRouter.post('/', validate(createCommentSchema), createCommentHandler);
