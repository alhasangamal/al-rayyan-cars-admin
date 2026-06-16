import AdminLayout from '@/components/layout/AdminLayout';
import SettingsForm from '@/components/ui/SettingsForm';
import { requireEmployee } from '@/lib/auth';
import { pageTitles } from '@/lib/page-meta';
import { getOfficeSettings } from '@/lib/settings';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const employee = await requireEmployee();
  if (employee.role !== 'admin') redirect('/dashboard');

  const settings = await getOfficeSettings();
  const uploadPaths = [
    'public/uploads/cars/main',
    'public/uploads/cars/gallery',
    'public/uploads/customers/ids',
    'public/uploads/customers/licenses',
    'public/uploads/invoices',
    'public/uploads/receipts',
  ];

  return (
    <AdminLayout title={pageTitles.settings}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SettingsForm settings={settings} />

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <h2 className="text-xl font-extrabold text-white">مسارات الملفات</h2>
          <div className="mt-5 space-y-3">
            {uploadPaths.map((path) => (
              <code key={path} className="block rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left text-xs text-cyan-100" dir="ltr">{path}</code>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
