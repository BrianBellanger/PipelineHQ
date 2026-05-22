import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { success } from '../../utils/apiResponse';
import { prisma } from '../../db/prisma';

export const departmentsRouter = Router();
export const categoriesRouter = Router();

departmentsRouter.get('/', authenticate, async (_req, res) => {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  res.json(success(departments));
});

categoriesRouter.get('/', authenticate, async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(success(categories));
});
