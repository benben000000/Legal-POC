'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateDeadlineModal } from '@/components/deadlines/create-deadline-modal';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DeadlineItem {
  id: string;
  title: string;
  periodDays: number;
  dueDate: string;
  isCompleted: boolean;
  urgencyLevel: string;
  matterId: string;
  matter: { caseTitle: string };
}

interface MatterOption {
  id: string;
  caseTitle: string;
}

interface DeadlinesClientProps {
  deadlines: DeadlineItem[];
  matters: MatterOption[];
  userRole: string;
}

export function DeadlinesClient({ deadlines, matters, userRole }: DeadlinesClientProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleCompletion = async (deadline: DeadlineItem) => {
    setTogglingId(deadline.id);
    try {
      const res = await fetch(`/api/deadlines/${deadline.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !deadline.isCompleted }),
      });

      if (!res.ok) {
        alert('Failed to update deadline status');
        return;
      }

      router.refresh();
    } catch {
      alert('Error updating deadline');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Court Calendaring & Deadlines"
        description="Reglementary periods, filing cutoffs, and scheduled hearings across firm matters."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            Add Deadline
          </Button>
        }
      />

      <Card>
        {deadlines.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deadline Title</TableHead>
                <TableHead>Associated Matter</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Filing Cutoff</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines.map((deadline) => {
                const isOverdue = !deadline.isCompleted && new Date(deadline.dueDate) < new Date();
                return (
                  <TableRow key={deadline.id}>
                    <TableCell className="font-medium text-gray-900">
                      {deadline.title}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <Link href={`/matters/${deadline.matterId}`} className="hover:underline text-blue-600">
                        {deadline.matter.caseTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs">
                      {deadline.periodDays ? `${deadline.periodDays} days` : 'Custom'}
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs font-mono">
                      {format(new Date(deadline.dueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deadline.isCompleted ? 'success' :
                          isOverdue ? 'error' :
                          deadline.urgencyLevel === 'CRITICAL' ? 'error' :
                          deadline.urgencyLevel === 'UPCOMING' ? 'warning' : 'neutral'
                        }
                      >
                        {deadline.isCompleted ? 'Completed' : isOverdue ? 'Overdue' : deadline.urgencyLevel.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={deadline.isCompleted ? 'secondary' : 'primary'}
                        size="sm"
                        disabled={togglingId === deadline.id}
                        onClick={() => handleToggleCompletion(deadline)}
                      >
                        {togglingId === deadline.id
                          ? '...'
                          : deadline.isCompleted
                          ? 'Mark Pending'
                          : 'Mark Completed'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No upcoming court deadlines"
            description="Keep your firm on schedule by recording court notices and filing periods."
            action={
              <Button onClick={() => setIsCreateOpen(true)}>
                Record First Deadline
              </Button>
            }
          />
        )}
      </Card>

      <CreateDeadlineModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        matters={matters}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
