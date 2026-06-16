import AdminLayout from '@/components/layout/AdminLayout';
import CustomersWorkspace from '@/components/ui/CustomersWorkspace';
import { getCustomers } from '@/lib/customers';
import { pageTitles } from '@/lib/page-meta';

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <AdminLayout title={pageTitles.customers}>
      <CustomersWorkspace customers={customers} />
    </AdminLayout>
  );
}
