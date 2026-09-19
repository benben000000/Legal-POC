import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { matterSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const matter = await prisma.matter.findUnique({
      where: { id },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        members: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    // Basic authorization
    if (user.role !== 'LEAD_ATTORNEY' && matter.createdById !== user.id) {
       const isMember = await prisma.matterMember.findUnique({
         where: { matterId_userId: { matterId: id, userId: user.id } }
       });
       if (!isMember) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    return NextResponse.json({ matter });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Check permission
    if (user.role === 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }
    
    // Additional auth check
    if (user.role !== 'LEAD_ATTORNEY' && matter.createdById !== user.id) {
       const isMember = await prisma.matterMember.findUnique({
         where: { matterId_userId: { matterId: id, userId: user.id } }
       });
       if (!isMember) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    const body = await request.json();
    const validatedData = matterSchema.partial().parse(body);

    const updatedMatter = await prisma.matter.update({
      where: { id },
      data: {
        caseTitle: validatedData.caseTitle,
        docketNumber: validatedData.docketNumber,
        courtBranch: validatedData.courtBranch,
        clientName: validatedData.clientName,
        clientPhone: validatedData.clientContact,
        priority: validatedData.priority,
        status: validatedData.status as any,
      },
    });

    if (validatedData.assignedToId) {
      await prisma.matterMember.upsert({
        where: { matterId_userId: { matterId: id, userId: validatedData.assignedToId } },
        create: { matterId: id, userId: validatedData.assignedToId, role: 'ASSOCIATE' },
        update: {}
      });
    }

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'MATTER',
      entityId: updatedMatter.id,
      entityTitle: updatedMatter.caseTitle,
      metadata: { changed: Object.keys(validatedData) },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ matter: updatedMatter });
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

    // Only lead attorneys can delete matters
    if (user.role !== 'LEAD_ATTORNEY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    await prisma.matter.delete({
      where: { id },
    });

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entityType: 'MATTER',
      entityId: id,
      entityTitle: matter.caseTitle,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
