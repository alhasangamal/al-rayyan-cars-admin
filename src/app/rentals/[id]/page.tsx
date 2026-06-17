import AdminLayout from '@/components/layout/AdminLayout';
import CancelRentalForm from '@/components/ui/CancelRentalForm';
import StatusBadge from '@/components/ui/StatusBadge';
import { requireEmployee } from '@/lib/auth';
import { pageTitles } from '@/lib/page-meta';
import { getRentalById, getRentalFiles } from '@/lib/rentals';
import { completeRentalAction } from '../actions';
import { CheckCircle2, ReceiptText, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SendReminderButton from '@/components/ui/SendReminderButton';

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  completed: 'neutral',
  cancelled: 'danger',
  overdue: 'warning',
  draft: 'neutral',
};

const statusLabel: Record<string, string> = {
  active: 'نشط',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  overdue: 'متأخر',
  draft: 'مسودة',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB').format(new Date(date));
}

interface RentalDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RentalDetailsPage({ params }: RentalDetailsPageProps) {
  const { id } = await params;
  const [employee, rental, files] = await Promise.all([
    requireEmployee(),
    getRentalById(Number(id)),
    getRentalFiles(Number(id)),
  ]);
  if (!rental) notFound();

  return (
    <AdminLayout title={pageTitles.rentalDetails}>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black text-white">{rental.rental_number}</h2>
                <StatusBadge label={statusLabel[rental.status] || rental.status} tone={statusTone[rental.status] || 'neutral'} />
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {rental.customer_name} - {rental.car_name} {rental.car_model || ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['active', 'overdue'].includes(rental.status) && (
                <>
                  <SendReminderButton rentalId={rental.id} isOverdue={rental.status === 'overdue' || new Date(rental.end_date) < new Date()} />
                  <form action={completeRentalAction}>
                    <input type="hidden" name="rental_id" value={rental.id} />
                    <button className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 px-5 py-3 text-sm font-extrabold text-emerald-100 transition hover:bg-emerald-300/10">
                      <CheckCircle2 className="h-4 w-4" />
                      إنهاء التأجير
                    </button>
                  </form>
                </>
              )}
              <Link href="/payments" className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 px-5 py-3 text-sm font-extrabold text-cyan-100 transition hover:bg-cyan-300/10">
                <WalletCards className="h-4 w-4" />
                تسجيل دفعة
              </Link>
              <Link href="/invoices" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300">
                <ReceiptText className="h-4 w-4" />
                الفاتورة
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InfoCard label="العميل" value={rental.customer_name} subValue={rental.customer_phone} href={`/customers/${rental.customer_id}`} />
          <InfoCard label="السيارة" value={`${rental.car_name} ${rental.car_model || ''}`} subValue={`${rental.model_year || '-'} - ${rental.color || '-'} - ${rental.plate_number || 'بدون لوحة'}`} href={`/cars/${rental.car_id}/edit`} />
          <InfoCard label="الفترة" value={`${formatDate(rental.start_date)} - ${formatDate(rental.end_date)}`} subValue={`${rental.total_days} يوم`} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MoneyCard label="السعر اليومي" value={rental.daily_rate} />
          <MoneyCard label="إجمالي التكلفة" value={rental.total_cost} strong />
          <MoneyCard label="المدفوع" value={rental.paid_amount} />
          <MoneyCard label="المتبقي" value={rental.remaining_amount} warning={rental.remaining_amount > 0} />
        </div>

        {rental.notes && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm font-bold text-slate-500">ملاحظات</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{rental.notes}</p>
          </div>
        )}

        {rental.status === 'cancelled' && (
          <div className="rounded-3xl border border-rose-300/15 bg-rose-400/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm font-bold text-rose-100">سبب الإلغاء</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{rental.cancel_reason || '-'}</p>
            <p className="mt-2 text-xs text-slate-500">
              تاريخ الإلغاء: {rental.cancelled_at ? formatDate(rental.cancelled_at) : '-'}
            </p>
          </div>
        )}

        {files.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm font-bold text-slate-500">ملفات وصور التأجير</p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {files.map((file) => (
                <a key={file.id} href={file.file_path} target="_blank" className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-cyan-100 transition hover:border-cyan-300/30 hover:bg-cyan-300/10">
                  {fileLabel[file.file_type] || 'ملف'} - {new Intl.DateTimeFormat('en-GB').format(new Date(file.created_at))}
                </a>
              ))}
            </div>
          </div>
        )}

        {['active', 'overdue', 'draft'].includes(rental.status) && (
          <CancelRentalForm rentalId={rental.id} paidAmount={rental.paid_amount} canCancelPaid={employee.role === 'admin'} />
        )}
      </div>
    </AdminLayout>
  );
}

const fileLabel: Record<string, string> = {
  before: 'صورة قبل التسليم',
  after: 'صورة بعد الاستلام',
  contract: 'عقد',
  other: 'ملف إضافي',
};

function InfoCard({ label, value, subValue, href }: { label: string; value: string; subValue: string; href?: string }) {
  const content = (
    <div className="h-full rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/25">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-lg font-extrabold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{subValue}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function MoneyCard({ label, value, strong = false, warning = false }: { label: string; value: number; strong?: boolean; warning?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className={`mt-3 text-xl font-black ${warning ? 'text-amber-200' : strong ? 'text-cyan-100' : 'text-white'}`}>
        {value.toLocaleString('en-US')} جنيه
      </p>
    </div>
  );
}
