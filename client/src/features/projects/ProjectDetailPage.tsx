import { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProject } from './hooks/useProject';
import { useSubmitProject } from './hooks/useSubmitProject';
import { useCreateComment } from './hooks/useCreateComment';
import { useSubmitReview } from '@/features/reviews/hooks/useSubmitReview';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/data/StatusBadge';
import { PriorityChip } from '@/components/data/PriorityChip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const reviewSchema = z
  .object({
    decision: z.enum(['APPROVED', 'REJECTED', 'NEEDS_INFO'], {
      required_error: 'Please select a decision',
    }),
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

type ReviewFormValues = z.infer<typeof reviewSchema>;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm">{value ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const fromReviews = location.state?.fromReviews === true;
  const user = useAuthStore((s) => s.user);
  const { data: project, isLoading, isError } = useProject(id!);
  const submitProject = useSubmitProject(id!);
  const submitReview = useSubmitReview(id!);
  const createComment = useCreateComment(id!);

  const [commentBody, setCommentBody] = useState('');

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { decision: '' as ReviewFormValues['decision'], notes: '' },
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  if (isError || !project) {
    return <div className="p-6 text-sm text-destructive">Project not found.</div>;
  }

  const canSubmit =
    project.status === 'DRAFT' &&
    (user?.role === 'ADMIN' || user?.id === project.requestedById);

  const canEdit =
    project.status === 'DRAFT' &&
    (user?.role === 'ADMIN' || user?.id === project.requestedById);

  const isReviewable =
    project.status === 'SUBMITTED' || project.status === 'UNDER_REVIEW';

  const hasAlreadyReviewed = project.reviews.some((r) => r.reviewer.id === user?.id);

  const canReview =
    isReviewable &&
    (user?.role === 'REVIEWER' || user?.role === 'ADMIN') &&
    !hasAlreadyReviewed;

  function handleReviewSubmit(values: ReviewFormValues) {
    submitReview.mutate(values, {
      onSuccess: () => reviewForm.reset({ decision: '' as ReviewFormValues['decision'], notes: '' }),
    });
  }

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    createComment.mutate(commentBody, {
      onSuccess: () => setCommentBody(''),
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        to={fromReviews ? '/reviews' : '/projects'}
        className="text-sm text-muted-foreground hover:underline"
      >
        {fromReviews ? '← Reviews' : '← Projects'}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            <PriorityChip priority={project.priority} />
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link to={`/projects/${project.id}/edit`}>Edit</Link>
            </Button>
          )}
          {canSubmit && (
            <Button
              onClick={() => submitProject.mutate()}
              disabled={submitProject.isPending}
            >
              {submitProject.isPending ? 'Submitting…' : 'Submit for review'}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Metadata grid */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <DetailRow label="Department" value={project.department.name} />
        <DetailRow label="Category" value={project.category.name} />
        <DetailRow
          label="Due date"
          value={project.dueDate ? new Date(project.dueDate).toLocaleDateString() : null}
        />
        <DetailRow label="Submitted by" value={project.requestedBy.name} />
        <DetailRow label="Owner" value={project.owner?.name} />
        <DetailRow
          label="Created"
          value={new Date(project.createdAt).toLocaleDateString()}
        />
      </dl>

      <Separator />

      {/* Description */}
      <section className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Description
        </h2>
        <p className="text-sm whitespace-pre-wrap">{project.description}</p>
      </section>

      <section className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Business justification
        </h2>
        <p className="text-sm whitespace-pre-wrap">{project.businessJustification}</p>
      </section>

      <Separator />

      {/* Reviews */}
      <section className="space-y-3">
        <h2 className="font-semibold">Reviews</h2>
        {project.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="space-y-2">
            {project.reviews.map((r) => (
              <li key={r.id} className="text-sm border rounded-md p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{r.reviewer.name}</span>
                  <span className="text-muted-foreground">·</span>
                  <span
                    className={
                      r.decision === 'APPROVED'
                        ? 'text-green-600 font-medium'
                        : r.decision === 'REJECTED'
                        ? 'text-red-600 font-medium'
                        : 'text-yellow-600 font-medium'
                    }
                  >
                    {r.decision === 'NEEDS_INFO' ? 'Needs Info' : r.decision.charAt(0) + r.decision.slice(1).toLowerCase()}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.notes && <p className="text-muted-foreground">{r.notes}</p>}
              </li>
            ))}
          </ul>
        )}

        {/* Review form */}
        {canReview && (
          <div className="border rounded-md p-4 space-y-4 bg-muted/30">
            <h3 className="text-sm font-semibold">Submit your review</h3>
            <Form {...reviewForm}>
              <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="space-y-4">
                <FormField
                  control={reviewForm.control}
                  name="decision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a decision" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                          <SelectItem value="NEEDS_INFO">Needs Info</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reviewForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Notes{' '}
                        {['REJECTED', 'NEEDS_INFO'].includes(reviewForm.watch('decision')) && (
                          <span className="text-destructive">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes or feedback…"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitReview.isError && (
                  <p className="text-sm text-destructive">Failed to submit review. Please try again.</p>
                )}

                <Button type="submit" disabled={submitReview.isPending}>
                  {submitReview.isPending ? 'Submitting…' : 'Submit review'}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </section>

      <Separator />

      {/* Comments */}
      <section className="space-y-3">
        <h2 className="font-semibold">Comments</h2>
        {project.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {project.comments.map((c) => (
              <li key={c.id} className="text-sm border rounded-md p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{c.author.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Comment form */}
        <form onSubmit={handleCommentSubmit} className="space-y-2">
          <Textarea
            placeholder="Add a comment…"
            rows={3}
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
          />
          {createComment.isError && (
            <p className="text-sm text-destructive">Failed to post comment. Please try again.</p>
          )}
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={createComment.isPending || !commentBody.trim()}
          >
            {createComment.isPending ? 'Posting…' : 'Post comment'}
          </Button>
        </form>
      </section>
    </div>
  );
}
