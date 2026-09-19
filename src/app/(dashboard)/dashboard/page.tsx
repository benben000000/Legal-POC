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

  const mattersWhere = { status: { not: 'ARCHIVED' as const } };

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
          <div className="flex items-center space-x-2">
            <Link href="/tasks">
              <Button variant="secondary" size="sm">
                Kanban Tasks
              </Button>
            </Link>
            <Link href="/matters/new">
              <Button variant="primary" size="sm">
                + New Matter
              </Button>
            </Link>
          </div>
        }
      />

      {/* Modern KPI Metric Cards with rounded-xl and subtle shadow-xs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-gray-300 hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Matters</span>
            <span className="text-[11px] font-medium text-gray-400">Civil &amp; Criminal</span>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{activeMattersCount}</span>
            <span className="ml-2 text-xs text-gray-500">in jurisdiction</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-gray-300 hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Tasks</span>
            <span className="text-[11px] font-medium text-gray-400">This Week</span>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{totalTasksCount}</span>
            <span className="ml-2 text-xs text-gray-500">in progress</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-gray-300 hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Deadlines</span>
            <span className="text-[11px] font-medium text-gray-400">Court Rules</span>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{pendingDeadlinesCount}</span>
            <span className="ml-2 text-xs text-gray-500">cutoffs</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-gray-300 hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">E-Filing Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Operational
            </span>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-sm font-semibold text-gray-900">Connected</span>
            <span className="ml-2 text-xs text-gray-500">Supreme Court</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Matters */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Matters</CardTitle>
            <Link href="/matters" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              View all matters &rarr;
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
                      <TableCell className="font-semibold text-gray-900">
                        <Link href={`/matters/${matter.id}`} className="hover:text-blue-600 hover:underline">
                          {matter.caseTitle}
                        </Link>
                        {matter.docketNumber && (
                          <span className="block text-[11px] text-gray-400 font-mono">
                            {matter.docketNumber}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              matter.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : matter.status === 'FOR_PLEADING'
                                ? 'bg-blue-500'
                                : matter.status === 'UNDER_SUBMISSION'
                                ? 'bg-amber-500'
                                : matter.status === 'PROMULGATED'
                                ? 'bg-purple-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          <span>
                            {matter.status === 'ACTIVE'
                              ? 'Active'
                              : matter.status === 'FOR_PLEADING'
                              ? 'For Pleading'
                              : matter.status === 'UNDER_SUBMISSION'
                              ? 'Under Submission'
                              : matter.status === 'PROMULGATED'
                              ? 'Promulgated'
                              : matter.status === 'ARCHIVED'
                              ? 'Archived'
                              : String(matter.status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
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
            <Link href="/deadlines" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              View calendar &rarr;
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
                      <TableCell className="text-xs text-gray-500 truncate max-w-[160px]">
                        {deadline.matter.caseTitle}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-gray-700">
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
