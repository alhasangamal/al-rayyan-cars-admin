import AdminLayout from '@/components/layout/AdminLayout';
import MotionPanel from '@/components/ui/MotionPanel';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { getDashboardStats, getPendingPaymentRentals, getRecentRentals, getTodayReturnRentals } from '@/lib/dashboard';
import { pageTitles } from '@/lib/page-meta';
import { AlertTriangle, Car, CreditCard, FilePlus2, RotateCcw, UserPlus, WalletCards } from 'lucide-react';
import Link from 'next/link';

const rentalStatusLabel: Record<string, string> = {
  active: 'نشط',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  overdue: 'متأخر',
  draft: 'مسودة',
};

const rentalStatusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  completed: 'neutral',
  cancelled: 'danger',
  overdue: 'warning',
  draft: 'neutral',
};

export default async function DashboardPage() {
  const [stats, recentRentals, returnToday, pendingPayments] = await Promise.all([
    getDashboardStats(),
    getRecentRentals(),
    getTodayReturnRentals(),
    getPendingPaymentRentals(),
  ]);

  return (
    <AdminLayout title={pageTitles.dashboard}>
      <div className="space-y-8">
        <MotionPanel className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="absolute -left-16 top-0 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 h-28 w-80 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
            <div>
              <p className="text-sm font-extrabold text-cyan-200">اليوم في الريان كار</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-white md:text-4xl">
                مكتبك تحت السيطرة، والسيارات الجاهزة واضحة من أول نظرة.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                تابع التأجيرات النشطة، المدفوعات، والسيارات المتاحة بسرعة، وابدأ أي عملية يومية من مكان واحد.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/rentals/new" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.22)] transition hover:bg-cyan-300">
                  إنشاء تأجير جديد
                </Link>
                <Link href="/cars" className="rounded-full border border-cyan-300/25 bg-white/5 px-5 py-3 text-sm font-extrabold text-cyan-100 transition hover:bg-cyan-300/10">
                  السيارات المتاحة
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HeroMetric label="متاحة الآن" value={stats.availableCars} />
              <HeroMetric label="مؤجرة" value={stats.rentedCars} />
              <HeroMetric label="عملاء نشطون" value={stats.customersCount} />
              <HeroMetric label="متأخرة" value={stats.overdueRentals} warning />
            </div>
          </div>
        </MotionPanel>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="إجمالي السيارات" value={String(stats.carsCount)} numericValue={stats.carsCount} icon="car" tone="cyan" />
          <StatCard label="سيارات متاحة" value={String(stats.availableCars)} numericValue={stats.availableCars} icon="gauge" tone="emerald" />
          <StatCard label="التأجيرات النشطة" value={String(stats.activeRentals)} numericValue={stats.activeRentals} icon="trending" tone="blue" />
          <StatCard label="مدفوعات اليوم" value={`${stats.todayPayments.toLocaleString('en-US')} جنيه`} numericValue={stats.todayPayments} suffix=" جنيه" icon="wallet" tone="amber" />
        </div>

        {stats.overdueRentals > 0 && (
          <MotionPanel className="flex items-center gap-3 rounded-3xl border border-amber-300/25 bg-amber-300/10 p-4 text-amber-100">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-bold">يوجد {stats.overdueRentals} تأجير متأخر يحتاج متابعة اليوم.</p>
          </MotionPanel>
        )}

        <MotionPanel className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">إجراءات سريعة</h2>
              <p className="mt-1 text-sm text-slate-400">ابدأ عمليات المكتب اليومية من هنا.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Link href="/rentals/new" className="flex items-center gap-3 rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300">
              <FilePlus2 className="h-5 w-5" />
              إنشاء تأجير جديد
            </Link>
            <Link href="/customers/new" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-extrabold text-white transition hover:bg-white/10">
              <UserPlus className="h-5 w-5 text-cyan-200" />
              إضافة عميل
            </Link>
            <Link href="/cars" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-extrabold text-white transition hover:bg-white/10">
              <Car className="h-5 w-5 text-cyan-200" />
              عرض السيارات المتاحة
            </Link>
            <Link href="/payments" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-extrabold text-white transition hover:bg-white/10">
              <CreditCard className="h-5 w-5 text-cyan-200" />
              تسجيل دفعة
            </Link>
          </div>
        </MotionPanel>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TaskPanel
            title="سيارات تحتاج متابعة اليوم"
            description="تأجيرات انتهت أو تنتهي اليوم."
            icon="return"
            items={returnToday.map((item) => ({
              id: item.id,
              title: item.rental_number,
              meta: `${item.customer_name} - ${item.car_name}`,
              amount: item.remaining_amount ? `${Number(item.remaining_amount).toLocaleString('en-US')} جنيه متبقي` : 'لا يوجد متبقي',
              href: `/rentals/${item.id}`,
            }))}
            empty="لا توجد سيارات تحتاج متابعة اليوم."
          />
          <TaskPanel
            title="دفعات غير مكتملة"
            description="أولوية للمتابعة والتحصيل."
            icon="payment"
            items={pendingPayments.map((item) => ({
              id: item.id,
              title: item.rental_number,
              meta: `${item.customer_name} - ${item.car_name}`,
              amount: `${item.remaining_amount.toLocaleString('en-US')} جنيه`,
              href: `/rentals/${item.id}`,
            }))}
            empty="كل الدفعات الحالية مكتملة."
          />
        </div>

        <MotionPanel className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white">آخر التأجيرات</h2>
            <Link href="/rentals" className="text-sm font-bold text-cyan-200 hover:text-cyan-100">عرض الكل</Link>
          </div>
          {recentRentals.length === 0 ? (
            <p className="rounded-2xl bg-black/20 p-6 text-center text-sm text-slate-400">
              لا توجد تأجيرات حتى الآن. ابدأ بإنشاء تأجير جديد.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-right text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="px-4 py-3">رقم التأجير</th>
                    <th className="px-4 py-3">العميل</th>
                    <th className="px-4 py-3">السيارة</th>
                    <th className="px-4 py-3">الإجمالي</th>
                    <th className="px-4 py-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentRentals.map((rental) => (
                    <tr key={rental.id}>
                      <td className="px-4 py-3 font-bold text-white">{rental.rental_number}</td>
                      <td className="px-4 py-3 text-slate-300">{rental.customer_name}</td>
                      <td className="px-4 py-3 text-slate-300">{rental.car_name}</td>
                      <td className="px-4 py-3 text-cyan-100">{Number(rental.total_cost).toLocaleString('en-US')} جنيه</td>
                      <td className="px-4 py-3"><StatusBadge label={rentalStatusLabel[rental.status] || rental.status} tone={rentalStatusTone[rental.status] || 'neutral'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </MotionPanel>
      </div>
    </AdminLayout>
  );
}

function TaskPanel({
  title,
  description,
  icon,
  items,
  empty,
}: {
  title: string;
  description: string;
  icon: 'return' | 'payment';
  items: Array<{ id: number; title: string; meta: string; amount: string; href: string }>;
  empty: string;
}) {
  const Icon = icon === 'return' ? RotateCcw : WalletCards;

  return (
    <MotionPanel className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-2xl bg-black/20 p-5 text-center text-sm font-bold text-slate-500">{empty}</p>
        ) : items.map((item) => (
          <Link key={item.id} href={item.href} className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-300/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-extrabold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
              </div>
              <p className="text-sm font-black text-cyan-100">{item.amount}</p>
            </div>
          </Link>
        ))}
      </div>
    </MotionPanel>
  );
}

function HeroMetric({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return (
    <div className={`rounded-3xl border p-4 ${warning ? 'border-amber-300/20 bg-amber-300/10' : 'border-white/10 bg-black/20'}`}>
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-black ${warning ? 'text-amber-100' : 'text-cyan-100'}`}>{value.toLocaleString('en-US')}</p>
    </div>
  );
}
