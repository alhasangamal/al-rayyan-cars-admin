'use client';

import { Printer } from 'lucide-react';

export default function PrintButton({ label = 'طباعة الفاتورة' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.22)] transition hover:bg-cyan-300"
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
