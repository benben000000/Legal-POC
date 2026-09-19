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
        title={`Chambers Overview`}
        description={`Welcome, Atty. ${user.firstName} ${user.lastName} (${user.role.replace('_', ' ')}). Practice telemetry and active docket.`}
        action={
          <div className="flex gap-2">
            <Link href="/tasks">
              <Button variant="secondary" size="sm">
                Open Kanban
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Matters</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Cases</span>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{activeMattersCount}</span>
            <span className="ml-2 text-xs text-slate-500">in jurisdiction</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Workflow Tasks</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Kanban</span>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{totalTasksCount}</span>
            <span className="ml-2 text-xs text-slate-500">in progress/review</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Deadlines</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">Rules of Court</span>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{pendingDeadlinesCount}</span>
            <span className="ml-2 text-xs text-slate-500">cutoffs pending</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Supreme Court E-Filing</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Active</span>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-sm font-semibold text-emerald-700">Connected</span>
            <span className="ml-2 text-xs text-slate-500">Judicial e-filing sync</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Matters */}
        <Card>
          <CardHeader>
            <CardTitle>Active Matters</CardTitle>
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
                      <TableCell className="font-semibold text-slate-900">
                        <Link href={`/matters/${matter.id}`} className="hover:text-blue-600 hover:underline">
                          {matter.caseTitle}
                        </Link>
                        {matter.docketNumber && (
                          <span className="block text-[11px] text-slate-400 font-mono">
                            {matter.docketNumber}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            matter.status === 'ACTIVE' || matter.status === 'FOR_PLEADING' ? 'success' : 
                            matter.status === 'ARCHIVED' ? 'neutral' : 'warning'
                          }
                        >
                          {matter.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
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
            <CardTitle>Procedural Court Cutoffs</CardTitle>
            <Link href="/deadlines" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              View calendar &rarr;
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {upcomingDeadlines.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deadline Title</TableHead>
                    <TableHead>Case</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingDeadlines.map((deadline) => (
                    <TableRow key={deadline.id}>
                      <TableCell className="font-medium text-slate-900">
                        {deadline.title}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 truncate max-w-[160px]">
                        {deadline.matter.caseTitle}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700">
                        {format(deadline.dueDate, 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No upcoming court cutoffs"
                  description="All deadlines are completed or up to date."
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
