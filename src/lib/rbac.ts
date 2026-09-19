import type { SessionUser } from './auth';

type Permission =
  | 'matters:create'
  | 'matters:read:all'
  | 'matters:read:assigned'
  | 'matters:update:all'
  | 'matters:update:assigned'
  | 'matters:delete'
  | 'matters:archive'
  | 'documents:upload'
  | 'documents:read:all'
  | 'documents:read:assigned'
  | 'documents:delete'
  | 'tasks:create'
  | 'tasks:read:all'
  | 'tasks:read:assigned'
  | 'tasks:update:all'
  | 'tasks:update:assigned'
  | 'tasks:update:status'
  | 'tasks:assign:any'
  | 'deadlines:create'
  | 'deadlines:read:all'
  | 'deadlines:read:assigned'
  | 'deadlines:update'
  | 'deadlines:delete'
  | 'billing:create'
  | 'billing:read:all'
  | 'billing:read:own'
  | 'billing:update'
  | 'billing:create:disbursement'
  | 'invoices:create'
  | 'invoices:read'
  | 'users:invite'
  | 'users:manage'
  | 'users:read'
  | 'audit:read'
  | 'settings:manage';

const rolePermissions: Record<SessionUser['role'], Permission[]> = {
  LEAD_ATTORNEY: [
    'matters:create',
    'matters:read:all',
    'matters:update:all',
    'matters:delete',
    'matters:archive',
    'documents:upload',
    'documents:read:all',
    'documents:delete',
    'tasks:create',
    'tasks:read:all',
    'tasks:update:all',
    'tasks:assign:any',
    'deadlines:create',
    'deadlines:read:all',
    'deadlines:update',
    'deadlines:delete',
    'billing:create',
    'billing:read:all',
    'billing:update',
    'billing:create:disbursement',
    'invoices:create',
    'invoices:read',
    'users:invite',
    'users:manage',
    'users:read',
    'audit:read',
    'settings:manage',
  ],
  ASSOCIATE: [
    'matters:read:assigned',
    'matters:update:assigned',
    'documents:upload',
    'documents:read:assigned',
    'tasks:create',
    'tasks:read:assigned',
    'tasks:update:assigned',
    'deadlines:create',
    'deadlines:read:assigned',
    'deadlines:update',
    'billing:create',
    'billing:read:own',
    'billing:create:disbursement',
    'users:read',
  ],
  STAFF: [
    'matters:read:assigned',
    'documents:upload',
    'documents:read:assigned',
    'tasks:read:assigned',
    'tasks:update:status',
    'deadlines:read:assigned',
    'billing:create:disbursement',
    'billing:read:own',
    'users:read',
  ],
};

export function hasPermission(
  role: SessionUser['role'],
  permission: Permission
): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getPermissions(role: SessionUser['role']): Permission[] {
  return rolePermissions[role] ?? [];
}

export function isLeadAttorney(role: SessionUser['role']): boolean {
  return role === 'LEAD_ATTORNEY';
}
