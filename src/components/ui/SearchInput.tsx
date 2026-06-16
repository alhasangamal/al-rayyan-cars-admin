'use client';

import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchInput({ placeholder = 'بحث...', value, onChange }: SearchInputProps) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
      />
    </label>
  );
}
