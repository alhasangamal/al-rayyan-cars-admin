import AdminLayout from '@/components/layout/AdminLayout';
import PaymentForm from '@/components/ui/PaymentForm';
import PaymentsWorkspace from '@/components/ui/PaymentsWorkspace';
import { pageTitles } from '@/lib/page-meta';
import { getPayments } from '@/lib/payments';
import { getPayableRentals } from '@/lib/rentals';

export default async function PaymentsPage() {
  const [payments, payableRentals] = await Promise.all([getPayments(), getPayableRentals()]);

  return (
    <AdminLayout title={pageTitles.payments}>
      <div className="space-y-6">
        <PaymentForm rentals={payableRentals} />
        <PaymentsWorkspace payments={payments} />
      </div>
    </AdminLayout>
  );
}
