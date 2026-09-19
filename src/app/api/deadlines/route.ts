import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { deadlineSchema } from '@/lib/validators';
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
    
    // Auth check: if not lead, ensure they are part of the matter
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
    const validatedData = deadlineSchema.parse(body);

    // Verify matter access
    const matter = await prisma.matter.findUnique({
      where: { id: validatedData.matterId },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && matter.createdById !== user.id) {
       // Also check if they are a member of the matter
       const isMember = await prisma.matterMember.findUnique({
         where: { matterId_userId: { matterId: matter.id, userId: user.id } }
       });
       if (!isMember) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    const deadline = await prisma.deadline.create({
      data: {
        title: validatedData.title,
        dueDate: new Date(validatedData.dueDate),
        periodDays: 0,
        triggerDate: new Date(),
        matterId: validatedData.matterId,
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
