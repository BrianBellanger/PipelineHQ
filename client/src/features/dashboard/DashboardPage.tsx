import type { ReactNode } from 'react';
import { useDashboardSummary, useDashboardActivity } from './hooks/useDashboard';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/data/StatusBadge';
import { PriorityChip } from '@/components/data/PriorityChip';
import { cn } from '@/lib/utils';
import type { ProjectStatus, Priority, AuditAction, ActivityEntry } from '@/types';

const STATUS_ORDER: ProjectStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'ON_HOLD',
];

const PRIORITY_ORDER: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const STATUS_ACCENT: Record<ProjectStatus, string> = {
  DRAFT:        'border-t-slate-300',
  SUBMITTED:    'border-t-blue-400',
  UNDER_REVIEW: 'border-t-amber-400',
  APPROVED:     'border-t-emerald-500',
  REJECTED:     'border-t-red-500',
  ON_HOLD:      'border-t-orange-400',
};

const PRIORITY_ACCENT: Record<Priority, string> = {
  CRITICAL: 'border-l-red-500',
  HIGH:     'border-l-orange-500',
  MEDIUM:   'border-l-sky-400',
  LOW:      'border-l-slate-300',
};

function formatAction(entry: ActivityEntry): string {
  const action: Record<AuditAction, string> = {
    PROJECT_CREATED:   'created',
    PROJECT_SUBMITTED: 'submitted for review',
    PROJECT_UPDATED:   'updated',
    REVIEW_SUBMITTED:  'reviewed',
    STATUS_CHANGED:    `changed status${entry.fromStatus && entry.toStatus ? ` (${entry.fromStatus} → ${entry.toStatus})` : ''}`,
    COMMENT_ADDED:     'commented on',
    OWNER_ASSIGNED:    'assigned owner to',
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

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {children}
      </h2>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      {/* Page header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Project intake and governance overview
        </p>
      </div>

      {/* Status breakdown */}
      <section>
        <SectionHeader>Projects by Status</SectionHeader>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {summaryLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[90px] rounded-lg" />
              ))
            : STATUS_ORDER.map((status) => (
                <Card
                  key={status}
                  className={cn('border-t-2 shadow-none hover:shadow-sm transition-shadow', STATUS_ACCENT[status])}
                >
                  <CardContent className="px-3 py-4 text-center">
                    <p className="text-3xl font-bold font-mono tabular-nums leading-none text-foreground">
                      {summary?.byStatus[status] ?? 0}
                    </p>
                    <div className="mt-2.5 flex justify-center">
                      <StatusBadge status={status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Priority breakdown */}
      <section>
        <SectionHeader>Projects by Priority</SectionHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[60px] rounded-lg" />
              ))
            : PRIORITY_ORDER.map((priority) => (
                <Card
                  key={priority}
                  className={cn('border-l-4 shadow-none hover:shadow-sm transition-shadow', PRIORITY_ACCENT[priority])}
                >
                  <CardContent className="flex items-center justify-between px-4 py-3">
                    <PriorityChip priority={priority} />
                    <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                      {summary?.byPriority[priority] ?? 0}
                    </span>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <SectionHeader>Recent Activity</SectionHeader>
        {activityLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-md" />
            ))}
          </div>
        ) : !activity?.length ? (
          <p className="text-sm text-muted-foreground py-6">No activity yet.</p>
        ) : (
          <div className="rounded-lg border bg-card divide-y">
            {activity.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                <div className="flex-1 min-w-0 flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-semibold text-foreground shrink-0">{entry.actor.name}</span>
                  <span className="text-muted-foreground shrink-0">{formatAction(entry)}</span>
                  <Link
                    to={`/projects/${entry.project.id}`}
                    className="truncate font-medium hover:underline underline-offset-2 text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {entry.project.title}
                  </Link>
                </div>
                <span className="text-xs text-muted-foreground font-mono ml-auto shrink-0 tabular-nums">
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
