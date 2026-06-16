'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import type { EmployeeRole } from '@/types';

interface SidebarNavProps {
  items: Array<{
    label: string;
    href: string;
    icon: LucideIcon;
    adminOnly?: boolean;
  }>;
  role: EmployeeRole;
}

export default function SidebarNav({ items, role }: SidebarNavProps) {
  const pathname = usePathname();
  const visibleItems = items.filter((item) => !item.adminOnly || role === 'admin');

  return (
    <nav className="space-y-2">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-bold transition ${
              isActive ? 'text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                transition={{ duration: 0.28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-100' : 'text-cyan-200'}`} />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
