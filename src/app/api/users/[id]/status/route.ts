import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole('LEAD_ATTORNEY');
    const { id } = await params;

    // Prevent Lead Attorney from deactivating themselves
    if (id === user.id) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const isActive = typeof body.isActive === 'boolean' ? body.isActive : !targetUser.isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'USER_SEAT',
      entityId: updatedUser.id,
      entityTitle: `${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email})`,
      metadata: { previousStatus: targetUser.isActive, newStatus: isActive },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}
