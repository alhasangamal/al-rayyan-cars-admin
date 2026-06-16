import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { getInvoices } from '@/lib/invoices';
import { pageTitles } from '@/lib/page-meta';
import Link from 'next/link';

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

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <AdminLayout title={pageTitles.invoices}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-cyan-100">
          إجمالي الفواتير: {invoices.length}
        </div>

        {invoices.length === 0 ? (
          <EmptyState title="لا توجد فواتير بعد" description="يتم إنشاء فاتورة تلقائياً عند إنشاء تأجير جديد." actionLabel="إنشاء تأجير" actionHref="/rentals/new" />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-extrabold">رقم الفاتورة</th>
                    <th className="px-5 py-4 font-extrabold">رقم التأجير</th>
                    <th className="px-5 py-4 font-extrabold">العميل</th>
                    <th className="px-5 py-4 font-extrabold">الإجمالي</th>
                    <th className="px-5 py-4 font-extrabold">المدفوع</th>
                    <th className="px-5 py-4 font-extrabold">المتبقي</th>
                    <th className="px-5 py-4 font-extrabold">الحالة</th>
                    <th className="px-5 py-4 font-extrabold">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="transition hover:bg-white/[0.035]">
                      <td className="px-5 py-4">
                        <Link href={`/invoices/${invoice.id}`} className="font-extrabold text-white hover:text-cyan-100">{invoice.invoice_number}</Link>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/rentals/${invoice.rental_id}`} className="font-bold text-cyan-200 hover:text-cyan-100">{invoice.rental_number}</Link>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{invoice.customer_name}</td>
                      <td className="px-5 py-4 font-bold text-cyan-100">{invoice.total_amount.toLocaleString('en-US')} جنيه</td>
                      <td className="px-5 py-4 text-slate-300">{invoice.paid_amount.toLocaleString('en-US')} جنيه</td>
                      <td className="px-5 py-4 text-slate-300">{invoice.remaining_amount.toLocaleString('en-US')} جنيه</td>
                      <td className="px-5 py-4"><StatusBadge label={statusLabel[invoice.status] || invoice.status} tone={statusTone[invoice.status] || 'neutral'} /></td>
                      <td className="px-5 py-4 text-slate-300">{formatDate(invoice.issued_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
