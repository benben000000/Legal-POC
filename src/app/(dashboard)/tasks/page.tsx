import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TasksClient } from './tasks-client';

export default async function TasksPage() {
  const user = await requireAuth();

  // Fetch all active firm tasks so the team operates as a synchronized cogwheel
  const [tasks, matters, allUsers] = await Promise.all([
    prisma.task.findMany({
      include: {
        matter: { select: { caseTitle: true } },
        assignee: { select: { firstName: true, lastName: true, role: true } },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.matter.findMany({
      where: { status: { not: 'ARCHIVED' } },
      select: { id: true, caseTitle: true },
      orderBy: { caseTitle: 'asc' },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, role: true },
      orderBy: { firstName: 'asc' },
    }),
  ]);

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as any,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    matterId: t.matterId,
    assigneeId: t.assigneeId,
    matter: { caseTitle: t.matter.caseTitle },
    assignee: t.assignee
      ? {
          firstName: t.assignee.firstName,
          lastName: t.assignee.lastName,
          role: t.assignee.role,
        }
      : null,
  }));

  const userOptions = allUsers.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    role: u.role,
  }));

  return (
    <TasksClient
      tasks={serializedTasks}
      matters={matters}
      users={userOptions}
      currentUserId={user.id}
      currentUserRole={user.role}
    />
  );
}
