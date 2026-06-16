import AdminLayout from '@/components/layout/AdminLayout';
import CustomerForm from '@/components/ui/CustomerForm';
import { pageTitles } from '@/lib/page-meta';

export default function NewCustomerPage() {
  return <AdminLayout title={pageTitles.customerNew}><CustomerForm /></AdminLayout>;
}
