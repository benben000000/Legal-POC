import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

function calculateUrgency(dueDate: Date): 'CRITICAL' | 'UPCOMING' | 'ON_SCHEDULE' {
  const diffMs = dueDate.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return 'CRITICAL';
  if (diffDays <= 7) return 'UPCOMING';
  return 'ON_SCHEDULE';
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const matterId = searchParams.get('matterId');

    const where: any = {};
    if (matterId) {
      where.matterId = matterId;
    }

    if (user.role !== 'LEAD_ATTORNEY') {
      where.matter = {
        OR: [
          { createdById: user.id },
          { members: { some: { userId: user.id } } },
        ],
      };
    }

    const deadlines = await prisma.deadline.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        matter: { select: { caseTitle: true } },
      },
    });

    return NextResponse.json({ deadlines });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (!body.title || !body.matterId) {
      return NextResponse.json({ error: 'Title and Matter are required' }, { status: 400 });
    }

    // Verify matter access
    const matter = await prisma.matter.findUnique({
      where: { id: body.matterId },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && matter.createdById !== user.id) {
      const isMember = await prisma.matterMember.findUnique({
        where: { matterId_userId: { matterId: matter.id, userId: user.id } },
      });
      if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const triggerDate = body.triggerDate ? new Date(body.triggerDate) : new Date();
    const periodDays = Number(body.periodDays) || 0;

    let dueDate: Date;
    if (body.dueDate) {
      dueDate = new Date(body.dueDate);
    } else if (periodDays > 0) {
      dueDate = new Date(triggerDate.getTime() + periodDays * 24 * 60 * 60 * 1000);
    } else {
      dueDate = triggerDate;
    }

    const urgencyLevel = calculateUrgency(dueDate);

    const deadline = await prisma.deadline.create({
      data: {
        title: body.title,
        description: body.description || null,
        triggerDate,
        dueDate,
        periodDays,
        urgencyLevel,
        matterId: body.matterId,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'DEADLINE',
      entityId: deadline.id,
      entityTitle: deadline.title,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ deadline }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
