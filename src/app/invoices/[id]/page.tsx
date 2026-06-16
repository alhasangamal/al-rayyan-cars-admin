import AdminLayout from '@/components/layout/AdminLayout';
import DownloadPdfButton from '@/components/ui/DownloadPdfButton';
import InvoicePdfTemplate from '@/components/ui/InvoicePdfTemplate';
import PrintButton from '@/components/ui/PrintButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { getInvoiceById } from '@/lib/invoices';
import { pageTitles } from '@/lib/page-meta';
import { getOfficeSettings } from '@/lib/settings';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'neutral',
  cancelled: 'danger',
};

const statusLabel: Record<string, string> = {
  paid: 'مدفوعة',
  partial: 'مدفوعة جزئياً',
  unpaid: 'غير مدفوعة',
  cancelled: 'ملغية',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB').format(new Date(date));
}

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const [invoice, settings] = await Promise.all([getInvoiceById(Number(id)), getOfficeSettings()]);
  if (!invoice) notFound();

  return (
    <AdminLayout title={pageTitles.invoices}>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-end gap-3 print:hidden">
          <DownloadPdfButton targetId="invoice-pdf-area" fileName={`${invoice.invoice_number}.pdf`} />
          <PrintButton />
        </div>

        <div className="pointer-events-none fixed -left-[12000px] top-0 print:hidden" aria-hidden="true">
          <InvoicePdfTemplate invoice={invoice} settings={settings} />
        </div>

        <article id="invoice-print-area" className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/25 backdrop-blur-xl print:border-none print:bg-white print:text-black print:shadow-none">
          <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start print:border-slate-200">
            <div>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-24 overflow-hidden rounded-2xl border border-white/10 bg-black/20 print:border-slate-200 print:bg-white">
                  <Image src={settings.logo_path} alt={settings.office_name} fill sizes="96px" className="object-contain p-1.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cyan-200 print:text-slate-600">{settings.office_name}</p>
                  <h2 className="mt-2 text-3xl font-black text-white print:text-black">{invoice.invoice_number}</h2>
                  <p className="mt-2 text-sm text-slate-400 print:text-slate-600">{settings.tagline}</p>
                  <p className="mt-1 text-xs text-slate-500 print:text-slate-600">{settings.phone || ''} {settings.address ? `- ${settings.address}` : ''}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge label={statusLabel[invoice.status] || invoice.status} tone={statusTone[invoice.status] || 'neutral'} />
              <p className="mt-3 text-sm text-slate-400 print:text-slate-600">تاريخ الإصدار: {formatDate(invoice.issued_at)}</p>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Info title="بيانات العميل" rows={[
              ['الاسم', invoice.customer_name],
              ['الهاتف', invoice.customer_phone],
              ['رقم البطاقة', invoice.customer_national_id || '-'],
            ]} />
            <Info title="بيانات السيارة" rows={[
              ['السيارة', `${invoice.car_name} ${invoice.car_model || ''}`],
              ['السنة/اللون', `${invoice.model_year || '-'} - ${invoice.color || '-'}`],
              ['رقم اللوحة', invoice.plate_number || '-'],
              ['رقم التأجير', invoice.rental_number],
            ]} />
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5 print:border-slate-200 print:bg-slate-50">
            <h3 className="font-extrabold text-white print:text-black">تفاصيل التأجير</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <Mini label="بداية التأجير" value={formatDate(invoice.start_date)} />
              <Mini label="نهاية التأجير" value={formatDate(invoice.end_date)} />
              <Mini label="المدة" value={`${invoice.total_days} يوم`} />
              <Mini label="الموظف" value={invoice.employee_name || '-'} />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Money label="الإجمالي" value={invoice.total_amount} />
            <Money label="المدفوع" value={invoice.paid_amount} />
            <Money label="المتبقي" value={invoice.remaining_amount} />
          </div>

          <footer className="mt-8 border-t border-white/10 pt-5 text-sm text-slate-400 print:border-slate-200 print:text-slate-600">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <span>الموظف المسؤول: {invoice.employee_name || '-'}</span>
              <span className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 font-bold text-cyan-100 print:border-slate-200 print:bg-slate-50 print:text-black">
                كود التحقق: {invoice.invoice_number}-{invoice.id}
              </span>
            </div>
          </footer>
        </article>
      </div>
    </AdminLayout>
  );
}

function Info({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5 print:border-slate-200 print:bg-white">
      <h3 className="font-extrabold text-white print:text-black">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-bold text-slate-200 print:text-slate-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold text-slate-100 print:text-slate-900">{value}</p>
    </div>
  );
}

function Money({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-cyan-300/5 p-5 print:border-slate-200 print:bg-white">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-cyan-100 print:text-black">{value.toLocaleString('en-US')} جنيه</p>
    </div>
  );
}
