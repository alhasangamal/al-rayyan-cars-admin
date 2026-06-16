import AdminLayout from '@/components/layout/AdminLayout';
import DownloadPdfButton from '@/components/ui/DownloadPdfButton';
import PrintButton from '@/components/ui/PrintButton';
import { getPaymentById } from '@/lib/payments';
import { getOfficeSettings } from '@/lib/settings';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const paymentMethodLabel: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  bank_transfer: 'تحويل بنكي',
  wallet: 'محفظة',
};

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;
  const [payment, settings] = await Promise.all([getPaymentById(Number(id)), getOfficeSettings()]);
  if (!payment) notFound();

  return (
    <AdminLayout title="إيصال دفع">
      <div className="space-y-6">
        <div className="flex flex-wrap justify-end gap-3 print:hidden">
          <DownloadPdfButton targetId="receipt-print-area" fileName={`${payment.receipt_number}.pdf`} />
          <PrintButton label="طباعة الإيصال" />
        </div>

        <article id="receipt-print-area" className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/25 backdrop-blur-xl print:border-none print:bg-white print:text-black print:shadow-none">
          <header className="flex items-center gap-4 border-b border-white/10 pb-6 print:border-slate-200">
            <div className="relative h-16 w-24 overflow-hidden rounded-2xl border border-white/10 bg-black/20 print:border-slate-200 print:bg-white">
              <Image src={settings.logo_path} alt={settings.office_name} fill sizes="96px" className="object-contain p-1.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-cyan-200 print:text-slate-600">{settings.office_name}</p>
              <h2 className="mt-2 text-3xl font-black text-white print:text-black">{payment.receipt_number}</h2>
              <p className="mt-1 text-xs text-slate-500 print:text-slate-600">{settings.tagline}</p>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="العميل" value={payment.customer_name} />
            <Info label="رقم التأجير" value={payment.rental_number} />
            <Info label="المبلغ المدفوع" value={`${payment.amount.toLocaleString('en-US')} جنيه`} />
            <Info label="طريقة الدفع" value={paymentMethodLabel[payment.payment_method] || payment.payment_method} />
            <Info label="تاريخ الدفع" value={new Intl.DateTimeFormat('en-GB').format(new Date(payment.paid_at))} />
            <Info label="كود التحقق" value={`${payment.receipt_number}-${payment.id}`} />
          </div>

          <footer className="mt-8 flex justify-end border-t border-white/10 pt-5 print:border-slate-200">
            <Link href={`/rentals/${payment.rental_id}`} className="text-sm font-bold text-cyan-100 print:text-black">
              عرض التأجير المرتبط
            </Link>
          </footer>
        </article>
      </div>
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5 print:border-slate-200 print:bg-slate-50">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 font-extrabold text-white print:text-black">{value}</p>
    </div>
  );
}
