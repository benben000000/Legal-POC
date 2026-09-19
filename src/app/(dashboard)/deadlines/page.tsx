import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';

export default async function DeadlinesPage() {
  const user = await requireAuth();

  const where = user.role === 'LEAD_ATTORNEY' ? {} : {
    matter: {
      OR: [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
  };

  const deadlines = await prisma.deadline.findMany({
    where,
    include: {
      matter: { select: { caseTitle: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deadlines & Hearings"
        description="Upcoming court dates, filings, and deadlines across all your matters."
      />

      <Card>
        {deadlines.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines.map((deadline) => (
                <TableRow key={deadline.id}>
                  <TableCell className="font-medium text-gray-900">
                    {deadline.title}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {deadline.matter.caseTitle}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {format(deadline.dueDate, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        deadline.isCompleted ? 'success' : 
                        new Date(deadline.dueDate) < new Date() ? 'error' : 'warning'
                      }
                    >
                      {deadline.isCompleted ? 'Completed' : (new Date(deadline.dueDate) < new Date() ? 'Overdue' : 'Pending')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No deadlines found"
            description="You don't have any upcoming deadlines."
          />
        )}
      </Card>
    </div>
  );
}
