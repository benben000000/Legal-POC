import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MattersClient } from './matters-client';

export default async function MattersPage() {
  const user = await requireAuth();

  const where = { status: { not: 'ARCHIVED' as const } };

  const matters = await prisma.matter.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });

  const serializedMatters = matters.map((m) => ({
    id: m.id,
    caseTitle: m.caseTitle,
    docketNumber: m.docketNumber,
    courtBranch: m.courtBranch,
    presidingJudge: m.presidingJudge,
    clientName: m.clientName,
    status: m.status,
    priority: m.priority,
    caseType: m.caseType,
    updatedAt: m.updatedAt.toISOString(),
    openedAt: m.openedAt.toISOString(),
  }));

  return (
    <MattersClient
      matters={serializedMatters}
      userRole={user.role}
    />
  );
}
