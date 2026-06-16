import AdminLayout from '@/components/layout/AdminLayout';
import RentalForm from '@/components/ui/RentalForm';
import { getAdminCars } from '@/lib/cars';
import { getCustomers } from '@/lib/customers';
import { pageTitles } from '@/lib/page-meta';

interface NewRentalPageProps {
  searchParams: Promise<{
    customerId?: string;
    carId?: string;
  }>;
}

export default async function NewRentalPage({ searchParams }: NewRentalPageProps) {
  const params = await searchParams;
  const [customers, cars] = await Promise.all([
    getCustomers(),
    getAdminCars(),
  ]);
  const availableCars = cars.filter((car) => car.status === 'available');

  return (
    <AdminLayout title={pageTitles.rentalNew}>
      <RentalForm
        customers={customers.filter((customer) => customer.is_active)}
        cars={availableCars}
        initialCustomerId={params.customerId}
        initialCarId={params.carId}
      />
    </AdminLayout>
  );
}
