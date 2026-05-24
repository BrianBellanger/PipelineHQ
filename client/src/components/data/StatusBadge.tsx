import { Badge } from '@/components/ui/badge';
import type { ProjectStatus } from '@/types';

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  DRAFT:        { label: 'Draft',        variant: 'outline',     className: 'text-muted-foreground' },
  SUBMITTED:    { label: 'Submitted',    variant: 'secondary',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'secondary',   className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  APPROVED:     { label: 'Approved',     variant: 'secondary',   className: 'bg-green-100 text-green-800 border-green-200' },
  REJECTED:     { label: 'Rejected',     variant: 'destructive', className: '' },
  ON_HOLD:      { label: 'On Hold',      variant: 'secondary',   className: 'bg-orange-100 text-orange-800 border-orange-200' },
};

interface StatusBadgeProps {
  status: ProjectStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
