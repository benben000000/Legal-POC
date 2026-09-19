import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearSessionCookie } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    
    if (token) {
      // Find the session before deleting it to get the userId for the audit log
      const session = await prisma.session.findUnique({
        where: { token },
      });

      if (session) {
        await prisma.session.delete({
          where: { token },
        });

        await createAuditLog({
          userId: session.userId,
          action: 'LOGOUT',
          entityType: 'USER',
          entityId: session.userId,
          ipAddress: getClientIp(request),
          userAgent: request.headers.get('user-agent'),
        });
      }
    }

    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
