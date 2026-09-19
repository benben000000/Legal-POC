import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DocumentsClient } from './documents-client';

export default async function DocumentsPage() {
  const user = await requireAuth();

  const where: any = { isDeleted: false };

  const mattersWhere =
    user.role === 'LEAD_ATTORNEY'
      ? {}
      : {
          OR: [
            { createdById: user.id },
            { members: { some: { userId: user.id } } },
          ],
        };

  const [documents, matters] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        matter: { select: { caseTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.matter.findMany({
      where: mattersWhere,
      select: { id: true, caseTitle: true },
      orderBy: { caseTitle: 'asc' },
    }),
  ]);

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
