import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { requireEmployee } from '@/lib/auth';
import { getOfficeSettings } from '@/lib/settings';
import { getNotificationItems } from '@/lib/notifications';
import { getCommandSearchItems } from '@/lib/command-search';
import AnimatedBackgroundGlow from '@/components/ui/AnimatedBackgroundGlow';
import MotionPanel from '@/components/ui/MotionPanel';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default async function AdminLayout({ children, title }: AdminLayoutProps) {
  const [employee, settings, notifications, commandItems] = await Promise.all([
    requireEmployee(),
    getOfficeSettings(),
    getNotificationItems(),
    getCommandSearchItems(),
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackgroundGlow />
      <Sidebar settings={settings} role={employee.role} />
      <div className="min-h-screen lg:pr-72">
        <Topbar title={title} employeeName={employee.full_name} role={employee.role} officeName={settings.office_name} notifications={notifications} commandItems={commandItems} />
        <MobileNav role={employee.role} />
        <MotionPanel className="p-4 sm:p-6 lg:p-8">{children}</MotionPanel>
      </div>
    </div>
  );
}
