import AdminLayout from '@/components/layout/AdminLayout';
import CustomerForm from '@/components/ui/CustomerForm';
import { getCustomerById } from '@/lib/customers';
import { pageTitles } from '@/lib/page-meta';
import { notFound } from 'next/navigation';

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params;
  const customer = await getCustomerById(Number(id));
  if (!customer) notFound();

  return <AdminLayout title={pageTitles.customerEdit}><CustomerForm customer={customer} /></AdminLayout>;
}
