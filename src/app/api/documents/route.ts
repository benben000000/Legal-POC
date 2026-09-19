import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';
import crypto from 'crypto';

const ALLOWED_CATEGORIES = [
  'PLEADINGS_MOTIONS',
  'COURT_ORDERS',
  'EVIDENCE_ANNEXES',
  'CORRESPONDENCE_BILLING',
] as const;

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const matterId = searchParams.get('matterId');
    const category = searchParams.get('category');

    const where: any = { isDeleted: false };
    if (matterId) where.matterId = matterId;
    if (category && ALLOWED_CATEGORIES.includes(category as any)) {
      where.category = category;
    }

    if (user.role !== 'LEAD_ATTORNEY') {
      where.matter = {
        OR: [
          { createdById: user.id },
          { members: { some: { userId: user.id } } },
        ],
      };
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        matter: { select: { caseTitle: true } },
      },
    });

    return NextResponse.json({ documents });
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

    const category = ALLOWED_CATEGORIES.includes(body.category)
      ? body.category
      : 'PLEADINGS_MOTIONS';

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

    // Storage key simulation / identifier
    const storageKey = `doc_${crypto.randomBytes(16).toString('hex')}_${encodeURIComponent(
      body.fileName || body.title
    )}`;

    const document = await prisma.document.create({
      data: {
        title: body.title,
        description: body.description || null,
        matterId: body.matterId,
        category,
        fileName: body.fileName || `${body.title}.pdf`,
        fileSize: Number(body.fileSize) || 1024 * 1024, // default 1MB if simulated
        mimeType: body.mimeType || 'application/pdf',
        storageKey,
        storageUrl: body.fileUrl || null,
        uploadedBy: user.id,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPLOAD',
      entityType: 'DOCUMENT',
      entityId: document.id,
      entityTitle: `${document.title} (${document.fileName})`,
      metadata: { category: document.category, fileSize: document.fileSize },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
