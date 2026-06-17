'use server';

import { redirect } from 'next/navigation';
import { requireEmployee } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { saveUploadedFile } from '@/lib/uploads';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { z } from 'zod';

export interface RentalFormState {
  error?: string;
}

const rentalSchema = z.object({
  customerId: z.number().positive('يرجى اختيار العميل.'),
  carId: z.number().positive('يرجى اختيار السيارة.'),
  startDate: z.string().min(1, 'يرجى تحديد تاريخ البداية.'),
  endDate: z.string().min(1, 'يرجى تحديد تاريخ النهاية.'),
  paidAmount: z.number().min(0, 'المدفوع يجب أن يكون صفر أو أكثر.'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية.',
  path: ['endDate'],
});

export async function createRentalAction(_prevState: RentalFormState, formData: FormData): Promise<RentalFormState> {
  const employee = await requireEmployee();
  const customerId = Number(formData.get('customer_id'));
  const carId = Number(formData.get('car_id'));
  const startDate = String(formData.get('start_date') || '');
  const endDate = String(formData.get('end_date') || '');
  const paidAmount = Number(formData.get('paid_amount') || 0);
  const notes = String(formData.get('notes') || '').trim() || null;

  const validationResult = rentalSchema.safeParse({ customerId, carId, startDate, endDate, paidAmount });
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }

  const carRows = await query<{ car_name: string; daily_rental_price: number; status: string }>(
    'SELECT car_name, daily_rental_price, status FROM cars WHERE id = $1 LIMIT 1',
    [carId]
  );
  const car = carRows[0];

  if (!car) {
    return { error: 'السيارة غير موجودة.' };
  }

  if (car.status !== 'available') {
    return { error: 'لا يمكن تأجير هذه السيارة لأنها غير متاحة حالياً.' };
  }

  let createdRentalId: number | null = null;

  try {
    const rentalRows = await query<{ id: number }>(
      `INSERT INTO rentals (
        car_id, customer_id, created_by_employee_id, start_date, end_date,
        daily_rate, paid_amount, status, notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'active',$8)
      RETURNING id`,
      [carId, customerId, employee.id, startDate, endDate, Number(car.daily_rental_price), paidAmount, notes]
    );

    const rentalId = rentalRows[0].id;
    createdRentalId = rentalId;
    const rental = await query<{ customer_id: number; total_cost: number; paid_amount: number; remaining_amount: number }>(
      'SELECT customer_id, total_cost, paid_amount, remaining_amount FROM rentals WHERE id = $1',
      [rentalId]
    );

    await query(
      `INSERT INTO invoices (rental_id, customer_id, issued_by_employee_id, subtotal, paid_amount)
       VALUES ($1,$2,$3,$4,$5)`,
      [rentalId, rental[0].customer_id, employee.id, Number(rental[0].total_cost), Number(rental[0].paid_amount)]
    );

    if (paidAmount > 0) {
      await query(
        `INSERT INTO payments (rental_id, customer_id, received_by_employee_id, amount, payment_method, notes)
         VALUES ($1,$2,$3,$4,'cash','دفعة مقدمة عند إنشاء التأجير')`,
        [rentalId, rental[0].customer_id, employee.id, paidAmount]
      );
    }

    const beforePhotoPath = await saveUploadedFile(formData.get('before_photo') as File | null, 'uploads/rentals/before');
    const afterPhotoPath = await saveUploadedFile(formData.get('after_photo') as File | null, 'uploads/rentals/after');

    if (beforePhotoPath) {
      await query(
        `INSERT INTO rental_files (rental_id, file_type, file_path, uploaded_by_employee_id)
         VALUES ($1,'before',$2,$3)`,
        [rentalId, beforePhotoPath, employee.id]
      );
    }

    if (afterPhotoPath) {
      await query(
        `INSERT INTO rental_files (rental_id, file_type, file_path, uploaded_by_employee_id)
         VALUES ($1,'after',$2,$3)`,
        [rentalId, afterPhotoPath, employee.id]
      );
    }

    await logAction({
      employee,
      action: 'create_rental',
      entityType: 'rental',
      entityId: rentalId,
      details: { customerId, carId, startDate, endDate, paidAmount, hasBeforePhoto: Boolean(beforePhotoPath), hasAfterPhoto: Boolean(afterPhotoPath) },
    });

    const customerRows = await query<{ phone: string, full_name: string }>(
      'SELECT phone, full_name FROM customers WHERE id = $1 LIMIT 1',
      [customerId]
    );
    if (customerRows.length > 0) {
      const customer = customerRows[0];
      const waMessage = `نشكركم على التعامل مع مكتب الريان لتأجير السيارات 🌹\n\nلقد تم تأجير سيارة: ${car.car_name}\nرقم الإيجار: ${rentalId}\nتاريخ البداية: ${startDate}\nتاريخ النهاية: ${endDate}\nالإجمالي: ${rental[0].total_cost} جنيه\nالمدفوع: ${rental[0].paid_amount} جنيه\nالمتبقي: ${rental[0].remaining_amount} جنيه\n\nنتمنى لك رحلة آمنة وسعيدة!`;
      await sendWhatsAppMessage(customer.phone, waMessage);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('not available')) {
      return { error: 'السيارة أصبحت غير متاحة. اختر سيارة أخرى.' };
    }
    if (error instanceof Error && error.message.includes('conflicting key value violates exclusion constraint')) {
      return { error: 'يوجد تأجير متداخل لنفس السيارة في هذه الفترة.' };
    }
    return { error: 'تعذر إنشاء التأجير. راجع البيانات وحاول مرة أخرى.' };
  }

  if (!createdRentalId) {
    return { error: 'تعذر إنشاء التأجير. حاول مرة أخرى.' };
  }

  redirect(`/rentals/${createdRentalId}`);
}

