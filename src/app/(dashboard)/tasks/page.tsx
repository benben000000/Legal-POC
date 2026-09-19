import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';

export default async function TasksPage() {
  const user = await requireAuth();

  const where: any = {};
  if (user.role !== 'LEAD_ATTORNEY') {
     where.OR = [
       { assignedToId: user.id },
       { createdById: user.id },
       { matter: { createdById: user.id } },
       { matter: { assignedToId: user.id } },
     ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      matter: { select: { caseTitle: true } },
      assignee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage your assigned tasks and track progress."
      />

      <Card>
        {tasks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium text-gray-900">
                    {task.title}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {task.matter.caseTitle}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {task.dueDate ? format(task.dueDate, 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{task.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        task.status === 'COMPLETED_FILED' ? 'success' : 
                        task.status === 'IN_PROGRESS' || task.status === 'FOR_ATTORNEY_REVIEW' ? 'info' : 'neutral'
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No tasks found"
            description="You don't have any pending tasks."
          />
        )}
      </Card>
    </div>
  );
}
