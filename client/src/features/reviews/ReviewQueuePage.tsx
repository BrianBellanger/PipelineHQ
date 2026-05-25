import { useNavigate } from 'react-router-dom';
import { useReviewQueue } from './hooks/useReviewQueue';
import { StatusBadge } from '@/components/data/StatusBadge';
import { PriorityChip } from '@/components/data/PriorityChip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ReviewQueuePage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useReviewQueue();

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Projects awaiting your review ({projects.length})
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-md border p-12 text-center">
          <p className="text-sm text-muted-foreground">No projects pending your review.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Submitted by</TableHead>
                <TableHead>Due date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityChip priority={project.priority} />
                  </TableCell>
                  <TableCell>{project.department.name}</TableCell>
                  <TableCell>{project.requestedBy.name}</TableCell>
                  <TableCell>
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString()
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
