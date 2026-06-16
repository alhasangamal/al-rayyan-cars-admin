'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { EmployeeRole, OfficeSettings } from '@/types';
import SidebarNav from './SidebarNav';
import { navItems } from './nav-items';

export default function Sidebar({ settings, role }: { settings: OfficeSettings; role: EmployeeRole }) {
  return (
    <aside className="fixed right-0 top-0 z-40 hidden h-screen w-72 border-l border-white/10 bg-black/60 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:block">
      <Link href="/dashboard" className="mb-8 block rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)] transition hover:border-cyan-200/40 hover:bg-cyan-300/[0.14]">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_0_28px_rgba(34,211,238,0.15)]">
            <Image
              src={settings.logo_path}
              alt={settings.office_name}
              fill
              sizes="80px"
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div>
            <p className="text-lg font-extrabold text-white">{settings.office_name}</p>
            <p className="mt-1 text-xs font-bold text-cyan-200">{settings.tagline}</p>
          </div>
        </div>
      </Link>

      <SidebarNav items={navItems} role={role} />
    </aside>
  );
}
