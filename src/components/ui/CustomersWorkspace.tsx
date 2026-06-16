'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Customer } from '@/types';
import SearchInput from './SearchInput';
import StatusBadge from './StatusBadge';

export default function CustomersWorkspace({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return customers.filter((customer) => {
      if (status === 'active' && !customer.is_active) return false;
      if (status === 'inactive' && customer.is_active) return false;
      if (!normalized) return true;
      return [
        customer.full_name,
        customer.phone,
        customer.alternate_phone,
        customer.email,
        customer.national_id,
        customer.driver_license_number,
      ].filter(Boolean).join(' ').toLowerCase().includes(normalized);
    });
  }, [customers, query, status]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchInput placeholder="بحث باسم العميل، الهاتف، البطاقة، الرخصة..." value={query} onChange={setQuery} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-cyan-100">
            المعروض: {filteredCustomers.length} / {customers.length}
          </div>
          <Link href="/customers/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300">
            <UserPlus className="h-4 w-4" />
            إضافة عميل
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          ['all', 'كل العملاء'],
          ['active', 'نشط'],
          ['inactive', 'غير نشط'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value as 'all' | 'active' | 'inactive')}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition ${
              status === value ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-4">العميل</th>
                <th className="px-5 py-4">الهاتف</th>
                <th className="px-5 py-4">رقم البطاقة</th>
                <th className="px-5 py-4">رخصة القيادة</th>
                <th className="px-5 py-4">الحالة</th>
                <th className="px-5 py-4">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-white/[0.035]">
                  <td className="px-5 py-4 font-extrabold text-white">{customer.full_name}</td>
                  <td className="px-5 py-4 text-slate-300">{customer.phone}</td>
                  <td className="px-5 py-4 text-slate-300">{customer.national_id || '-'}</td>
                  <td className="px-5 py-4 text-slate-300">{customer.driver_license_number || '-'}</td>
                  <td className="px-5 py-4"><StatusBadge label={customer.is_active ? 'نشط' : 'غير نشط'} tone={customer.is_active ? 'success' : 'neutral'} /></td>
                  <td className="px-5 py-4"><Link href={`/customers/${customer.id}`} className="font-bold text-cyan-200 hover:text-cyan-100">عرض</Link></td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">لا توجد نتائج مطابقة.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
