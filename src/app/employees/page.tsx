import AdminLayout from '@/components/layout/AdminLayout';
import EmployeeForm from '@/components/ui/EmployeeForm';
import StatusBadge from '@/components/ui/StatusBadge';
import { getAuditLogs } from '@/lib/audit-logs';
import { requireEmployee } from '@/lib/auth';
import { getEmployees } from '@/lib/employees';
import { pageTitles } from '@/lib/page-meta';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const roleLabel: Record<string, string> = {
  admin: 'مدير',
  employee: 'موظف',
};

export default async function EmployeesPage() {
  const currentEmployee = await requireEmployee();
  if (currentEmployee.role !== 'admin') {
    redirect('/profile');
  }
  const [employees, logs] = await Promise.all([getEmployees(), getAuditLogs(12)]);

  return (
    <AdminLayout title={pageTitles.employees}>
      <div className="space-y-6">
        {currentEmployee?.role === 'admin' && <EmployeeForm />}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-extrabold">الموظف</th>
                  <th className="px-5 py-4 font-extrabold">اسم المستخدم</th>
                  <th className="px-5 py-4 font-extrabold">الهاتف</th>
                  <th className="px-5 py-4 font-extrabold">الصلاحية</th>
                  <th className="px-5 py-4 font-extrabold">الحالة</th>
                  <th className="px-5 py-4 font-extrabold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {employees.map((employee) => (
                  <tr key={employee.id} className="transition hover:bg-white/[0.035]">
                    <td className="px-5 py-4 font-extrabold text-white">{employee.full_name}</td>
                    <td className="px-5 py-4 text-slate-300">{employee.username}</td>
                    <td className="px-5 py-4 text-slate-300">{employee.phone || '-'}</td>
                    <td className="px-5 py-4 text-slate-300">{roleLabel[employee.role] || employee.role}</td>
                    <td className="px-5 py-4"><StatusBadge label={employee.status === 'active' ? 'نشط' : 'غير نشط'} tone={employee.status === 'active' ? 'success' : 'neutral'} /></td>
                    <td className="px-5 py-4">
                      {(currentEmployee?.role === 'admin' || currentEmployee?.id === employee.id) && (
                        <Link href={`/employees/${employee.id}/edit`} className="rounded-full border border-cyan-300/25 px-4 py-2 text-xs font-extrabold text-cyan-100 transition hover:bg-cyan-300/10">
                          تعديل
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <h2 className="text-xl font-extrabold text-white">آخر السجلات</h2>
          <div className="mt-5 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-extrabold text-white">{log.action}</p>
                  <p className="text-xs font-bold text-slate-500">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.created_at))}</p>
                </div>
                <p className="mt-2 text-slate-400">{log.employee_name || 'النظام'} - {log.entity_type} #{log.entity_id || '-'}</p>
              </div>
            ))}
            {logs.length === 0 && <p className="rounded-2xl bg-black/20 p-5 text-center text-sm text-slate-500">لا توجد سجلات بعد.</p>}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
