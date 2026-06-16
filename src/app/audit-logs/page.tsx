import AdminLayout from '@/components/layout/AdminLayout';
import AuditLogsWorkspace from '@/components/ui/AuditLogsWorkspace';
import { getAuditLogs } from '@/lib/audit-logs';
import { requireEmployee } from '@/lib/auth';
import { pageTitles } from '@/lib/page-meta';
import { redirect } from 'next/navigation';

export default async function AuditLogsPage() {
  const employee = await requireEmployee();
  if (employee.role !== 'admin') redirect('/dashboard');

  const logs = await getAuditLogs(200);

  return (
    <AdminLayout title={pageTitles.auditLogs}>
      <AuditLogsWorkspace logs={logs} />
    </AdminLayout>
  );
}
