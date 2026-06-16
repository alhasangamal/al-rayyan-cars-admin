'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { NotificationItem } from '@/types';

const toneClass = {
  danger: 'bg-rose-400',
  warning: 'bg-amber-300',
  success: 'bg-emerald-300',
  neutral: 'bg-slate-300',
};

export default function NotificationCenter({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-cyan-300/10 hover:text-cyan-100"
        aria-label="التنبيهات"
      >
        <Bell className="h-4 w-4" />
        {items.length > 0 && (
          <span className="absolute -left-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-300 px-1 text-[10px] font-black text-slate-950">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-80 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="font-extrabold text-white">مركز التنبيهات</p>
            <p className="mt-1 text-xs text-slate-500">{items.length ? 'أهم المتابعات اليومية' : 'لا توجد تنبيهات الآن'}</p>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="p-5 text-center text-sm font-bold text-slate-500">كل شيء مستقر.</div>
            ) : (
              items.map((item) => (
                <Link key={item.id} href={item.href} onClick={() => setOpen(false)} className="flex gap-3 rounded-2xl p-3 transition hover:bg-white/5">
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${toneClass[item.tone]}`} />
                  <span>
                    <span className="block text-sm font-extrabold text-white">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">{item.description}</span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
