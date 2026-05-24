import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate, validateQuery } from '../../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  assignOwnerSchema,
  overrideStatusSchema,
} from './projects.schema';
import {
  listHandler,
  createHandler,
  getByIdHandler,
  updateHandler,
  submitHandler,
  assignOwnerHandler,
  overrideStatusHandler,
} from './projects.controller';

export const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.get('/', validateQuery(listProjectsSchema), listHandler);
projectsRouter.post('/', validate(createProjectSchema), createHandler);
projectsRouter.get('/:id', getByIdHandler);
projectsRouter.patch('/:id', validate(updateProjectSchema), updateHandler);
projectsRouter.post('/:id/submit', submitHandler);
projectsRouter.patch('/:id/owner', authorize('ADMIN'), validate(assignOwnerSchema), assignOwnerHandler);
projectsRouter.patch('/:id/status', authorize('ADMIN'), validate(overrideStatusSchema), overrideStatusHandler);
