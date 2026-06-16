'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './nav-items';
import type { EmployeeRole } from '@/types';

export default function MobileNav({ role }: { role: EmployeeRole }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => !item.adminOnly || role === 'admin');

  return (
    <div className="sticky top-[73px] z-20 border-b border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-2xl lg:hidden">
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold ${
                isActive ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
