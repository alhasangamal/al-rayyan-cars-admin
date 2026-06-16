'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PaymentListItem } from '@/types';
import EmptyState from './EmptyState';
import SearchInput from './SearchInput';

const paymentMethodLabel: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  bank_transfer: 'تحويل بنكي',
  wallet: 'محفظة',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB').format(new Date(date));
}

export default function PaymentsWorkspace({ payments }: { payments: PaymentListItem[] }) {
  const [query, setQuery] = useState('');
  const filteredPayments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return payments;
    return payments.filter((payment) => [
      payment.receipt_number,
      payment.rental_number,
      payment.customer_name,
      payment.payment_method,
      paymentMethodLabel[payment.payment_method],
    ].join(' ').toLowerCase().includes(normalized));
  }, [payments, query]);

  const total = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchInput placeholder="بحث برقم الإيصال، التأجير، العميل..." value={query} onChange={setQuery} />
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-cyan-100">
          إجمالي المعروض: {total.toLocaleString('en-US')} جنيه
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState title="لا توجد مدفوعات بعد" description="عند إنشاء تأجير مع دفعة مقدمة أو تسجيل دفعة جديدة ستظهر هنا." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-right text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-extrabold">رقم الإيصال</th>
                  <th className="px-5 py-4 font-extrabold">رقم التأجير</th>
                  <th className="px-5 py-4 font-extrabold">العميل</th>
                  <th className="px-5 py-4 font-extrabold">المبلغ</th>
                  <th className="px-5 py-4 font-extrabold">طريقة الدفع</th>
                  <th className="px-5 py-4 font-extrabold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="transition hover:bg-white/[0.035]">
                    <td className="px-5 py-4 font-extrabold text-white">
                      <Link href={`/receipts/${payment.id}`} className="text-cyan-100 hover:text-cyan-50">{payment.receipt_number}</Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/rentals/${payment.rental_id}`} className="font-bold text-cyan-200 hover:text-cyan-100">{payment.rental_number}</Link>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{payment.customer_name}</td>
                    <td className="px-5 py-4 font-bold text-cyan-100">{payment.amount.toLocaleString('en-US')} جنيه</td>
                    <td className="px-5 py-4 text-slate-300">{paymentMethodLabel[payment.payment_method] || payment.payment_method}</td>
                    <td className="px-5 py-4 text-slate-300">{formatDate(payment.paid_at)}</td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">لا توجد مدفوعات مطابقة.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
