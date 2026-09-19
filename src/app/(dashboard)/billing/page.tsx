import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BillingClient } from './billing-client';

export default async function BillingPage() {
  const user = await requireAuth();

  // Redirect or show access denied if staff
  if (user.role === 'STAFF') {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded-[4px]">
        <h2 className="text-lg font-bold text-red-600">Access Restricted</h2>
        <p className="mt-2 text-sm text-gray-600">
          Staff accounts do not have permission to view firm financial and billing records.
        </p>
      </div>
    );
  }

  const where = user.role === 'LEAD_ATTORNEY' ? {} : {
    OR: [
      { user: { id: user.id } },
      { matter: { members: { some: { userId: user.id } } } },
      { matter: { createdById: user.id } },
    ],
  };

  const entries = await prisma.billingEntry.findMany({
    where,
    include: {
      matter: { select: { caseTitle: true } },
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { datePerformed: 'desc' },
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

  const serializedEntries = entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    billingType: entry.billingType,
    amount: entry.amount.toNumber(),
    hours: entry.hours ? entry.hours.toNumber() : null,
    hourlyRate: entry.hourlyRate ? entry.hourlyRate.toNumber() : null,
    datePerformed: entry.datePerformed.toISOString(),
    paymentStatus: entry.paymentStatus,
    matterId: entry.matterId,
    matter: { caseTitle: entry.matter.caseTitle },
    user: entry.user ? { firstName: entry.user.firstName, lastName: entry.user.lastName } : null,
  }));

  return (
    <BillingClient
      entries={serializedEntries}
      matters={matters}
      userRole={user.role}
    />
  );
}
