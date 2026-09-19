import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth';
import { acceptInviteSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, firstName, lastName, password } = acceptInviteSchema.parse(body);

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation link.' },
        { status: 404 }
      );
    }

    if (!invitation.isActive) {
      return NextResponse.json(
        { error: 'This invitation has already been accepted and cannot be reused.' },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'This invitation link has expired. Official invitations strictly expire after 48 hours.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create the user and deactivate the invitation in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: invitation.email,
          firstName,
          lastName,
          passwordHash,
          role: invitation.role,
          invitedById: invitation.invitedBy,
          isActive: true,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { isActive: false },
      });

      return newUser;
    });

    // Auto-login the new user
    const sessionToken = createToken(user);
    
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
      },
    });

    await setSessionCookie(sessionToken);

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'USER',
      entityId: user.id,
      entityTitle: user.email,
      metadata: { role: user.role, method: 'invitation' },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
