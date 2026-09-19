import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { taskSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { matter: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && task.assigneeId !== user.id) {
       // Also check if member of matter
       const isMember = await prisma.matterMember.findUnique({
         where: { matterId_userId: { matterId: task.matter.id, userId: user.id } }
       });
       if (!isMember && task.matter.createdById !== user.id) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    const body = await request.json();
    const validatedData = taskSchema.partial().parse(body);

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        assigneeId: validatedData.assignedToId,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'TASK',
      entityId: updatedTask.id,
      entityTitle: updatedTask.title,
      metadata: { changed: Object.keys(validatedData) },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { matter: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && task.matter.createdById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id },
    });

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entityType: 'TASK',
      entityId: id,
      entityTitle: task.title,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
