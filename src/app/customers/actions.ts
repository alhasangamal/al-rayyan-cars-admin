'use server';

import { redirect } from 'next/navigation';
import { requireEmployee } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { query } from '@/lib/db';
import { saveUploadedFile } from '@/lib/uploads';

export interface CustomerFormState {
  error?: string;
}

export async function createCustomerAction(_prevState: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const employee = await requireEmployee();
  const fullName = String(formData.get('full_name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const alternatePhone = String(formData.get('alternate_phone') || '').trim() || null;
  const email = String(formData.get('email') || '').trim() || null;
  const nationalId = String(formData.get('national_id') || '').trim() || null;
  const driverLicenseNumber = String(formData.get('driver_license_number') || '').trim() || null;
  const address = String(formData.get('address') || '').trim() || null;
  const notes = String(formData.get('notes') || '').trim() || null;
  let idImagePath: string | null = null;
  let licenseImagePath: string | null = null;

  if (fullName.length < 3) {
    return { error: 'اكتب اسم العميل بشكل صحيح.' };
  }

  if (phone.length < 8) {
    return { error: 'اكتب رقم هاتف صحيح.' };
  }

  try {
    idImagePath = await saveUploadedFile(formData.get('id_image') as File | null, 'uploads/customers/ids');
    licenseImagePath = await saveUploadedFile(formData.get('license_image') as File | null, 'uploads/customers/licenses');

    const rows = await query<{ id: number }>(
      `INSERT INTO customers (
        full_name, phone, alternate_phone, email, national_id,
        driver_license_number, address, id_image_path, license_image_path, notes, created_by_employee_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id`,
      [fullName, phone, alternatePhone, email, nationalId, driverLicenseNumber, address, idImagePath, licenseImagePath, notes, employee.id]
    );
    await logAction({
      employee,
      action: 'create_customer',
      entityType: 'customer',
      entityId: rows[0].id,
      details: { fullName, phone, hasIdImage: Boolean(idImagePath), hasLicenseImage: Boolean(licenseImagePath) },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('customers_national_id_key')) {
      return { error: 'رقم البطاقة مسجل بالفعل لعميل آخر.' };
    }
    return { error: 'تعذر إضافة العميل. راجع البيانات وحاول مرة أخرى.' };
  }

  redirect('/customers');
}

export async function updateCustomerAction(id: number, _prevState: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const employee = await requireEmployee();
  const fullName = String(formData.get('full_name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const alternatePhone = String(formData.get('alternate_phone') || '').trim() || null;
  const email = String(formData.get('email') || '').trim() || null;
  const nationalId = String(formData.get('national_id') || '').trim() || null;
  const driverLicenseNumber = String(formData.get('driver_license_number') || '').trim() || null;
  const address = String(formData.get('address') || '').trim() || null;
  const notes = String(formData.get('notes') || '').trim() || null;
  const isActive = formData.get('is_active') === 'on';
  let idImagePath: string | null = null;
  let licenseImagePath: string | null = null;

  if (fullName.length < 3) return { error: 'اكتب اسم العميل بشكل صحيح.' };
  if (phone.length < 8) return { error: 'اكتب رقم هاتف صحيح.' };

  try {
    idImagePath = await saveUploadedFile(formData.get('id_image') as File | null, 'uploads/customers/ids');
    licenseImagePath = await saveUploadedFile(formData.get('license_image') as File | null, 'uploads/customers/licenses');

    await query(
      `UPDATE customers
       SET full_name=$1, phone=$2, alternate_phone=$3, email=$4, national_id=$5,
           driver_license_number=$6, address=$7,
           id_image_path=COALESCE($8, id_image_path),
           license_image_path=COALESCE($9, license_image_path),
           notes=$10, is_active=$11,
           updated_at=CURRENT_TIMESTAMP
       WHERE id=$12`,
      [fullName, phone, alternatePhone, email, nationalId, driverLicenseNumber, address, idImagePath, licenseImagePath, notes, isActive, id]
    );
    await logAction({
      employee,
      action: 'update_customer',
      entityType: 'customer',
      entityId: id,
      details: { fullName, phone, isActive, hasNewIdImage: Boolean(idImagePath), hasNewLicenseImage: Boolean(licenseImagePath) },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('customers_national_id_key')) {
      return { error: 'رقم البطاقة مسجل بالفعل لعميل آخر.' };
    }
    return { error: 'تعذر تعديل العميل. راجع البيانات وحاول مرة أخرى.' };
  }

  redirect(`/customers/${id}`);
}
