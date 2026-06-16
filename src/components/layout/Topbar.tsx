import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/login/actions';
import { EmployeeRole, NotificationItem } from '@/types';
import Link from 'next/link';
import NotificationCenter from '@/components/ui/NotificationCenter';
import CommandSearch from '@/components/ui/CommandSearch';
import { CommandSearchItem } from '@/lib/command-search';

interface TopbarProps {
  title: string;
  employeeName: string;
  role: EmployeeRole;
  officeName: string;
  notifications: NotificationItem[];
  commandItems: CommandSearchItem[];
}

const roleLabel: Record<EmployeeRole, string> = {
  admin: 'مدير',
  employee: 'موظف',
};

export default function Topbar({ title, employeeName, role, officeName, notifications, commandItems }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/65 px-4 py-4 shadow-2xl shadow-black/15 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white sm:text-2xl">{title}</h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">لوحة تحكم {officeName}</p>
        </div>
        <div className="flex items-center gap-3">
          <CommandSearch items={commandItems} />
          <NotificationCenter items={notifications} />
          <Link href="/profile" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/10">
            {employeeName}
            <span className="mr-2 text-xs text-slate-500">({roleLabel[role]})</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-rose-400/10 hover:text-rose-100"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
