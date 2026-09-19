import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TasksClient } from './tasks-client';

export default async function TasksPage() {
  const user = await requireAuth();

  const where: any = {};
  if (user.role !== 'LEAD_ATTORNEY') {
    where.OR = [
      { assigneeId: user.id },
      { assignedById: user.id },
      { matter: { createdById: user.id } },
      { matter: { members: { some: { userId: user.id } } } },
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

  const matters = await prisma.matter.findMany({
    where: user.role === 'LEAD_ATTORNEY' ? {} : {
      OR: [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    select: { id: true, caseTitle: true },
    orderBy: { caseTitle: 'asc' },
  });

  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, role: true },
    orderBy: { firstName: 'asc' },
  });

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as any,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    matterId: t.matterId,
    matter: { caseTitle: t.matter.caseTitle },
    assignee: t.assignee ? { firstName: t.assignee.firstName, lastName: t.assignee.lastName } : null,
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
    />
  );
}
