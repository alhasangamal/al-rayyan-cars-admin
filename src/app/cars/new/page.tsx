import AdminLayout from '@/components/layout/AdminLayout';
import CarForm from '@/components/ui/CarForm';
import { pageTitles } from '@/lib/page-meta';

export default function NewCarPage() {
  return <AdminLayout title={pageTitles.carNew}><CarForm /></AdminLayout>;
}
