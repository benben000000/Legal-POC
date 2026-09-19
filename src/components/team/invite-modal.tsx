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

function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Manila',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function InviteModal({ isOpen, onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ASSOCIATE' | 'STAFF'>('ASSOCIATE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteResult, setInviteResult] = useState<{
    inviteLink: string;
    emailSent: boolean;
    expiresAt?: string;
    message?: string;
  } | null>(null);
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

      setInviteResult({
        inviteLink: data.inviteLink,
        emailSent: Boolean(data.emailSent),
        expiresAt: data.expiresAt,
        message: data.message,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteResult?.inviteLink) return;
    await navigator.clipboard.writeText(inviteResult.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setEmail('');
    setRole('ASSOCIATE');
    setError('');
    setInviteResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset}>
      <ModalHeader>
        <ModalTitle>Invite Team Member</ModalTitle>
      </ModalHeader>

      <ModalBody>
        {inviteResult ? (
          <div className="space-y-4">
            {inviteResult.emailSent ? (
              <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-emerald-900">
                      Invitation email dispatched!
                    </p>
                    <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                      A real invitation email with account activation instructions was delivered to{' '}
                      <strong>{email}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-blue-900">
                      Invitation Created Successfully
                    </p>
                    <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                      {inviteResult.message || 'Provide the direct invitation link below to the team member.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-0.5">
              <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Strict 48-Hour Expiration
              </p>
              <p className="text-amber-700">
                This activation link strictly expires on{' '}
                <strong>{formatDisplayDate(inviteResult.expiresAt)}</strong>. After this time, the link will become invalid.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Direct Invitation Link
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  readOnly
                  value={inviteResult.inviteLink}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none select-all"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form id="invite-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded-r-md">
                <p className="text-xs text-red-700 font-medium">{error}</p>
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
              helper="The official invitation email with the setup link will be dispatched to this address."
            />

            <Select
              label="Role Designation"
              id="invite-role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value as 'ASSOCIATE' | 'STAFF')}
              options={[
                { value: 'ASSOCIATE', label: 'Associate Attorney (Case work, pleadings, court appearances)' },
                { value: 'STAFF', label: 'Staff / Paralegal (Disbursements, court filing support)' },
              ]}
            />

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">Security & Expiration Notice:</p>
              <p>
                Each invitation is assigned a unique cryptographic token valid for <strong>48 hours</strong>. Once accepted, the link is permanently deactivated.
              </p>
            </div>
          </form>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={handleReset} disabled={isLoading}>
          {inviteResult ? 'Done' : 'Cancel'}
        </Button>
        {!inviteResult && (
          <Button form="invite-form" type="submit" loading={isLoading}>
            Send Official Invitation
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
