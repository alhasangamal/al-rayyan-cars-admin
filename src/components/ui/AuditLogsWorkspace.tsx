'use client';

import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { AuditLog } from '@/types';
import SearchInput from './SearchInput';

const actionLabel: Record<string, string> = {
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
  create_employee: 'إضافة موظف',
  update_employee: 'تعديل موظف',
  update_own_profile: 'تعديل بياناته',
  create_car: 'إضافة سيارة',
  update_car: 'تعديل سيارة',
  create_customer: 'إضافة عميل',
  update_customer: 'تعديل عميل',
  create_rental: 'إنشاء تأجير',
  complete_rental: 'إنهاء تأجير',
  cancel_rental: 'إلغاء تأجير',
  create_payment: 'تسجيل دفعة',
  update_office_settings: 'تعديل إعدادات المكتب',
};

export default function AuditLogsWorkspace({ logs }: { logs: AuditLog[] }) {
  const [query, setQuery] = useState('');
  const [employee, setEmployee] = useState('all');
  const [action, setAction] = useState('all');
  const [date, setDate] = useState('');

  const employees = useMemo(() => Array.from(new Set(logs.map((log) => log.employee_name || 'النظام'))), [logs]);
  const actions = useMemo(() => Array.from(new Set(logs.map((log) => log.action))), [logs]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return logs.filter((log) => {
      const name = log.employee_name || 'النظام';
      if (employee !== 'all' && name !== employee) return false;
      if (action !== 'all' && log.action !== action) return false;
      if (date && new Date(log.created_at).toISOString().slice(0, 10) !== date) return false;
      if (!normalized) return true;
      return [name, log.action, log.entity_type, log.entity_id, JSON.stringify(log.details)].join(' ').toLowerCase().includes(normalized);
    });
  }, [action, date, employee, logs, query]);

  function exportCsv() {
    const rows = [
      ['time', 'employee', 'action', 'entity_type', 'entity_id', 'details'],
      ...filtered.map((log) => [
        new Date(log.created_at).toISOString(),
        log.employee_name || 'system',
        log.action,
        log.entity_type,
        log.entity_id || '',
        JSON.stringify(log.details).replaceAll('"', '""'),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell)}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'audit-logs.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_auto_auto_auto_auto] xl:items-center">
        <SearchInput placeholder="بحث في الموظف، العملية، التفاصيل..." value={query} onChange={setQuery} />
        <Select value={employee} onChange={setEmployee}>
          <option value="all">كل الموظفين</option>
          {employees.map((name) => <option key={name} value={name}>{name}</option>)}
        </Select>
        <Select value={action} onChange={setAction}>
          <option value="all">كل العمليات</option>
          {actions.map((item) => <option key={item} value={item}>{actionLabel[item] || item}</option>)}
        </Select>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none" />
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} className="inline-flex h-12 items-center gap-2 rounded-full border border-cyan-300/25 px-4 text-sm font-extrabold text-cyan-100 hover:bg-cyan-300/10">
            <Download className="h-4 w-4" /> Excel
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-extrabold text-white hover:bg-white/10">
            <Printer className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-right text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-4 font-extrabold">الوقت</th>
                <th className="px-5 py-4 font-extrabold">الموظف</th>
                <th className="px-5 py-4 font-extrabold">الإجراء</th>
                <th className="px-5 py-4 font-extrabold">النوع</th>
                <th className="px-5 py-4 font-extrabold">قبل/بعد</th>
                <th className="px-5 py-4 font-extrabold">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((log) => (
                <tr key={log.id} className="transition hover:bg-white/[0.035]">
                  <td className="px-5 py-4 text-slate-300">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.created_at))}</td>
                  <td className="px-5 py-4 font-bold text-white">{log.employee_name || 'النظام'}</td>
                  <td className="px-5 py-4 text-cyan-100">{actionLabel[log.action] || log.action}</td>
                  <td className="px-5 py-4 text-slate-300">{log.entity_type} #{log.entity_id || '-'}</td>
                  <td className="px-5 py-4">
                    <BeforeAfter details={log.details} />
                  </td>
                  <td className="px-5 py-4">
                    <code className="block max-w-md overflow-hidden text-ellipsis whitespace-nowrap rounded-xl bg-black/25 px-3 py-2 text-left text-xs text-slate-300" dir="ltr">
                      {JSON.stringify(log.details)}
                    </code>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">لا توجد سجلات مطابقة.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none">
      {children}
    </select>
  );
}

function BeforeAfter({ details }: { details: Record<string, unknown> }) {
  const before = details.before ? JSON.stringify(details.before) : '-';
  const after = details.after ? JSON.stringify(details.after) : '-';

  return (
    <div className="space-y-1 text-xs">
      <p className="text-rose-100">قبل: <span dir="ltr">{before}</span></p>
      <p className="text-emerald-100">بعد: <span dir="ltr">{after}</span></p>
    </div>
  );
}
