import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';

export default async function DashboardPage() {
  const user = await requireAuth();

  const mattersWhere = user.role === 'LEAD_ATTORNEY' ? {} : {
    OR: [
      { createdById: user.id },
      { members: { some: { userId: user.id } } },
    ],
  };

  // Metrics query
  const [activeMattersCount, totalTasksCount, pendingDeadlinesCount, recentMatters, upcomingDeadlines] = await Promise.all([
    prisma.matter.count({ where: { ...mattersWhere, status: { not: 'ARCHIVED' } } }),
    prisma.task.count({ where: { status: { not: 'COMPLETED_FILED' } } }),
    prisma.deadline.count({ where: { isCompleted: false } }),
    prisma.matter.findMany({
      where: mattersWhere,
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.deadline.findMany({
      where: {
        isCompleted: false,
      },
      include: {
        matter: { select: { caseTitle: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard"
        description={`Welcome back, ${user.firstName} ${user.lastName}. Here is an overview of active matters and court deadlines.`}
        action={
          <div className="flex space-x-2">
            <Link href="/matters/new">
              <Button variant="primary" size="sm">
                New Matter
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Metric Cards — compliant with GEMINI.md: rounded-[4px], border-gray-200, shadow-none */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-gray-200 rounded-[4px] p-4 shadow-none">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Matters</span>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">{activeMattersCount}</span>
            <span className="ml-2 text-xs text-gray-500">cases</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-[4px] p-4 shadow-none">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Tasks</span>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">{totalTasksCount}</span>
            <span className="ml-2 text-xs text-gray-500">in progress</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-[4px] p-4 shadow-none">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Deadlines</span>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">{pendingDeadlinesCount}</span>
            <span className="ml-2 text-xs text-gray-500">cutoffs</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-[4px] p-4 shadow-none">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">E-Filing Status</span>
          <div className="mt-2 flex items-baseline">
            <span className="text-sm font-medium text-green-700">Online</span>
            <span className="ml-2 text-xs text-gray-500">Supreme Court</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Matters */}
        <Card>
          <CardHeader>
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
                  description="You don't have any matters registered yet."
                  action={
                    user.role === 'LEAD_ATTORNEY' ? (
                      <Link href="/matters/new">
                        <Button size="sm">Create Matter</Button>
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
          <CardHeader>
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
                  description="All court deadlines are up to date."
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
