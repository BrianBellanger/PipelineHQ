import { useDashboardSummary, useDashboardActivity } from './hooks/useDashboard';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/data/StatusBadge';
import type { ProjectStatus, Priority, AuditAction, ActivityEntry } from '@/types';

const STATUS_ORDER: ProjectStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'ON_HOLD',
];

const PRIORITY_ORDER: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const PRIORITY_COLOR: Record<Priority, string> = {
  LOW: 'text-slate-600',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  CRITICAL: 'text-red-600',
};

function formatAction(entry: ActivityEntry): string {
  const action: Record<AuditAction, string> = {
    PROJECT_CREATED: 'created',
    PROJECT_SUBMITTED: 'submitted for review',
    PROJECT_UPDATED: 'updated',
    REVIEW_SUBMITTED: 'reviewed',
    STATUS_CHANGED: `status changed${entry.fromStatus && entry.toStatus ? ` (${entry.fromStatus} → ${entry.toStatus})` : ''}`,
    COMMENT_ADDED: 'commented on',
    OWNER_ASSIGNED: 'assigned owner to',
  };
  return action[entry.action] ?? entry.action;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of all project activity</p>
      </div>

      {/* Status breakdown */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Projects by status
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {summaryLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))
            : STATUS_ORDER.map((status) => (
                <Card key={status} className="text-center py-2">
                  <CardHeader className="pb-1 pt-3 px-3">
                    <StatusBadge status={status} className="mx-auto" />
                  </CardHeader>
                  <CardContent className="pb-3 px-3">
                    <p className="text-2xl font-bold">
                      {summary?.byStatus[status] ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">{STATUS_LABEL[status]}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Priority breakdown */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Projects by priority
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))
            : PRIORITY_ORDER.map((priority) => (
                <Card key={priority}>
                  <CardContent className="flex items-center justify-between p-4">
                    <span className={`text-sm font-medium ${PRIORITY_COLOR[priority]}`}>
                      {PRIORITY_LABEL[priority]}
                    </span>
                    <span className="text-2xl font-bold">
                      {summary?.byPriority[priority] ?? 0}
                    </span>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent activity
        </h2>
        {activityLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-md" />
            ))}
          </div>
        ) : !activity?.length ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="rounded-md border divide-y">
            {activity.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="font-medium shrink-0">{entry.actor.name}</span>
                <span className="text-muted-foreground">{formatAction(entry)}</span>
                <Link
                  to={`/projects/${entry.project.id}`}
                  className="truncate hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {entry.project.title}
                </Link>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">
                  {timeAgo(entry.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
