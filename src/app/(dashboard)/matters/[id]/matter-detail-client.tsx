'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface UserOption {
  id: string;
  name: string;
  role: string;
}

interface MatterDetailProps {
  matter: any;
  availableUsers: UserOption[];
  currentUserId: string;
  userRole: string;
}

function formatStatus(status: string) {
  switch (status) {
    case 'ACTIVE': return 'Active';
    case 'FOR_PLEADING': return 'For Pleading';
    case 'UNDER_SUBMISSION': return 'Under Submission';
    case 'PROMULGATED': return 'Promulgated';
    case 'ARCHIVED': return 'Archived';
    default: return status ? status.replace(/_/g, ' ') : '';
  }
}

function formatTaskStatus(status: string) {
  switch (status) {
    case 'TODO': return 'To Do';
    case 'IN_PROGRESS': return 'In Progress';
    case 'FOR_ATTORNEY_REVIEW': return 'Attorney Review';
    case 'COMPLETED_FILED': return 'Completed';
    default: return status ? status.replace(/_/g, ' ') : '';
  }
}

export function MatterDetailClient({
  matter,
  availableUsers,
  currentUserId,
  userRole,
}: MatterDetailProps) {
  const router = useRouter();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(availableUsers[0]?.id || '');
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');

  const isLead = userRole === 'LEAD_ATTORNEY';

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsAssigning(true);
    setError('');

    try {
      const res = await fetch(`/api/matters/${matter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: selectedUserId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to assign team member');
      }

      setIsAssignModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href="/matters" className="text-sm font-medium text-blue-600 hover:underline">
          &larr; Back to matters
        </Link>
      </div>

      <PageHeader
        title={matter.caseTitle}
        description={`Docket No: ${matter.docketNumber || 'Unassigned'} | Branch: ${matter.courtBranch}`}
        action={
          <div className="flex space-x-2">
            <Link
              href={`/billing/soa/${matter.id}`}
              className="inline-flex items-center justify-center font-medium transition-colors duration-100 rounded-[4px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 text-sm"
            >
              Generate Statement (SOA)
            </Link>
            {isLead && (
              <Button variant="primary" onClick={() => setIsAssignModalOpen(true)}>
                Assign Member
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Information, Deadlines, Tasks, Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Information */}
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          matter.status === 'ACTIVE'
                            ? 'bg-emerald-500'
                            : matter.status === 'FOR_PLEADING'
                            ? 'bg-blue-500'
                            : matter.status === 'UNDER_SUBMISSION'
                            ? 'bg-amber-500'
                            : matter.status === 'PROMULGATED'
                            ? 'bg-purple-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      {formatStatus(matter.status)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Priority</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{matter.priority}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Client Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{matter.clientName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Client Contact</dt>
                  <dd className="mt-1 text-sm text-gray-900">{matter.clientPhone || matter.clientEmail || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Court Branch</dt>
                  <dd className="mt-1 text-sm text-gray-900">{matter.courtBranch}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Date Opened</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(matter.openedAt), 'MMM d, yyyy')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Presiding Judge</dt>
                  <dd className="mt-1 text-sm text-gray-900">{matter.presidingJudge || 'Not Specified'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Docket / Civil Case No.</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{matter.docketNumber || 'Unassigned'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Assigned Team</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">
                    {matter.members && matter.members.length > 0 
                      ? matter.members.map((m: any) => `${m.user.firstName} ${m.user.lastName}`).join(', ')
                      : 'Lead Attorney Sole Counsel'}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Procedural Deadlines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Deadlines &amp; Appearances ({matter.deadlines?.length || 0})</CardTitle>
              <Link href="/deadlines" className="text-xs font-medium text-blue-600 hover:underline">
                View all deadlines
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {matter.deadlines && matter.deadlines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.deadlines.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium text-gray-900">{d.title}</TableCell>
                        <TableCell className="text-gray-600">
                          {format(new Date(d.dueDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                d.isCompleted
                                  ? 'bg-emerald-500'
                                  : new Date(d.dueDate) < new Date()
                                  ? 'bg-rose-500'
                                  : d.urgencyLevel === 'CRITICAL'
                                  ? 'bg-rose-500'
                                  : d.urgencyLevel === 'UPCOMING'
                                  ? 'bg-amber-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                            <span>
                              {d.isCompleted
                                ? 'Completed'
                                : new Date(d.dueDate) < new Date()
                                ? 'Overdue'
                                : d.urgencyLevel === 'UPCOMING'
                                ? 'Upcoming'
                                : d.urgencyLevel === 'CRITICAL'
                                ? 'Critical'
                                : 'Scheduled'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-xs text-gray-500 text-center">No deadlines scheduled for this case.</p>
              )}
            </CardBody>
          </Card>

          {/* Active Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Case Tasks ({matter.tasks?.length || 0})</CardTitle>
              <Link href="/tasks" className="text-xs font-medium text-blue-600 hover:underline">
                View workflow board
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {matter.tasks && matter.tasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.tasks.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-gray-900">{t.title}</TableCell>
                        <TableCell className="text-gray-600">
                          {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned'}
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs">{t.priority}</TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                t.status === 'COMPLETED_FILED'
                                  ? 'bg-emerald-500'
                                  : t.status === 'FOR_ATTORNEY_REVIEW'
                                  ? 'bg-amber-500'
                                  : t.status === 'IN_PROGRESS'
                                  ? 'bg-blue-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                            <span>{formatTaskStatus(t.status)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-xs text-gray-500 text-center">No tasks currently assigned to this matter.</p>
              )}
            </CardBody>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Document Vault ({matter.documents?.length || 0})</CardTitle>
              <Link href="/documents" className="text-xs font-medium text-blue-600 hover:underline">
                View vault
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {matter.documents && matter.documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.documents.map((doc: any) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium text-gray-900">{doc.title}</TableCell>
                        <TableCell className="text-gray-600 text-xs">{doc.category.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-gray-600 text-xs">
                          {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-xs text-gray-500 text-center">No documents uploaded to this matter yet.</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Assigned Team & Billing Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Team</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Attorney / Creator</h4>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {matter.createdBy.firstName} {matter.createdBy.lastName}
                </p>
                <p className="text-xs text-gray-500">{matter.createdBy.email}</p>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Allocated Members ({matter.members?.length || 0})
                  </h4>
                  {isLead && (
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      + Add
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  {matter.members && matter.members.length > 0 ? (
                    matter.members.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                        <span className="font-medium text-gray-800">
                          {m.user.firstName} {m.user.lastName}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {m.role === 'LEAD_ATTORNEY' ? 'Lead Attorney' : m.role === 'ASSOCIATE' ? 'Associate' : m.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">No associate attorneys allocated yet.</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Unbilled Fees Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Snapshot</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Recorded Entries:</span>
                <span className="font-medium text-gray-900">{matter.billingEntries?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Unbilled Total:</span>
                <span className="font-semibold text-blue-700">
                  {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
                    (matter.billingEntries || [])
                      .filter((b: any) => b.paymentStatus === 'UNBILLED')
                      .reduce((sum: number, b: any) => sum + Number(b.amount), 0)
                  )}
                </span>
              </div>
              <div className="pt-2">
                <Link
                  href={`/billing/soa/${matter.id}`}
                  className="w-full text-center block text-xs font-medium text-blue-600 hover:underline"
                >
                  View Statement of Account &rarr;
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Member Assignment Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Assign Member to Case</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleAssignMember}>
          <ModalBody className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <Select
              label="Select Team Member *"
              id="assign-user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              options={availableUsers.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.role.replace('_', ' ')})`,
              }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isAssigning}>
              Confirm Allocation
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
