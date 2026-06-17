'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireEmployee } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { query } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export interface PaymentFormState {
  error?: string;
}

export async function createPaymentAction(_prevState: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  const employee = await requireEmployee();
  const rentalId = Number(formData.get('rental_id'));
  const amount = Number(formData.get('amount'));
  const paymentMethod = String(formData.get('payment_method') || 'cash');
  const notes = String(formData.get('notes') || '').trim() || null;

  if (!rentalId) return { error: 'اختار عملية التأجير.' };
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'اكتب مبلغ دفع صحيح.' };

  const rentals = await query<{ customer_id: number; remaining_amount: number }>(
    `SELECT customer_id, remaining_amount
     FROM rentals
     WHERE id = $1 AND status IN ('active', 'overdue')
     LIMIT 1`,
    [rentalId]
  );
  const rental = rentals[0];
  if (!rental) return { error: 'عملية التأجير غير موجودة أو غير قابلة للدفع.' };
  if (amount > Number(rental.remaining_amount)) return { error: 'المبلغ أكبر من المتبقي على التأجير.' };

  const invoices = await query<{ id: number }>('SELECT id FROM invoices WHERE rental_id = $1 LIMIT 1', [rentalId]);

  const rows = await query<{ id: number }>(
    `INSERT INTO payments (rental_id, invoice_id, customer_id, received_by_employee_id, amount, payment_method, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id`,
    [rentalId, invoices[0]?.id || null, rental.customer_id, employee.id, amount, paymentMethod, notes]
  );
  await logAction({
    employee,
    action: 'create_payment',
    entityType: 'payment',
    entityId: rows[0].id,
    details: { rentalId, amount, paymentMethod },
  });

  try {
    const paymentDetails = await query<{
      customer_phone: string;
      customer_name: string;
      car_name: string;
      rental_number: string;
      total_cost: number;
      paid_amount: number;
      remaining_amount: number;
    }>(
      `SELECT c.phone AS customer_phone, c.full_name AS customer_name, cars.car_name,
              r.rental_number, r.total_cost, r.paid_amount, r.remaining_amount
       FROM rentals r
       JOIN customers c ON c.id = r.customer_id
       JOIN cars ON cars.id = r.car_id
       WHERE r.id = $1 LIMIT 1`,
      [rentalId]
    );

    if (paymentDetails.length > 0) {
      const details = paymentDetails[0];
      const waMessage = `نشكركم على التعامل مع مكتب الريان لتأجير السيارات 🌹\n\nتم استلام دفعة مالية بقيمة: ${amount} جنيه\nرقم التأجير: ${details.rental_number}\nالسيارة: ${details.car_name}\n\nتفاصيل الحساب المالي الحالي:\nالإجمالي: ${details.total_cost} جنيه\nإجمالي المدفوع: ${details.paid_amount} جنيه\nالمتبقي: ${details.remaining_amount} جنيه\n\nنتمنى لك رحلة آمنة وسعيدة!`;
      await sendWhatsAppMessage(details.customer_phone, waMessage);
    }
  } catch (error) {
    console.error('Error sending WhatsApp payment notification:', error);
  }

  revalidatePath('/payments');
  revalidatePath('/invoices');
  revalidatePath(`/rentals/${rentalId}`);
  redirect(`/rentals/${rentalId}`);
}
