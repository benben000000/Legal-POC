import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { SOAClient } from './soa-client';

export default async function SOARoutePage({
  params,
}: {
  params: Promise<{ matterId: string }>;
}) {
  const user = await requireAuth();
  const { matterId } = await params;

  if (user.role === 'STAFF') {
    return (
      <div className="p-8 text-center text-red-600 font-medium">
        Access Denied. Staff members cannot access financial billing statements.
      </div>
    );
  }

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: {
      billingEntries: {
        where: { paymentStatus: 'UNBILLED' },
        orderBy: { datePerformed: 'asc' },
      },
      members: true,
    },
  });

  if (!matter) {
    notFound();
  }

  // Auth check
  if (user.role !== 'LEAD_ATTORNEY' && matter.createdById !== user.id) {
    const isMember = matter.members.some((m) => m.userId === user.id);
    if (!isMember) {
      return <div className="p-8 text-center text-red-600">Access Denied</div>;
    }
  }

  const serializedMatter = {
    id: matter.id,
    caseTitle: matter.caseTitle,
    docketNumber: matter.docketNumber,
    courtBranch: matter.courtBranch,
    clientName: matter.clientName,
    clientAddress: matter.clientAddress,
    clientEmail: matter.clientEmail,
    clientPhone: matter.clientPhone,
    billingEntries: matter.billingEntries.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      billingType: b.billingType,
      amount: b.amount.toNumber(),
      hours: b.hours ? b.hours.toNumber() : null,
      hourlyRate: b.hourlyRate ? b.hourlyRate.toNumber() : null,
      datePerformed: b.datePerformed.toISOString(),
    })),
  };

  return <SOAClient matter={serializedMatter} />;
}