export async function completeRentalAction(formData: FormData) {
  const employee = await requireEmployee();
  const rentalId = Number(formData.get('rental_id'));
  if (!rentalId) return;

  await query(
    `UPDATE rentals
     SET status = 'completed', actual_return_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status IN ('active', 'overdue')`,
    [rentalId]
  );
  await logAction({
    employee,
    action: 'complete_rental',
    entityType: 'rental',
    entityId: rentalId,
  });

  revalidatePath('/rentals');
  revalidatePath('/cars');
  revalidatePath(`/rentals/${rentalId}`);
  redirect(`/rentals/${rentalId}`);
}

export async function cancelRentalAction(_prevState: RentalFormState, formData: FormData): Promise<RentalFormState> {
  const employee = await requireEmployee();
  const rentalId = Number(formData.get('rental_id'));
  const cancelReason = String(formData.get('cancel_reason') || '').trim();

  if (!rentalId) return { error: 'رقم التأجير غير صحيح.' };
  if (cancelReason.length < 3) return { error: 'اكتب سبب الإلغاء.' };

  const rows = await query<{ paid_amount: number; status: string }>(
    'SELECT paid_amount, status FROM rentals WHERE id = $1 LIMIT 1',
    [rentalId]
  );
  const rental = rows[0];
  if (!rental) return { error: 'التأجير غير موجود.' };
  if (!['active', 'overdue', 'draft'].includes(rental.status)) return { error: 'لا يمكن إلغاء هذا التأجير.' };
  if (Number(rental.paid_amount) > 0 && employee.role !== 'admin') {
    return { error: 'لا يمكن إلغاء تأجير عليه مدفوعات إلا بواسطة المدير.' };
  }

  await query(
    `UPDATE rentals
     SET status='cancelled', cancel_reason=$1, cancelled_by_employee_id=$2,
         cancelled_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
     WHERE id=$3`,
    [cancelReason, employee.id, rentalId]
  );

  await logAction({
    employee,
    action: 'cancel_rental',
    entityType: 'rental',
    entityId: rentalId,
    details: { cancelReason, paidAmount: Number(rental.paid_amount) },
  });

  revalidatePath('/rentals');
  revalidatePath('/cars');
  revalidatePath(`/rentals/${rentalId}`);
  redirect(`/rentals/${rentalId}`);
}

export async function sendWhatsAppReminderAction(_prevState: unknown, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const employee = await requireEmployee();
  const rentalId = Number(formData.get('rental_id'));
  if (!rentalId) return { error: 'رقم التأجير غير صحيح.' };

  try {
    const rentalRows = await query<{
      rental_number: string;
      customer_phone: string;
      customer_name: string;
      car_name: string;
      end_date: Date;
      remaining_amount: number;
      status: string;
    }>(
      `SELECT r.rental_number, c.phone AS customer_phone, c.full_name AS customer_name,
              cars.car_name, r.end_date, r.remaining_amount, r.status
       FROM rentals r
       JOIN customers c ON c.id = r.customer_id
       JOIN cars ON cars.id = r.car_id
       WHERE r.id = $1 LIMIT 1`,
      [rentalId]
    );
    const rental = rentalRows[0];
    if (!rental) return { error: 'التأجير غير موجود.' };

    const isOverdue = rental.status === 'overdue' || new Date(rental.end_date) < new Date();
    
    let waMessage = '';
    if (isOverdue) {
      waMessage = `تنبيه من مكتب الريان لتأجير السيارات ⚠️\n\nعزيزي العميل: ${rental.customer_name}\nنود تذكيركم بأن موعد تسليم السيارة (${rental.car_name}) قد انتهى بتاريخ: ${new Intl.DateTimeFormat('en-GB').format(new Date(rental.end_date))}.\nيرجى التوجه للمكتب لتسليم السيارة أو الاتصال بنا لتجديد العقد لتجنب أي رسوم إضافية.\n\nشاكرين تعاونكم معنا! 🌹`;
    } else {
      waMessage = `تذكير من مكتب الريان لتأجير السيارات 🔔\n\nعزيزي العميل: ${rental.customer_name}\nنود تذكيركم بأن موعد تسليم السيارة (${rental.car_name}) هو بتاريخ: ${new Intl.DateTimeFormat('en-GB').format(new Date(rental.end_date))}.\n\nنتمنى لك رحلة سعيدة وآمنة! 🌹`;
    }

    const success = await sendWhatsAppMessage(rental.customer_phone, waMessage);
    if (success) {
      await logAction({
        employee,
        action: 'send_whatsapp_reminder',
        entityType: 'rental',
        entityId: String(rentalId),
        details: { isOverdue },
      });
      return { success: true };
    } else {
      return { error: 'فشل إرسال رسالة الواتساب. يرجى التحقق من الاتصال برقم الخدمة.' };
    }
  } catch (error) {
    console.error('Error sending WhatsApp reminder:', error);
    return { error: 'حدث خطأ أثناء محاولة إرسال الرسالة.' };
  }
}
