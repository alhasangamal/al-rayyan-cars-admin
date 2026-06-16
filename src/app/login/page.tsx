import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getCurrentEmployee } from '@/lib/auth';
import { getOfficeSettings } from '@/lib/settings';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const [employee, settings] = await Promise.all([getCurrentEmployee(), getOfficeSettings()]);
  if (employee) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_35%),#020617] px-4">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 text-right shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative h-16 w-24 overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/25">
            <Image
              src={settings.logo_path}
              alt={settings.office_name}
              fill
              sizes="96px"
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div>
            <p className="text-sm font-bold text-cyan-200">{settings.office_name}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">{settings.tagline}</p>
          </div>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-white">تسجيل الدخول</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          ادخل بيانات الموظف للوصول إلى نظام الإدارة الداخلي.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
