import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate, validateQuery } from '../../middleware/validate';
import { listUsersSchema, updateUserSchema } from './users.schema';
import { listUsersHandler, getUserByIdHandler, updateUserHandler } from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate, authorize('ADMIN'));
usersRouter.get('/', validateQuery(listUsersSchema), listUsersHandler);
usersRouter.get('/:id', getUserByIdHandler);
usersRouter.patch('/:id', validate(updateUserSchema), updateUserHandler);
