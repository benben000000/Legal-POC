import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ matters: [], documents: [], tasks: [] });
    }

    const mattersWhere = user.role === 'LEAD_ATTORNEY' ? {} : {
      OR: [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ],
    };

    const [matters, documents, tasks] = await Promise.all([
      // 1. Search Matters
      prisma.matter.findMany({
        where: {
          AND: [
            mattersWhere,
            {
              OR: [
                { caseTitle: { contains: q, mode: 'insensitive' } },
                { docketNumber: { contains: q, mode: 'insensitive' } },
                { clientName: { contains: q, mode: 'insensitive' } },
                { courtBranch: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          caseTitle: true,
          docketNumber: true,
          status: true,
        },
        take: 5,
      }),

      // 2. Search Documents
      prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { fileName: { contains: q, mode: 'insensitive' } },
            { matter: { caseTitle: { contains: q, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          title: true,
          fileName: true,
          category: true,
          matterId: true,
          matter: { select: { caseTitle: true } },
        },
        take: 5,
      }),

      // 3. Search Tasks
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { matter: { caseTitle: { contains: q, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          title: true,
          status: true,
          matterId: true,
        },
        take: 4,
      }),
    ]);

    return NextResponse.json({ matters, documents, tasks });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to execute search' }, { status: 500 });
  }
}
