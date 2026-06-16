import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import { getCustomerById, getCustomerRentalSummary } from '@/lib/customers';
import { pageTitles } from '@/lib/page-meta';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CustomerDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailsPage({ params }: CustomerDetailsPageProps) {
  const { id } = await params;
  const [customer, activity] = await Promise.all([
    getCustomerById(Number(id)),
    getCustomerRentalSummary(Number(id)),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <AdminLayout title={pageTitles.customerDetails}>
      <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 text-right shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-white">{customer.full_name}</h2>
            <p className="mt-2 text-sm text-slate-400">{customer.phone}</p>
          </div>
          <StatusBadge label={customer.is_active ? 'نشط' : 'غير نشط'} tone={customer.is_active ? 'success' : 'neutral'} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Info label="البريد الإلكتروني" value={customer.email || '-'} />
          <Info label="رقم إضافي" value={customer.alternate_phone || '-'} />
          <Info label="رقم البطاقة" value={customer.national_id || '-'} />
          <Info label="رخصة القيادة" value={customer.driver_license_number || '-'} />
          <Info label="العنوان" value={customer.address || '-'} />
          <Info label="ملاحظات" value={customer.notes || '-'} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/rentals/new?customerId=${customer.id}`} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300">
            إنشاء تأجير لهذا العميل
          </Link>
          <Link href={`/customers/${customer.id}/edit`} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10">
            تعديل بيانات العميل
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="عدد التأجيرات" value={String(activity.summary.rentalsCount)} numericValue={activity.summary.rentalsCount} icon="trending" tone="blue" />
        <StatCard label="إجمالي التعاملات" value={`${activity.summary.totalCost.toLocaleString('en-US')} جنيه`} numericValue={activity.summary.totalCost} suffix=" جنيه" icon="wallet" tone="cyan" />
        <StatCard label="المدفوع" value={`${activity.summary.paidAmount.toLocaleString('en-US')} جنيه`} numericValue={activity.summary.paidAmount} suffix=" جنيه" icon="gauge" tone="emerald" />
        <StatCard label="المتبقي" value={`${activity.summary.remainingAmount.toLocaleString('en-US')} جنيه`} numericValue={activity.summary.remainingAmount} suffix=" جنيه" icon="wallet" tone="amber" />
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <h2 className="text-xl font-extrabold text-white">تاريخ التعاملات</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="px-4 py-3">رقم التأجير</th>
                <th className="px-4 py-3">السيارة</th>
                <th className="px-4 py-3">الفترة</th>
                <th className="px-4 py-3">الإجمالي</th>
                <th className="px-4 py-3">المتبقي</th>
                <th className="px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {activity.rentals.map((rental) => (
                <tr key={rental.id} className="transition hover:bg-white/[0.035]">
                  <td className="px-4 py-3"><Link href={`/rentals/${rental.id}`} className="font-bold text-cyan-100">{rental.rental_number}</Link></td>
                  <td className="px-4 py-3 text-slate-300">{rental.car_name}</td>
                  <td className="px-4 py-3 text-slate-300">{new Intl.DateTimeFormat('en-GB').format(new Date(rental.start_date))} - {new Intl.DateTimeFormat('en-GB').format(new Date(rental.end_date))}</td>
                  <td className="px-4 py-3 text-slate-300">{rental.total_cost.toLocaleString('en-US')} جنيه</td>
                  <td className="px-4 py-3 text-cyan-100">{rental.remaining_amount.toLocaleString('en-US')} جنيه</td>
                  <td className="px-4 py-3"><StatusBadge label={rental.status} tone="neutral" /></td>
                </tr>
              ))}
              {activity.rentals.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">لا توجد تعاملات لهذا العميل بعد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}
