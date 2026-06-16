import AdminLayout from '@/components/layout/AdminLayout';
import EmployeeForm from '@/components/ui/EmployeeForm';
import { requireEmployee } from '@/lib/auth';
import { getEmployeeProfileById } from '@/lib/employees';
import { pageTitles } from '@/lib/page-meta';
import { notFound } from 'next/navigation';

export default async function ProfilePage() {
  const currentEmployee = await requireEmployee();
  const employee = await getEmployeeProfileById(currentEmployee.id);
  if (!employee) notFound();

  return (
    <AdminLayout title={pageTitles.profile}>
      <div className="space-y-5">
        <div className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/10 p-5">
          <h2 className="text-xl font-extrabold text-white">تعديل بياناتي</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            يمكنك تعديل بياناتك الشخصية أو كتابة كلمة مرور جديدة لتغيير الباسورد.
          </p>
        </div>
        <EmployeeForm employee={employee} canManageRole={currentEmployee.role === 'admin'} />
      </div>
    </AdminLayout>
  );
}
