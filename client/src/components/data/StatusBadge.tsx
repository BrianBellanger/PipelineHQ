import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus } from '@/types';

const statusConfig: Record<
  ProjectStatus,
  { label: string; dot: string; className: string }
> = {
  DRAFT:        { label: 'Draft',        dot: 'bg-slate-400',   className: 'bg-slate-50 text-slate-600 border-slate-200' },
  SUBMITTED:    { label: 'Submitted',    dot: 'bg-blue-500',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Under Review', dot: 'bg-amber-500',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED:     { label: 'Approved',     dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED:     { label: 'Rejected',     dot: 'bg-red-500',     className: 'bg-red-50 text-red-700 border-red-200' },
  ON_HOLD:      { label: 'On Hold',      dot: 'bg-orange-400',  className: 'bg-orange-50 text-orange-700 border-orange-200' },
};

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn('gap-1.5', config.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </Badge>
  );
}
