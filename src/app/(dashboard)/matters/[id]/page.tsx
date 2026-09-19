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
    id: matter.id,
    caseTitle: matter.caseTitle,
    docketNumber: matter.docketNumber,
    courtBranch: matter.courtBranch,
    presidingJudge: matter.presidingJudge,
    opposingCounsel: matter.opposingCounsel,
    clientName: matter.clientName,
    clientEmail: matter.clientEmail,
    clientPhone: matter.clientPhone,
    clientAddress: matter.clientAddress,
    status: matter.status,
    priority: matter.priority,
    caseType: matter.caseType,
    openedAt: matter.openedAt.toISOString(),
    createdAt: matter.createdAt.toISOString(),
    updatedAt: matter.updatedAt.toISOString(),
    createdBy: {
      id: matter.createdBy.id,
      firstName: matter.createdBy.firstName,
      lastName: matter.createdBy.lastName,
      email: matter.createdBy.email,
    },
    members: matter.members.map((m) => ({
      id: m.id,
      role: m.role,
      user: {
        id: m.user.id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
        role: m.user.role,
      },
    })),
    deadlines: matter.deadlines.map((d) => ({
      id: d.id,
      title: d.title,
      periodDays: d.periodDays,
      dueDate: d.dueDate.toISOString(),
      triggerDate: d.triggerDate.toISOString(),
      isCompleted: d.isCompleted,
      urgencyLevel: d.urgencyLevel,
    })),
    tasks: matter.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      assignee: t.assignee
        ? { firstName: t.assignee.firstName, lastName: t.assignee.lastName }
        : null,
    })),
    documents: matter.documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      createdAt: doc.createdAt.toISOString(),
    })),
    billingEntries: matter.billingEntries.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      billingType: b.billingType,
      amount: b.amount.toNumber(),
      hours: b.hours ? b.hours.toNumber() : null,
      hourlyRate: b.hourlyRate ? b.hourlyRate.toNumber() : null,
      paymentStatus: b.paymentStatus,
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
