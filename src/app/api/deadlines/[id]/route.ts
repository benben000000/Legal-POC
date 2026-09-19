import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { deadlineSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const deadline = await prisma.deadline.findUnique({
      where: { id },
      include: { matter: true },
    });

    if (!deadline) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && deadline.matter.createdById !== user.id) {
       const isMember = await prisma.matterMember.findUnique({
         where: { matterId_userId: { matterId: deadline.matterId, userId: user.id } }
       });
       if (!isMember) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    const body = await request.json();
    const validatedData = deadlineSchema.partial().parse(body);

    const updatedDeadline = await prisma.deadline.update({
      where: { id },
      data: validatedData,
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'DEADLINE',
      entityId: updatedDeadline.id,
      entityTitle: updatedDeadline.title,
      metadata: { changed: Object.keys(validatedData) },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ deadline: updatedDeadline });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const deadline = await prisma.deadline.findUnique({
      where: { id },
      include: { matter: true },
    });

    if (!deadline) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && deadline.matter.createdById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.deadline.delete({
      where: { id },
    });

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entityType: 'DEADLINE',
      entityId: id,
      entityTitle: deadline.title,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
