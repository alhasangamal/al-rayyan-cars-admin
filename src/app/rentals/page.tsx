import AdminLayout from '@/components/layout/AdminLayout';
import RentalsWorkspace from '@/components/ui/RentalsWorkspace';
import { pageTitles } from '@/lib/page-meta';
import { getRentals } from '@/lib/rentals';

export default async function RentalsPage() {
  const rentals = await getRentals();

  return (
    <AdminLayout title={pageTitles.rentals}>
      <RentalsWorkspace rentals={rentals} />
    </AdminLayout>
  );
}
