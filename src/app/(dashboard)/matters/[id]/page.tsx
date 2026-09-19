import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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
      members: {
        include: { user: { select: { firstName: true, lastName: true } } }
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!matter) {
    notFound();
  }

  // Authorization Check
  const isMember = matter.members.some(m => m.userId === user.id);
  if (user.role !== 'LEAD_ATTORNEY' && !isMember && matter.createdById !== user.id) {
     return (
       <div className="p-6 text-center">
         <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
         <p className="mt-2 text-gray-600">You do not have permission to view this matter.</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link href="/matters" className="text-sm font-medium text-blue-600 hover:underline">
          &larr; Back to matters
        </Link>
      </div>

      <PageHeader
        title={matter.caseTitle}
        description={`Docket: ${matter.docketNumber || 'N/A'}`}
        action={
          <div className="flex space-x-3">
             {/* Edit capability requires client components, mocked out for now */}
             <Button variant="secondary">Edit Matter</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Badge 
                      variant={
                        matter.status === 'ACTIVE' || matter.status === 'FOR_PLEADING' ? 'success' : 
                        matter.status === 'ARCHIVED' ? 'neutral' : 'warning'
                      }
                    >
                      {matter.status}
                    </Badge>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1 text-sm text-gray-900">{matter.priority}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Client Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{matter.clientName}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Court Branch</dt>
                  <dd className="mt-1 text-sm text-gray-900">{matter.courtBranch}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
          
          {/* Placeholder for related modules */}
          <Card>
             <CardHeader>
               <CardTitle>Deadlines & Tasks</CardTitle>
             </CardHeader>
             <CardBody>
               <p className="text-sm text-gray-500 text-center py-4">Deadlines and tasks will appear here.</p>
             </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</h4>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {matter.members.length > 0 ? matter.members.map(m => `${m.user.firstName} ${m.user.lastName}`).join(', ') : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {matter.createdBy.firstName} {matter.createdBy.lastName}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
