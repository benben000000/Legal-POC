import { prisma } from './prisma';
import type { AuditAction } from '@prisma/client';

interface AuditLogParams {
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityTitle: params.entityTitle ?? null,
        metadata: params.metadata ?? null,
        userIpAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit logging failures must not break the main operation.
    // Log to stderr for monitoring but do not throw.
    if (process.env.NODE_ENV === 'development') {
      console.error('[AuditLog] Failed to create audit entry:', error);
    }
  }
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return null;
}
