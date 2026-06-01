import type { Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import * as authService from './auth.service';
import type { RegisterBody, LoginBody } from './auth.schema';

export async function registerHandler(req: Request<object, object, RegisterBody>, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(success(result));
}

export async function loginHandler(req: Request<object, object, LoginBody>, res: Response) {
  const result = await authService.login(req.body);
  res.status(200).json(success(result));
}

export async function meHandler(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  res.status(200).json(success(user));
}
