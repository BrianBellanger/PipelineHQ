import { z } from 'zod';

export const submitReviewSchema = z
  .object({
    decision: z.enum(['APPROVED', 'REJECTED', 'NEEDS_INFO']),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.decision === 'REJECTED' || data.decision === 'NEEDS_INFO') {
        return !!data.notes && data.notes.trim().length > 0;
      }
      return true;
    },
    { message: 'Notes are required for REJECTED and NEEDS_INFO decisions', path: ['notes'] }
  );

export type SubmitReviewBody = z.infer<typeof submitReviewSchema>;
