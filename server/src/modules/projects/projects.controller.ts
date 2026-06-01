import type { Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import * as projectsService from './projects.service';
import type {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQuery,
  AssignOwnerBody,
  OverrideStatusBody,
} from './projects.schema';

export async function listHandler(req: Request, res: Response) {
  const query = req.query as unknown as ListProjectsQuery;
  const { projects, meta } = await projectsService.listProjects(query);
  // Bundle meta into data so the Axios interceptor (which returns response.data.data) preserves it
  res.json(success({ items: projects, meta }));
}

export async function createHandler(
  req: Request<object, object, CreateProjectBody>,
  res: Response
) {
  const project = await projectsService.createProject(req.body, req.user!.id);
  res.status(201).json(success(project));
}

export async function getByIdHandler(req: Request<{ id: string }>, res: Response) {
  const project = await projectsService.getProjectById(req.params.id);
  res.json(success(project));
}

export async function updateHandler(
  req: Request<{ id: string }, object, UpdateProjectBody>,
  res: Response
) {
  const project = await projectsService.updateProject(
    req.params.id,
    req.body,
    req.user!.id,
    req.user!.role
  );
  res.json(success(project));
}

export async function submitHandler(req: Request<{ id: string }>, res: Response) {
  const project = await projectsService.submitProject(
    req.params.id,
    req.user!.id,
    req.user!.role
  );
  res.json(success(project));
}

export async function assignOwnerHandler(
  req: Request<{ id: string }, object, AssignOwnerBody>,
  res: Response
) {
  const project = await projectsService.assignOwner(req.params.id, req.body, req.user!.id);
  res.json(success(project));
}

export async function overrideStatusHandler(
  req: Request<{ id: string }, object, OverrideStatusBody>,
  res: Response
) {
  const project = await projectsService.overrideStatus(req.params.id, req.body, req.user!.id);
  res.json(success(project));
}
