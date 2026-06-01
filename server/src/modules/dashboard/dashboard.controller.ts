import type { Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import * as dashboardService from './dashboard.service';

export async function getSummaryHandler(_req: Request, res: Response) {
  const summary = await dashboardService.getSummary();
  res.json(success(summary));
}

export async function getActivityHandler(_req: Request, res: Response) {
  const activity = await dashboardService.getActivity();
  res.json(success(activity));
}
