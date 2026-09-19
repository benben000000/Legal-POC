import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';

export default async function DocumentsPage() {
  const user = await requireAuth();

  const documents = await prisma.document.findMany({
    where: user.role === 'LEAD_ATTORNEY' ? {} : {
      matter: {
        OR: [
          { createdById: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    },
    include: {
      matter: { select: { caseTitle: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="All files and documents uploaded to matters you have access to."
      />

      <Card>
        {documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-blue-600 hover:underline cursor-pointer">
                    {/* In a real app, this would link to download or preview */}
                    {doc.title}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {doc.matter.caseTitle}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {doc.uploadedBy}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {format(doc.createdAt, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No documents found"
            description="There are no documents uploaded yet."
          />
        )}
      </Card>
    </div>
  );
}
