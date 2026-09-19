import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { taskSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const matterId = searchParams.get('matterId');

    const where: any = {};
    if (matterId) {
      where.matterId = matterId;
    }
    
    // Check permission logic
    if (user.role !== 'LEAD_ATTORNEY') {
       where.OR = [
         { assigneeId: user.id },
         { assignedById: user.id },
         { matter: { createdById: user.id } },
         { matter: { members: { some: { userId: user.id } } } },
       ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        assignee: { select: { firstName: true, lastName: true } },
        matter: { select: { caseTitle: true } },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const matter = await prisma.matter.findUnique({
      where: { id: validatedData.matterId },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && matter.createdById !== user.id) {
       // Check if member
       const isMember = await prisma.matterMember.findUnique({
         where: { matterId_userId: { matterId: matter.id, userId: user.id } }
       });
       if (!isMember) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        matterId: validatedData.matterId,
        assignedById: user.id,
        assigneeId: validatedData.assignedToId || user.id,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'TASK',
      entityId: task.id,
      entityTitle: task.title,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
