import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Priority } from '@/types';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW:      { label: 'Low',      className: 'bg-slate-50 text-slate-600 border-slate-200' },
  MEDIUM:   { label: 'Medium',   className: 'bg-sky-50 text-sky-700 border-sky-200' },
  HIGH:     { label: 'High',     className: 'bg-orange-50 text-orange-700 border-orange-200' },
  CRITICAL: { label: 'Critical', className: 'bg-red-50 text-red-700 border-red-200 font-semibold' },
};

interface PriorityChipProps {
  priority: Priority;
  className?: string;
}

export function PriorityChip({ priority, className }: PriorityChipProps) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
