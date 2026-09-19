'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteModal({ isOpen, onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ASSOCIATE' | 'STAFF'>('ASSOCIATE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate invitation');
      }

      setInviteLink(data.inviteLink);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setEmail('');
    setRole('ASSOCIATE');
    setError('');
    setInviteLink('');
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset}>
      <ModalHeader>
        <ModalTitle>Invite Team Member</ModalTitle>
      </ModalHeader>

      <ModalBody>
        {inviteLink ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-600 p-4">
              <p className="text-sm font-medium text-green-800">
                Invitation link generated successfully!
              </p>
              <p className="mt-1 text-xs text-green-700">
                Provide this secure link to the invitee. It will expire in 48 hours.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Invitation Link</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-[4px] text-gray-900 focus:outline-none"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form id="invite-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Input
              label="Email Address"
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@lawfirm.com"
            />

            <Select
              label="Role Designation"
              id="invite-role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value as 'ASSOCIATE' | 'STAFF')}
              options={[
                { value: 'ASSOCIATE', label: 'Associate Attorney (Case work, drafting, court appearances)' },
                { value: 'STAFF', label: 'Staff / Paralegal (Disbursements, filing support)' },
              ]}
            />
          </form>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={handleReset} disabled={isLoading}>
          {inviteLink ? 'Done' : 'Cancel'}
        </Button>
        {!inviteLink && (
          <Button form="invite-form" type="submit" loading={isLoading}>
            Generate Invitation Link
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
