import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { inviteSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('LEAD_ATTORNEY');
    
    const body = await request.json();
    const { email, role } = inviteSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const invitation = await prisma.invitation.upsert({
      where: { email },
      update: {
        token,
        role,
        invitedBy: user.id,
        expiresAt,
        isActive: true,
      },
      create: {
        email,
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
      entityTitle: email,
      metadata: { role },
      ipAddress: getClientIp(request),
    });

    // In a real application, we would send an email here.
    // For v0.1, we'll return the invite link directly.
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    return NextResponse.json({
      success: true,
      inviteLink,
      message: 'Invitation created successfully. Provide this link to the user.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
