'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireEmployee } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { query } from '@/lib/db';

export interface CarFormState {
  error?: string;
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

function nullableText(formData: FormData, key: string) {
  return textValue(formData, key) || null;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export async function createCarAction(_prevState: CarFormState, formData: FormData): Promise<CarFormState> {
  const employee = await requireEmployee();

  const carName = textValue(formData, 'car_name');
  const plateNumber = textValue(formData, 'plate_number');
  const dailyPrice = numberValue(formData, 'daily_rental_price');

  if (carName.length < 2) return { error: 'اكتب اسم السيارة بشكل صحيح.' };
  if (plateNumber.length < 2) return { error: 'اكتب رقم اللوحة.' };
  if (dailyPrice <= 0) return { error: 'اكتب سعر التأجير اليومي.' };

  try {
    const rows = await query<{ id: number }>(
      `INSERT INTO cars (
        car_name, car_model, model_year, color, plate_number, body_type,
        fuel_type, transmission, current_km, seats, daily_rental_price, weekly_rental_price,
        monthly_rental_price, status, image_url, notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING id`,
      [
        carName,
        nullableText(formData, 'car_model'),
        numberValue(formData, 'model_year') || null,
        nullableText(formData, 'color'),
        plateNumber,
        nullableText(formData, 'body_type'),
        nullableText(formData, 'fuel_type'),
        nullableText(formData, 'transmission') || 'Automatic',
        numberValue(formData, 'current_km') || 0,
        numberValue(formData, 'seats', 5),
        dailyPrice,
        numberValue(formData, 'weekly_rental_price') || null,
        numberValue(formData, 'monthly_rental_price') || null,
        textValue(formData, 'status') || 'available',
        nullableText(formData, 'image_url'),
        nullableText(formData, 'notes'),
      ]
    );
    await logAction({
      employee,
      action: 'create_car',
      entityType: 'car',
      entityId: rows[0].id,
      details: { carName, plateNumber, dailyPrice },
    });
    await query(
      `INSERT INTO car_status_logs (car_id, old_status, new_status, reason, changed_by_employee_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [rows[0].id, null, textValue(formData, 'status') || 'available', 'إنشاء السيارة', employee.id]
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('cars_plate_number_key')) {
      return { error: 'رقم اللوحة مسجل بالفعل.' };
    }
    return { error: 'تعذر حفظ السيارة. راجع البيانات وحاول مرة أخرى.' };
  }

  revalidatePath('/cars');
  redirect('/cars');
}

export async function updateCarAction(id: number, _prevState: CarFormState, formData: FormData): Promise<CarFormState> {
  const employee = await requireEmployee();

  const carName = textValue(formData, 'car_name');
  const plateNumber = textValue(formData, 'plate_number');
  const dailyPrice = numberValue(formData, 'daily_rental_price');

  if (carName.length < 2) return { error: 'اكتب اسم السيارة بشكل صحيح.' };
  if (plateNumber.length < 2) return { error: 'اكتب رقم اللوحة.' };
  if (dailyPrice <= 0) return { error: 'اكتب سعر التأجير اليومي.' };

  try {
    const existingRows = await query<{ status: string }>('SELECT status FROM cars WHERE id = $1 LIMIT 1', [id]);
    const oldStatus = existingRows[0]?.status || null;
    const newStatus = textValue(formData, 'status') || 'available';
    const statusReason = textValue(formData, 'status_change_reason') || 'تعديل بيانات السيارة';

    await query(
      `UPDATE cars
       SET car_name=$1, car_model=$2, model_year=$3, color=$4, plate_number=$5,
           body_type=$6, fuel_type=$7, transmission=$8, current_km=$9, seats=$10,
           daily_rental_price=$11, weekly_rental_price=$12, monthly_rental_price=$13,
           status=$14, image_url=$15, notes=$16, updated_at=CURRENT_TIMESTAMP
       WHERE id=$17`,
      [
        carName,
        nullableText(formData, 'car_model'),
        numberValue(formData, 'model_year') || null,
        nullableText(formData, 'color'),
        plateNumber,
        nullableText(formData, 'body_type'),
        nullableText(formData, 'fuel_type'),
        nullableText(formData, 'transmission') || 'Automatic',
        numberValue(formData, 'current_km') || 0,
        numberValue(formData, 'seats', 5),
        dailyPrice,
        numberValue(formData, 'weekly_rental_price') || null,
        numberValue(formData, 'monthly_rental_price') || null,
        newStatus,
        nullableText(formData, 'image_url'),
        nullableText(formData, 'notes'),
        id,
      ]
    );
    if (oldStatus && oldStatus !== newStatus) {
      await query(
        `INSERT INTO car_status_logs (car_id, old_status, new_status, reason, changed_by_employee_id)
         VALUES ($1,$2,$3,$4,$5)`,
        [id, oldStatus, newStatus, statusReason, employee.id]
      );
    }
    await logAction({
      employee,
      action: 'update_car',
      entityType: 'car',
      entityId: id,
      details: {
        carName,
        plateNumber,
        dailyPrice,
        before: { status: oldStatus },
        after: { status: newStatus },
        statusReason,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('cars_plate_number_key')) {
      return { error: 'رقم اللوحة مسجل بالفعل.' };
    }
    return { error: 'تعذر تعديل السيارة. راجع البيانات وحاول مرة أخرى.' };
  }

  revalidatePath('/cars');
  redirect('/cars');
}
