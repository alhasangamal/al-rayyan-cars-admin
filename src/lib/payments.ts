import { PaymentListItem } from '@/types';
import { query } from './db';

export async function getPayments(): Promise<PaymentListItem[]> {
  const payments = await query<PaymentListItem>(
    `SELECT p.id, p.receipt_number, p.rental_id, r.rental_number,
            c.full_name AS customer_name, p.amount, p.payment_method, p.paid_at
     FROM payments p
     JOIN rentals r ON r.id = p.rental_id
     JOIN customers c ON c.id = p.customer_id
     ORDER BY p.paid_at DESC`
  );

  return payments.map((payment) => ({
    ...payment,
    amount: Number(payment.amount),
  }));
}

export async function getPaymentById(id: number): Promise<PaymentListItem | null> {
  const rows = await query<PaymentListItem>(
    `SELECT p.id, p.receipt_number, p.rental_id, r.rental_number,
            c.full_name AS customer_name, p.amount, p.payment_method, p.paid_at
     FROM payments p
     JOIN rentals r ON r.id = p.rental_id
     JOIN customers c ON c.id = p.customer_id
     WHERE p.id = $1
     LIMIT 1`,
    [id]
  );

  const payment = rows[0];
  return payment ? { ...payment, amount: Number(payment.amount) } : null;
}
