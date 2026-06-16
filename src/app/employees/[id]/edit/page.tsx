import AdminLayout from '@/components/layout/AdminLayout';
import EmployeeForm from '@/components/ui/EmployeeForm';
import { requireEmployee } from '@/lib/auth';
import { getEmployeeProfileById } from '@/lib/employees';
import { pageTitles } from '@/lib/page-meta';
import { notFound, redirect } from 'next/navigation';

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params;
  const currentEmployee = await requireEmployee();
  const employeeId = Number(id);

  if (currentEmployee.role !== 'admin' && currentEmployee.id !== employeeId) {
    redirect('/employees');
  }

  const employee = await getEmployeeProfileById(employeeId);
  if (!employee) notFound();

  return (
    <AdminLayout title={pageTitles.employeeEdit}>
      <EmployeeForm employee={employee} canManageRole={currentEmployee.role === 'admin'} />
    </AdminLayout>
  );
}
