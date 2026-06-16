import { BarChart3, Car, ClipboardList, CreditCard, FileText, Home, Receipt, Settings, UserRound, Users, UserCog } from 'lucide-react';

export const navItems = [
  { label: 'الرئيسية', href: '/dashboard', icon: Home },
  { label: 'بياناتي', href: '/profile', icon: UserRound },
  { label: 'السيارات', href: '/cars', icon: Car },
  { label: 'العملاء', href: '/customers', icon: Users },
  { label: 'التأجيرات', href: '/rentals', icon: FileText },
  { label: 'المدفوعات', href: '/payments', icon: CreditCard },
  { label: 'الفواتير', href: '/invoices', icon: Receipt },
  { label: 'التقارير', href: '/reports', icon: BarChart3, adminOnly: true },
  { label: 'السجلات', href: '/audit-logs', icon: ClipboardList, adminOnly: true },
  { label: 'الموظفين', href: '/employees', icon: UserCog, adminOnly: true },
  { label: 'الإعدادات', href: '/settings', icon: Settings, adminOnly: true },
];
