import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MatterDetailClient } from './matter-detail-client';

export default async function MatterDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const matter = await prisma.matter.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
        },
      },
      deadlines: {
        orderBy: { dueDate: 'asc' },
      },
      tasks: {
        orderBy: { dueDate: 'asc' },
        include: {
          assignee: { select: { firstName: true, lastName: true } },
        },
      },
      documents: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      },
      billingEntries: {
        orderBy: { datePerformed: 'desc' },
      },
    },
  });

  if (!matter) {
    notFound();
  }

  // Authorization Check
  const isMember = matter.members.some((m) => m.userId === user.id);
  if (user.role !== 'LEAD_ATTORNEY' && !isMember && matter.createdById !== user.id) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-2 text-gray-600">You do not have permission to view this matter.</p>
      </div>
    );
  }

  // Available users for assignment
  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, role: true },
    orderBy: { firstName: 'asc' },
  });

  const availableUsers = allUsers.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    role: u.role,
  }));

  const serializedMatter = {
    ...matter,
    openedAt: matter.openedAt.toISOString(),
    createdAt: matter.createdAt.toISOString(),
    updatedAt: matter.updatedAt.toISOString(),
    deadlines: matter.deadlines.map((d) => ({
      ...d,
      dueDate: d.dueDate.toISOString(),
      triggerDate: d.triggerDate.toISOString(),
    })),
    tasks: matter.tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
    })),
    documents: matter.documents.map((doc) => ({
      ...doc,
      createdAt: doc.createdAt.toISOString(),
    })),
    billingEntries: matter.billingEntries.map((b) => ({
      ...b,
      amount: b.amount.toNumber(),
      hours: b.hours ? b.hours.toNumber() : null,
      datePerformed: b.datePerformed.toISOString(),
    })),
  };

  return (
    <MatterDetailClient
      matter={serializedMatter}
      availableUsers={availableUsers}
      currentUserId={user.id}
      userRole={user.role}
    />
  );
}
