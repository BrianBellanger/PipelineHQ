import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getSummaryHandler, getActivityHandler } from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get('/summary', getSummaryHandler);
dashboardRouter.get('/activity', getActivityHandler);
