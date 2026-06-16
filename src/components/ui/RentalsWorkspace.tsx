'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
import { RentalListItem } from '@/types';
import EmptyState from './EmptyState';
import SearchInput from './SearchInput';
import StatusBadge from './StatusBadge';

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

export default function RentalsWorkspace({ rentals }: { rentals: RentalListItem[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const filteredRentals = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rentals.filter((rental) => {
      if (status !== 'all' && rental.status !== status) return false;
      if (!normalized) return true;
      return [rental.rental_number, rental.customer_name, rental.car_name, rental.status].join(' ').toLowerCase().includes(normalized);
    });
  }, [query, rentals, status]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchInput placeholder="بحث برقم التأجير، العميل، السيارة..." value={query} onChange={setQuery} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-cyan-100">
            المعروض: {filteredRentals.length} / {rentals.length}
          </div>
          <Link href="/rentals/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300">
            <CalendarPlus className="h-4 w-4" />
            إنشاء تأجير جديد
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          ['all', 'كل التأجيرات'],
          ['active', 'نشط'],
          ['overdue', 'متأخر'],
          ['completed', 'مكتمل'],
          ['cancelled', 'ملغي'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition ${
              status === value ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {rentals.length === 0 ? (
        <EmptyState title="لا توجد تأجيرات بعد" description="ابدأ بإنشاء أول تأجير من السيارات المتاحة أو من ملف العميل." actionLabel="إنشاء تأجير" actionHref="/rentals/new" />
      ) : (
        <>
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredRentals.map((rental) => (
            <Link key={rental.id} href={`/rentals/${rental.id}`} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{rental.rental_number}</p>
                  <p className="mt-1 text-sm text-slate-400">{rental.customer_name}</p>
                </div>
                <StatusBadge label={statusLabel[rental.status] || rental.status} tone={statusTone[rental.status] || 'neutral'} />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-300">{rental.car_name}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <Mini label="الإجمالي" value={rental.total_cost} />
                <Mini label="المدفوع" value={rental.paid_amount} />
                <Mini label="المتبقي" value={rental.remaining_amount} />
              </div>
            </Link>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-right text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-extrabold">رقم التأجير</th>
                  <th className="px-5 py-4 font-extrabold">العميل</th>
                  <th className="px-5 py-4 font-extrabold">السيارة</th>
                  <th className="px-5 py-4 font-extrabold">الفترة</th>
                  <th className="px-5 py-4 font-extrabold">الإجمالي</th>
                  <th className="px-5 py-4 font-extrabold">المدفوع</th>
                  <th className="px-5 py-4 font-extrabold">المتبقي</th>
                  <th className="px-5 py-4 font-extrabold">الحالة</th>
                  <th className="px-5 py-4 font-extrabold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredRentals.map((rental) => (
                  <tr key={rental.id} className="transition hover:bg-white/[0.035]">
                    <td className="px-5 py-4 font-extrabold text-white">{rental.rental_number}</td>
                    <td className="px-5 py-4 text-slate-300">{rental.customer_name}</td>
                    <td className="px-5 py-4 text-slate-300">{rental.car_name}</td>
                    <td className="px-5 py-4 text-slate-300">{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</td>
                    <td className="px-5 py-4 font-bold text-cyan-100">{rental.total_cost.toLocaleString('en-US')} جنيه</td>
                    <td className="px-5 py-4 text-slate-300">{rental.paid_amount.toLocaleString('en-US')} جنيه</td>
                    <td className="px-5 py-4 text-slate-300">{rental.remaining_amount.toLocaleString('en-US')} جنيه</td>
                    <td className="px-5 py-4"><StatusBadge label={statusLabel[rental.status] || rental.status} tone={statusTone[rental.status] || 'neutral'} /></td>
                    <td className="px-5 py-4"><Link href={`/rentals/${rental.id}`} className="font-bold text-cyan-200 hover:text-cyan-100">عرض</Link></td>
                  </tr>
                ))}
                {filteredRentals.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-500">لا توجد تأجيرات مطابقة.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold text-cyan-100">{value.toLocaleString('en-US')}</p>
    </div>
  );
}
