import { Badge } from '@/components/ui/badge';
import type { Priority } from '@/types';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW:      { label: 'Low',      className: 'bg-slate-100 text-slate-700 border-slate-200' },
  MEDIUM:   { label: 'Medium',   className: 'bg-blue-100 text-blue-700 border-blue-200' },
  HIGH:     { label: 'High',     className: 'bg-orange-100 text-orange-700 border-orange-200' },
  CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-300' },
};

interface PriorityChipProps {
  priority: Priority;
}

export function PriorityChip({ priority }: PriorityChipProps) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
