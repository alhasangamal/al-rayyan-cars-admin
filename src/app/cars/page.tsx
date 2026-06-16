import AdminLayout from '@/components/layout/AdminLayout';
import CarsWorkspace from '@/components/ui/CarsWorkspace';
import { getAdminCars } from '@/lib/cars';
import { pageTitles } from '@/lib/page-meta';

export default async function CarsPage() {
  const cars = await getAdminCars();

  return (
    <AdminLayout title={pageTitles.cars}>
      <CarsWorkspace cars={cars} />
    </AdminLayout>
  );
}
