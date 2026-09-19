import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DocumentsClient } from './documents-client';

export default async function DocumentsPage() {
  const user = await requireAuth();

  const where: any = { isDeleted: false };
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
    include: {
      matter: { select: { caseTitle: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const matters = await prisma.matter.findMany({
    where: user.role === 'LEAD_ATTORNEY' ? {} : {
      OR: [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    select: { id: true, caseTitle: true },
    orderBy: { caseTitle: 'asc' },
  });

  const serializedDocs = documents.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    fileName: d.fileName,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    createdAt: d.createdAt.toISOString(),
    matterId: d.matterId,
    matter: { caseTitle: d.matter.caseTitle },
  }));

  return <DocumentsClient documents={serializedDocs} matters={matters} />;
}
