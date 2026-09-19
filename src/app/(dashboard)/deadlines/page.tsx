import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DeadlinesClient } from './deadlines-client';

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

  const serializedDeadlines = deadlines.map((d) => ({
    id: d.id,
    title: d.title,
    periodDays: d.periodDays,
    dueDate: d.dueDate.toISOString(),
    isCompleted: d.isCompleted,
    urgencyLevel: d.urgencyLevel,
    matterId: d.matterId,
    matter: { caseTitle: d.matter.caseTitle },
  }));

  return (
    <DeadlinesClient
      deadlines={serializedDeadlines}
      matters={matters}
      userRole={user.role}
    />
  );
}
