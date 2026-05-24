import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.router';
import { departmentsRouter, categoriesRouter } from './modules/reference/reference.router';
import { projectsRouter } from './modules/projects/projects.router';

export function createApp() {
  const app = express();

  // ── Global middleware ───────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  // ── Health check ────────────────────────────────────────────────────────────
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API routes ──────────────────────────────────────────────────────────────
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/departments', departmentsRouter);
  app.use('/api/v1/categories', categoriesRouter);
  app.use('/api/v1/projects', projectsRouter);

  // ── Global error handler (must be last) ─────────────────────────────────────
  app.use(errorHandler);

  return app;
}
