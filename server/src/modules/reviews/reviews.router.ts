import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { submitReviewSchema } from './reviews.schema';
import {
  listProjectReviewsHandler,
  submitReviewHandler,
  getReviewQueueHandler,
} from './reviews.controller';

// Mounted at /api/v1/reviews
export const reviewsRouter = Router();
reviewsRouter.use(authenticate);
reviewsRouter.get('/queue', getReviewQueueHandler);

// Mounted at /api/v1/projects/:id/reviews via projectsRouter.use()
// authenticate is already applied by the parent projectsRouter
export const projectReviewsRouter = Router({ mergeParams: true });
projectReviewsRouter.get('/', listProjectReviewsHandler);
projectReviewsRouter.post(
  '/',
  authorize('REVIEWER', 'ADMIN'),
  validate(submitReviewSchema),
  submitReviewHandler
);
