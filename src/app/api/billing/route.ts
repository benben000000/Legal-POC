import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check permissions
    if (user.role === 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const matterId = searchParams.get('matterId');

    const where: any = {};
    if (matterId) {
      where.matterId = matterId;
    }

    if (user.role !== 'LEAD_ATTORNEY') {
       where.OR = [
         { user: { id: user.id } },
         { matter: { members: { some: { userId: user.id } } } },
         { matter: { createdById: user.id } },
       ];
    }

    const billingEntries = await prisma.billingEntry.findMany({
      where,
      include: {
        matter: { select: { caseTitle: true } },
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { datePerformed: 'desc' },
    });

    return NextResponse.json({ billingEntries });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (user.role === 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Simplistic validation for v0.1 without relying on Zod just for speed here
    if (!body.matterId || !body.date || !body.description || !body.amount) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: body.matterId },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && matter.createdById !== user.id) {
       const isMember = await prisma.matterMember.findUnique({
         where: { matterId_userId: { matterId: matter.id, userId: user.id } }
       });
       if (!isMember) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    const billingEntry = await prisma.billingEntry.create({
      data: {
        matterId: body.matterId,
        datePerformed: new Date(body.date),
        description: body.description,
        hours: body.hours || null,
        hourlyRate: body.rate || null,
        amount: body.amount,
        billingType: body.type || 'FEE',
        title: body.description,
        userId: user.id,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'BILLING',
      entityId: billingEntry.id,
      entityTitle: `Billing Entry for ${matter.caseTitle}`,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ billingEntry }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
