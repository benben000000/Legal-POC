import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { inviteSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { sendInvitationEmail } from '@/lib/email';
import crypto from 'crypto';

// GET: Pre-flight token validation for the invitation landing page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, reason: 'MISSING_TOKEN', error: 'Token parameter is required.' },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { valid: false, reason: 'NOT_FOUND', error: 'This invitation link is invalid or was not found.' },
        { status: 404 }
      );
    }

    if (!invitation.isActive) {
      return NextResponse.json(
        {
          valid: false,
          reason: 'ALREADY_ACCEPTED',
          error: 'This invitation link has already been used to create an account.',
          email: invitation.email,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now > invitation.expiresAt) {
      return NextResponse.json(
        {
          valid: false,
          reason: 'EXPIRED',
          error: 'This invitation link has expired. Official invitations strictly expire after 48 hours.',
          expiresAt: invitation.expiresAt,
          email: invitation.email,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Lead Attorney generates & sends official invitation
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('LEAD_ATTORNEY');
    
    const body = await request.json();
    const { email, role } = inviteSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A team member with this email address already has an active account.' },
        { status: 409 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // Strictly 48 hours

    const invitation = await prisma.invitation.upsert({
      where: { email: normalizedEmail },
      update: {
        token,
        role,
        invitedBy: user.id,
        expiresAt,
        isActive: true,
      },
      create: {
        email: normalizedEmail,
        role,
        token,
        invitedBy: user.id,
        expiresAt,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'INVITATION',
      entityId: invitation.id,
      entityTitle: normalizedEmail,
      metadata: { role, expiresAt: expiresAt.toISOString() },
      ipAddress: getClientIp(request),
    });

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get('host')
        ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
        : 'http://localhost:3000');
    const inviteLink = `${origin}/invite/${token}`;

    // Dispatch real email via Resend API or SMTP
    const emailResult = await sendInvitationEmail({
      to: normalizedEmail,
      role,
      inviteLink,
      expiresAt,
      invitedByName: `Atty. ${user.firstName} ${user.lastName} (Managing Partner)`,
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.delivered,
      provider: emailResult.provider,
      message: emailResult.delivered
        ? `Official invitation email successfully dispatched to ${normalizedEmail}.`
        : `Invitation created. Provide the secure link below to the recipient.`,
      inviteLink,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
