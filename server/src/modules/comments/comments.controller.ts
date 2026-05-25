import type { Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import * as commentsService from './comments.service';
import type { CreateCommentBody } from './comments.schema';

export async function listCommentsHandler(req: Request<{ id: string }>, res: Response) {
  const comments = await commentsService.listComments(req.params.id);
  res.json(success(comments));
}

export async function createCommentHandler(
  req: Request<{ id: string }, object, CreateCommentBody>,
  res: Response
) {
  const comment = await commentsService.createComment(req.params.id, req.body, req.user!.id);
  res.status(201).json(success(comment));
}
