import AdminLayout from '@/components/layout/AdminLayout';
import StatCard from '@/components/ui/StatCard';
import { requireEmployee } from '@/lib/auth';
import { pageTitles } from '@/lib/page-meta';
import { getReportsData } from '@/lib/reports';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
  const employee = await requireEmployee();
  if (employee.role !== 'admin') redirect('/dashboard');

  const reports = await getReportsData();

  return (
    <AdminLayout title={pageTitles.reports}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="إجمالي الإيرادات" value={`${reports.summary.totalRevenue.toLocaleString('en-US')} جنيه`} />
          <StatCard label="إجمالي المتبقي" value={`${reports.summary.remainingAmount.toLocaleString('en-US')} جنيه`} />
          <StatCard label="تأجيرات نشطة" value={String(reports.summary.activeRentals)} />
          <StatCard label="تأجيرات متأخرة" value={String(reports.summary.overdueRentals)} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReportTable title="أكثر السيارات تأجيراً" columns={['السيارة', 'عدد التأجيرات', 'قيمة التأجيرات']} rows={reports.topCars.map((car) => [car.car_name, String(car.rentals_count), `${car.revenue.toLocaleString('en-US')} جنيه`])} />
          <ReportTable title="أفضل العملاء" columns={['العميل', 'عدد التأجيرات', 'المدفوع']} rows={reports.topCustomers.map((customer) => [customer.customer_name, String(customer.rentals_count), `${customer.paid.toLocaleString('en-US')} جنيه`])} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReportTable title="الإيرادات الشهرية" columns={['الشهر', 'الإيراد']} rows={reports.monthlyRevenue.map((month) => [month.month, `${month.revenue.toLocaleString('en-US')} جنيه`])} />
          <ReportTable title="التقرير اليومي" columns={['اليوم', 'الإيراد']} rows={reports.dailyRevenue.map((day) => [day.day, `${day.revenue.toLocaleString('en-US')} جنيه`])} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReportTable title="مدفوعات حسب طريقة الدفع" columns={['الطريقة', 'عدد الدفعات', 'الإجمالي']} rows={reports.paymentMethods.map((method) => [paymentMethodLabel[method.payment_method] || method.payment_method, String(method.payments_count), `${method.revenue.toLocaleString('en-US')} جنيه`])} />
          <ReportTable title="أداء الموظفين" columns={['الموظف', 'تأجيرات', 'مدفوعات مسجلة']} rows={reports.employeePerformance.map((item) => [item.employee_name, String(item.rentals_count), `${item.payments_total.toLocaleString('en-US')} جنيه`])} />
        </div>
      </div>
    </AdminLayout>
  );
}

const paymentMethodLabel: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  bank_transfer: 'تحويل بنكي',
  wallet: 'محفظة',
};

function ReportTable({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <h2 className="text-xl font-extrabold text-white">{title}</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-right text-sm">
          <thead className="text-slate-500">
            <tr>
              {columns.map((column) => <th key={column} className="px-4 py-3 font-extrabold">{column}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات بعد.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.join('-')} className="transition hover:bg-white/[0.035]">
                {row.map((cell) => <td key={cell} className="px-4 py-3 font-bold text-slate-300">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
