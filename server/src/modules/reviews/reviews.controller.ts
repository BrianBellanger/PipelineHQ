import type { Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import * as reviewsService from './reviews.service';
import type { SubmitReviewBody } from './reviews.schema';

export async function listProjectReviewsHandler(req: Request<{ id: string }>, res: Response) {
  const reviews = await reviewsService.listProjectReviews(req.params.id);
  res.json(success(reviews));
}

export async function submitReviewHandler(
  req: Request<{ id: string }, object, SubmitReviewBody>,
  res: Response
) {
  const review = await reviewsService.submitReview(req.params.id, req.body, req.user!.id);
  res.status(201).json(success(review));
}

export async function getReviewQueueHandler(req: Request, res: Response) {
  const projects = await reviewsService.getReviewQueue(req.user!.id);
  res.json(success(projects));
}
