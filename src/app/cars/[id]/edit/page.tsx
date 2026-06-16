import AdminLayout from '@/components/layout/AdminLayout';
import CarForm from '@/components/ui/CarForm';
import { getCarById, getCarStatusLogs } from '@/lib/cars';
import { pageTitles } from '@/lib/page-meta';
import { notFound } from 'next/navigation';

interface EditCarPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: EditCarPageProps) {
  const { id } = await params;
  const [car, logs] = await Promise.all([getCarById(Number(id)), getCarStatusLogs(Number(id))]);
  if (!car) notFound();

  return (
    <AdminLayout title={pageTitles.carEdit}>
      <div className="space-y-6">
        <CarForm car={car} />
        <section className="max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <h2 className="text-lg font-black text-white">سجل حالة السيارة</h2>
          <div className="mt-4 space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm font-bold text-slate-500">لا يوجد سجل تغييرات بعد.</p>
            ) : logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-extrabold text-cyan-100">{statusLabel[log.old_status || ''] || log.old_status || 'بداية'} ← {statusLabel[log.new_status] || log.new_status}</p>
                <p className="mt-1 text-sm text-slate-400">{log.reason || 'بدون سبب'} - {log.employee_name || 'النظام'}</p>
                <p className="mt-1 text-xs text-slate-600">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.created_at))}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

const statusLabel: Record<string, string> = {
  available: 'متاحة',
  rented: 'مؤجرة',
  maintenance: 'صيانة',
  reserved: 'محجوزة',
  inactive: 'غير نشطة',
};
