import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { matterSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // In a real app, implement pagination and filtering based on query params
    const where: any = {};
    if (user.role !== 'LEAD_ATTORNEY') {
      where.OR = [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ];
    }

    const matters = await prisma.matter.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true, deadlines: true, documents: true },
        },
      },
    });

    return NextResponse.json({ matters });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Check permission (simplified for v0.1)
    if (user.role === 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = matterSchema.parse(body);

    const matter = await prisma.matter.create({
      data: {
        caseTitle: validatedData.caseTitle,
        docketNumber: validatedData.docketNumber,
        courtBranch: validatedData.courtBranch,
        clientName: validatedData.clientName,
        clientPhone: validatedData.clientContact,
        priority: validatedData.priority,
        status: validatedData.status as any,
        createdById: user.id,
      },
    });

    if (validatedData.assignedToId) {
      await prisma.matterMember.create({
        data: {
          matterId: matter.id,
          userId: validatedData.assignedToId,
          role: 'ASSOCIATE',
        },
      });
    }

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'MATTER',
      entityId: matter.id,
      entityTitle: matter.caseTitle,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ matter }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
