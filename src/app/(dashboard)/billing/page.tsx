import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';

export default async function BillingPage() {
  const user = await requireAuth();

  // Redirect or show access denied if staff
  if (user.role === 'STAFF') {
     return (
       <div className="p-6 text-center">
         <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
         <p className="mt-2 text-gray-600">Staff members do not have access to billing information.</p>
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Entries"
        description="Track time and expenses across matters."
      />

      <Card>
        {entries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.title}</TableCell>
                  <TableCell className="text-gray-600">
                    {format(entry.datePerformed, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {entry.matter.caseTitle}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {entry.description}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {entry.billingType.includes('FEE') ? (
                      entry.hours ? `${entry.hours.toString()} hrs` : '-'
                    ) : (
                      entry.billingType
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(entry.amount.toNumber())}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        entry.paymentStatus === 'PAID' ? 'success' : 
                        entry.paymentStatus === 'BILLED' ? 'info' : 'warning'
                      }
                    >
                      {entry.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No billing entries"
            description="No time or expenses have been recorded yet."
          />
        )}
      </Card>
    </div>
  );
}
