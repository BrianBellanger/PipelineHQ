import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

// Parses req.body through the schema. ZodError is caught by errorHandler.
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}

// For validating query params instead of body
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.query = schema.parse(req.query);
    next();
  };
}
