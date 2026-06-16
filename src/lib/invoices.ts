import { InvoiceDetails, InvoiceListItem } from '@/types';
import { query } from './db';

export async function getInvoices(): Promise<InvoiceListItem[]> {
  const invoices = await query<InvoiceListItem>(
    `SELECT i.id, i.invoice_number, i.rental_id, r.rental_number,
            c.full_name AS customer_name, i.total_amount, i.paid_amount,
            i.remaining_amount, i.status, i.issued_at
     FROM invoices i
     JOIN rentals r ON r.id = i.rental_id
     JOIN customers c ON c.id = i.customer_id
     ORDER BY i.issued_at DESC`
  );

  return invoices.map((invoice) => ({
    ...invoice,
    total_amount: Number(invoice.total_amount),
    paid_amount: Number(invoice.paid_amount),
    remaining_amount: Number(invoice.remaining_amount),
  }));
}

export async function getInvoiceById(id: number): Promise<InvoiceDetails | null> {
  const invoices = await query<InvoiceDetails>(
    `SELECT i.id, i.invoice_number, i.rental_id, r.rental_number,
            c.full_name AS customer_name, c.phone AS customer_phone,
            c.national_id AS customer_national_id, cars.car_name, cars.car_model,
            cars.model_year, cars.color, cars.plate_number, r.start_date, r.end_date, r.total_days,
            i.total_amount, i.paid_amount, i.remaining_amount, i.status, i.issued_at,
            e.full_name AS employee_name
     FROM invoices i
     JOIN rentals r ON r.id = i.rental_id
     JOIN customers c ON c.id = i.customer_id
     JOIN cars ON cars.id = r.car_id
     LEFT JOIN employees e ON e.id = i.issued_by_employee_id
     WHERE i.id = $1
     LIMIT 1`,
    [id]
  );

  const invoice = invoices[0];
  if (!invoice) return null;

  return {
    ...invoice,
    total_days: Number(invoice.total_days),
    total_amount: Number(invoice.total_amount),
    paid_amount: Number(invoice.paid_amount),
    remaining_amount: Number(invoice.remaining_amount),
  };
}
