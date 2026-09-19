import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { documentSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    // For v0.1, we only store metadata (no actual file upload to R2 yet)
    const validatedData = documentSchema.parse(body);

    const matter = await prisma.matter.findUnique({
      where: { id: validatedData.matterId },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    if (user.role !== 'LEAD_ATTORNEY' && matter.createdById !== user.id) {
       // Also check if member of matter
       const isMember = await prisma.matterMember.findUnique({
         where: { matterId_userId: { matterId: matter.id, userId: user.id } }
       });
       if (!isMember) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    const document = await prisma.document.create({
      data: {
        title: validatedData.title,
        matterId: validatedData.matterId,
        uploadedBy: user.id,
        storageKey: validatedData.fileUrl,
        mimeType: validatedData.fileType || 'application/pdf',
        fileSize: validatedData.fileSize || 0,
        category: 'EVIDENCE_ANNEXES', // Default for v0.1
        fileName: validatedData.title,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'DOCUMENT',
      entityId: document.id,
      entityTitle: document.title,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
