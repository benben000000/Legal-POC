'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateEntryModal } from '@/components/billing/create-entry-modal';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BillingItem {
  id: string;
  title: string;
  description: string | null;
  billingType: string;
  amount: number;
  hours: number | null;
  hourlyRate: number | null;
  datePerformed: string;
  paymentStatus: string;
  matterId: string;
  matter: { caseTitle: string };
  user: { firstName: string; lastName: string } | null;
}

interface MatterOption {
  id: string;
  caseTitle: string;
}

interface BillingClientProps {
  entries: BillingItem[];
  matters: MatterOption[];
  userRole: string;
}

export function BillingClient({ entries, matters, userRole }: BillingClientProps) {
  const router = useRouter();
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const formatPHP = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  const totalUnbilled = entries
    .filter((e) => e.paymentStatus === 'UNBILLED')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalBilled = entries
    .filter((e) => e.paymentStatus === 'BILLED' || e.paymentStatus === 'PAID')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Accounting & Billing"
        description="Record court appearance fees, drafting retainers, and out-of-pocket disbursements."
        action={
          <Button onClick={() => setIsRecordOpen(true)}>
            Record Fee / Disbursement
          </Button>
        }
      />

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unbilled Balance</p>
            <p className="mt-1 text-2xl font-bold text-blue-700 font-mono">{formatPHP(totalUnbilled)}</p>
            <p className="text-[11px] text-gray-500 mt-1">Ready for Statement of Account (SOA)</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Billed / Settled</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 font-mono">{formatPHP(totalBilled)}</p>
            <p className="text-[11px] text-gray-500 mt-1">Invoiced across firm cases</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Recorded Entries</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 font-mono">{entries.length}</p>
            <p className="text-[11px] text-gray-500 mt-1">Time logs & expense items</p>
          </CardBody>
        </Card>
      </div>

      {/* Itemized Table */}
      <Card>
        {entries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service / Expense</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Statement (SOA)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium text-gray-900">
                    <div>
                      <p>{entry.title}</p>
                      {entry.hours && (
                        <p className="text-xs text-gray-500 font-mono">
                          {entry.hours} hrs @ {entry.hourlyRate ? formatPHP(entry.hourlyRate) : ''}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <Link href={`/matters/${entry.matterId}`} className="hover:underline text-blue-600">
                      {entry.matter.caseTitle}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs">
                    {entry.billingType.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs font-mono">
                    {format(new Date(entry.datePerformed), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-gray-900">
                    {formatPHP(entry.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          entry.paymentStatus === 'PAID'
                            ? 'bg-emerald-500'
                            : entry.paymentStatus === 'BILLED'
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span>
                        {entry.paymentStatus === 'PAID'
                          ? 'Paid'
                          : entry.paymentStatus === 'BILLED'
                          ? 'Billed'
                          : 'Unbilled / Pending'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/billing/soa/${entry.matterId}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Generate SOA &rarr;
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No billing entries recorded"
            description="Record appearance fees, drafting fees, and filing disbursements to track practice income."
            action={
              <Button onClick={() => setIsRecordOpen(true)}>
                Record First Entry
              </Button>
            }
          />
        )}
      </Card>

      <CreateEntryModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        matters={matters}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
