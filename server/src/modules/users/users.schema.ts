import { z } from 'zod';

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['ADMIN', 'REVIEWER', 'SUBMITTER']).optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    role: z.enum(['ADMIN', 'REVIEWER', 'SUBMITTER']).optional(),
  })
  .refine((data) => data.name !== undefined || data.role !== undefined, {
    message: 'At least one field must be provided',
  });

export type ListUsersQuery = z.infer<typeof listUsersSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
