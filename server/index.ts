// Must be first — loads .env into process.env before any module reads it
import 'dotenv/config';
// Patches Express to forward async errors to errorHandler
import 'express-async-errors';

import { createApp } from './src/app';
import { env } from './src/config/env';
import { logger } from './src/utils/logger';
import { prisma } from './src/db/prisma';

async function main() {
  const app = createApp();

  await prisma.$connect();
  logger.info('Database connected');

  app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
    logger.info(`Health check: http://localhost:${env.PORT}/api/v1/health`);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
