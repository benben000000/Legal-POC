import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

const VALID_STATUSES = [
  'TODO',
  'IN_PROGRESS',
  'FOR_ATTORNEY_REVIEW',
  'COMPLETED_FILED',
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid task status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { matter: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Permission: Lead Attorney or assignee or matter member
    if (user.role !== 'LEAD_ATTORNEY' && task.assigneeId !== user.id && task.assignedById !== user.id) {
      const isMember = await prisma.matterMember.findUnique({
        where: { matterId_userId: { matterId: task.matterId, userId: user.id } },
      });
      if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const isCompleting = body.status === 'COMPLETED_FILED';

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: body.status,
        completedAt: isCompleting ? new Date() : (task.status === 'COMPLETED_FILED' ? null : task.completedAt),
      },
      include: {
        assignee: { select: { firstName: true, lastName: true } },
        matter: { select: { caseTitle: true } },
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'TASK',
      entityId: updatedTask.id,
      entityTitle: updatedTask.title,
      metadata: { previousStatus: task.status, newStatus: body.status },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    return handleApiError(error);
  }
}
