import type { Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import * as usersService from './users.service';
import type { ListUsersQuery, UpdateUserBody } from './users.schema';

export async function listUsersHandler(req: Request, res: Response) {
  const query = req.query as unknown as ListUsersQuery;
  const { users, meta } = await usersService.listUsers(query);
  res.json(success({ items: users, meta }));
}

export async function getUserByIdHandler(req: Request<{ id: string }>, res: Response) {
  const user = await usersService.getUserById(req.params.id);
  res.json(success(user));
}

export async function updateUserHandler(
  req: Request<{ id: string }, object, UpdateUserBody>,
  res: Response
) {
  const user = await usersService.updateUser(req.params.id, req.body);
  res.json(success(user));
}
