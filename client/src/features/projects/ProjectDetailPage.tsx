import { Link, useParams } from 'react-router-dom';
import { useProject } from './hooks/useProject';
import { useSubmitProject } from './hooks/useSubmitProject';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/data/StatusBadge';
import { PriorityChip } from '@/components/data/PriorityChip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
  const user = useAuthStore((s) => s.user);
  const { data: project, isLoading, isError } = useProject(id!);
  const submitProject = useSubmitProject(id!);

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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link to="/projects" className="text-sm text-muted-foreground hover:underline">
        ← Projects
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

      {/* Reviews placeholder — wired in Phase 3 */}
      <section className="space-y-2">
        <h2 className="font-semibold">Reviews</h2>
        {project.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="space-y-2">
            {project.reviews.map((r) => (
              <li key={r.id} className="text-sm border rounded-md p-3">
                <span className="font-medium">{r.reviewer.name}</span>
                {' · '}
                <span className="text-muted-foreground">{r.decision}</span>
                {r.notes && <p className="mt-1 text-muted-foreground">{r.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      {/* Comments placeholder — wired in Phase 3 */}
      <section className="space-y-2">
        <h2 className="font-semibold">Comments</h2>
        {project.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {project.comments.map((c) => (
              <li key={c.id} className="text-sm border rounded-md p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{c.author.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
