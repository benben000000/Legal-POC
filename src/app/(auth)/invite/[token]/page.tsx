'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import {
  PasswordRequirements,
  getPasswordValidationState,
} from '@/components/auth/password-requirements';

const acceptInviteSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&* etc.)'),
});

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

function getRoleBadge(role?: string) {
  switch (role) {
    case 'LEAD_ATTORNEY':
      return 'Lead Attorney';
    case 'ASSOCIATE':
      return 'Associate Attorney';
    case 'STAFF':
      return 'Legal Staff / Paralegal';
    default:
      return role?.replace(/_/g, ' ') || 'Team Member';
  }
}

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const { token } = use(params);

  const [tokenStatus, setTokenStatus] = useState<
    'CHECKING' | 'VALID' | 'EXPIRED' | 'ALREADY_ACCEPTED' | 'NOT_FOUND'
  >('CHECKING');
  const [inviteDetails, setInviteDetails] = useState<{
    email?: string;
    role?: string;
    expiresAt?: string;
    error?: string;
  } | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-flight check token validity and live expiration on page mount
  useEffect(() => {
    let isMounted = true;

    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/invite?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.valid) {
          setTokenStatus('VALID');
          setInviteDetails(data);
        } else if (data.reason === 'EXPIRED') {
          setTokenStatus('EXPIRED');
          setInviteDetails(data);
        } else if (data.reason === 'ALREADY_ACCEPTED') {
          setTokenStatus('ALREADY_ACCEPTED');
          setInviteDetails(data);
        } else {
          setTokenStatus('NOT_FOUND');
          setInviteDetails(data);
        }
      } catch (err) {
        if (isMounted) {
          setTokenStatus('NOT_FOUND');
          setInviteDetails({ error: 'Failed to verify invitation link.' });
        }
      }
    }

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Pre-flight check password requirements with specific error messages
    const validation = getPasswordValidationState(password);
    if (!validation.isValid) {
      setSubmitError(
        `Password does not meet security requirements. Missing: ${validation.missingRules.join(
          ', '
        )}`
      );
      return;
    }

    setIsLoading(true);

    try {
      acceptInviteSchema.parse({ firstName, lastName, password });

      const res = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          firstName,
          lastName,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      router.push('/dashboard');
    } catch (err: any) {
      if (err instanceof z.ZodError || (err as any).name === 'ZodError') {
        const issues = (err as any).issues || (err as any).errors || [];
        setSubmitError(issues[0]?.message || 'Validation failed');
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Loading State
  if (tokenStatus === 'CHECKING') {
    return (
      <div className="py-8 text-center space-y-3">
        <div className="w-8 h-8 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-gray-600">Verifying secure invitation token...</p>
      </div>
    );
  }

  // 2. Expired Token State
  if (tokenStatus === 'EXPIRED') {
    return (
      <div className="text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[4px] bg-amber-50 border border-amber-200">
          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Invitation Link Expired</h3>
          <p className="text-xs text-gray-500 mt-1">
            This invitation link expired on{' '}
            <span className="font-semibold text-gray-700">
              {formatDisplayDate(inviteDetails?.expiresAt)}
            </span>
          </p>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-[4px] p-3.5 text-left text-xs text-amber-900 space-y-1">
          <p className="font-semibold">Security Compliance Notice:</p>
          <p className="text-amber-800 leading-relaxed">
            For security and Philippine data confidentiality compliance, team invitations are strictly valid for <strong>48 hours</strong>.
            Please request a fresh invitation link from your firm administrator (Managing Partner).
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button variant="secondary" className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Already Accepted Token State
  if (tokenStatus === 'ALREADY_ACCEPTED') {
    return (
      <div className="text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[4px] bg-blue-50 border border-blue-200">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Account Already Created</h3>
          <p className="text-xs text-gray-500 mt-1">
            An account has already been registered using this invitation link for{' '}
            <span className="font-semibold text-gray-700">{inviteDetails?.email}</span>.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button className="w-full">Sign In to Workspace</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Invalid or Not Found Token State
  if (tokenStatus === 'NOT_FOUND') {
    return (
      <div className="text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[4px] bg-red-50 border border-red-200">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Invalid Invitation Link</h3>
          <p className="text-xs text-gray-500 mt-1">
            This invitation link is invalid or has been revoked by the firm administrator.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button variant="secondary" className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 5. Valid Invitation State -> Form
  return (
    <div>
      <div className="text-center mb-6 space-y-1.5">
        <div className="inline-flex items-center px-2.5 py-1 rounded-[2px] text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-300">
          Role: {getRoleBadge(inviteDetails?.role)}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Complete Your Registration</h3>
        <p className="text-xs text-gray-500">
          Setting up account credentials for{' '}
          <strong className="text-gray-800">{inviteDetails?.email}</strong>
        </p>
        {inviteDetails?.expiresAt && (
          <p className="text-[11px] text-amber-700 font-medium">
            Link valid until: {formatDisplayDate(inviteDetails.expiresAt)}
          </p>
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {submitError && (
          <div className="bg-red-50 border-l-4 border-red-600 p-3.5 rounded-[2px]">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-red-700 font-medium leading-relaxed">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            id="firstName"
            name="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Juan"
          />
          <Input
            label="Last Name"
            id="lastName"
            name="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Dela Cruz"
          />
        </div>

        <div>
          <Input
            label="Create Secure Password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordRequirements password={password} />
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" loading={isLoading}>
            Create Account & Enter Workspace
          </Button>
        </div>
      </form>
    </div>
  );
}
