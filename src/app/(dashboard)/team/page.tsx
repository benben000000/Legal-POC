import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TeamClient } from './team-client';

export default async function TeamPage() {
  const currentUser = await requireRole('LEAD_ATTORNEY');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <TeamClient users={serializedUsers} currentUserId={currentUser.id} />;
}
