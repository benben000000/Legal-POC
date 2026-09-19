import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const user = await requireAuth();

  const mattersWhere = user.role === 'LEAD_ATTORNEY' ? {} : {
    OR: [
      { createdById: user.id },
      { members: { some: { userId: user.id } } },
    ],
  };

  // Fetch recent matters the user has access to
  const recentMatters = await prisma.matter.findMany({
    where: mattersWhere,
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  const deadlinesWhere = user.role === 'LEAD_ATTORNEY' ? {} : {
    matter: {
      OR: [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
  };

  // Fetch upcoming deadlines
  const upcomingDeadlines = await prisma.deadline.findMany({
    where: {
      ...deadlinesWhere,
      dueDate: {
        gte: new Date(),
      },
      isCompleted: false,
    },
    include: {
      matter: {
        select: { caseTitle: true },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Welcome back, ${user.firstName}`}
        description="Here is an overview of your active matters and upcoming deadlines."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Matters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Matters</CardTitle>
            <Link href="/matters" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {recentMatters.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMatters.map((matter) => (
                    <TableRow key={matter.id}>
                      <TableCell className="font-medium text-gray-900">
                        <Link href={`/matters/${matter.id}`} className="hover:underline">
                          {matter.caseTitle}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            matter.status === 'ACTIVE' || matter.status === 'FOR_PLEADING' ? 'success' : 
                            matter.status === 'ARCHIVED' ? 'neutral' : 'warning'
                          }
                        >
                          {matter.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {format(matter.updatedAt, 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No active matters"
                  description="You don't have any matters assigned to you yet."
                  action={
                    user.role === 'LEAD_ATTORNEY' ? (
                      <Link href="/matters/new" className="inline-flex items-center justify-center font-medium transition-colors duration-100 rounded-[4px] bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm">
                        Create Matter
                      </Link>
                    ) : undefined
                  }
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Link href="/deadlines" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {upcomingDeadlines.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Matter</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingDeadlines.map((deadline) => (
                    <TableRow key={deadline.id}>
                      <TableCell className="font-medium text-gray-900">
                        {deadline.title}
                      </TableCell>
                      <TableCell className="text-gray-500 truncate max-w-[150px]">
                        {deadline.matter.caseTitle}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {format(deadline.dueDate, 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No upcoming deadlines"
                  description="You're all caught up!"
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
