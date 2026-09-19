import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';

export default async function MattersPage() {
  const user = await requireAuth();

  const where = user.role === 'LEAD_ATTORNEY' ? {} : {
    OR: [
      { createdById: user.id },
      { members: { some: { userId: user.id } } },
    ],
  };

  const matters = await prisma.matter.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matters"
        description="Manage your legal cases and matters."
        action={
          user.role !== 'STAFF' && (
            <Link href="/matters/new" className="inline-flex items-center justify-center font-medium transition-colors duration-100 rounded-[4px] bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm">
              New Matter
            </Link>
          )
        }
      />

      <Card>
        {matters.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Title</TableHead>
                <TableHead>Docket Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matters.map((matter) => (
                <TableRow key={matter.id}>
                  <TableCell className="font-medium">
                    <Link href={`/matters/${matter.id}`} className="text-blue-600 hover:underline">
                      {matter.caseTitle}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {matter.docketNumber || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        matter.status === 'ACTIVE' || matter.status === 'FOR_PLEADING' ? 'success' : 
                        matter.status === 'ARCHIVED' ? 'neutral' : 'warning'
                      }
                    >
                      {matter.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {matter.priority}
                  </TableCell>
                  <TableCell>
                    <Link href={`/matters/${matter.id}`} className="text-sm text-blue-600 hover:underline">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No matters found"
            description="Get started by creating a new matter."
            action={
              user.role !== 'STAFF' && (
                <Link href="/matters/new" className="inline-flex items-center justify-center font-medium transition-colors duration-100 rounded-[4px] bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm">
                  New Matter
                </Link>
              )
            }
          />
        )}
      </Card>
    </div>
  );
}
