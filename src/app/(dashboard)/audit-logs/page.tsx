import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function AuditLogsPage() {
  const currentUser = await requireRole('LEAD_ATTORNEY');

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Immutable Audit Logs"
        description="Comprehensive audit trail tracking document access, case modifications, and user security events."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User / Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Entity</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead className="text-right">Network IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs text-gray-500">
                  {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                </TableCell>
                <TableCell className="text-gray-900 font-medium text-xs">
                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  <span className="block text-[10px] text-gray-400 font-mono">
                    {log.user?.email || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-gray-700 whitespace-nowrap">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        log.action === 'CREATE' || log.action === 'UPLOAD'
                          ? 'bg-emerald-500'
                          : log.action === 'DELETE'
                          ? 'bg-rose-500'
                          : log.action === 'UPDATE'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span>{log.action}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 text-xs font-mono">
                  {log.entityType}
                </TableCell>
                <TableCell className="text-gray-900 text-xs font-medium max-w-xs truncate">
                  {log.entityTitle || log.entityId}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-gray-500">
                  {log.userIpAddress || 'Internal'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
