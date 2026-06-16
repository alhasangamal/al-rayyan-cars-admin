'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { CommandSearchItem } from '@/lib/command-search';

const typeLabel = {
  car: 'سيارة',
  customer: 'عميل',
  rental: 'تأجير',
};

export default function CommandSearch({ items }: { items: CommandSearchItem[] }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return items.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [items, query]);

  return (
    <div className="relative hidden min-w-72 lg:block">
      <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        placeholder="ابحث عن سيارة، عميل، تأجير..."
        className="h-10 w-full rounded-full border border-white/10 bg-white/5 pr-10 pl-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/35"
      />
      {focused && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          {filtered.map((item) => (
            <Link key={item.id} href={item.href} className="block rounded-2xl px-3 py-2 transition hover:bg-white/5">
              <span className="text-xs font-bold text-cyan-200">{typeLabel[item.type]}</span>
              <span className="mr-2 text-sm font-extrabold text-white">{item.label}</span>
              <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
