'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InviteModal } from '@/components/team/invite-modal';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface TeamClientProps {
  users: UserData[];
  currentUserId: string;
}

export function TeamClient({ users, currentUserId }: TeamClientProps) {
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (user: UserData) => {
    if (user.id === currentUserId) return;
    setLoadingId(user.id);

    try {
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update user status');
        return;
      }

      router.refresh();
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team & Seat Management"
        description="Manage attorney and staff accounts, invitations, and access permissions."
        action={
          <Button onClick={() => setIsInviteOpen(true)}>
            Invite Team Member
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isCurrentUser = u.id === currentUserId;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-gray-900">
                    {u.firstName} {u.lastName} {isCurrentUser && <span className="text-xs text-gray-500 font-normal">(You)</span>}
                  </TableCell>
                  <TableCell className="text-gray-600">{u.email}</TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-gray-700">
                      {u.role === 'LEAD_ATTORNEY' ? 'Lead Attorney' : u.role === 'ASSOCIATE' ? 'Associate' : 'Staff'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isCurrentUser && (
                      <Button
                        variant={u.isActive ? 'secondary' : 'primary'}
                        size="sm"
                        disabled={loadingId === u.id}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {loadingId === u.id
                          ? 'Updating...'
                          : u.isActive
                          ? 'Deactivate'
                          : 'Reactivate'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
