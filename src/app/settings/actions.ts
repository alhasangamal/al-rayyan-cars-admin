'use server';

import { revalidatePath } from 'next/cache';
import { requireEmployee } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { query } from '@/lib/db';

export interface SettingsFormState {
  error?: string;
  success?: string;
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

function nullableText(formData: FormData, key: string) {
  return textValue(formData, key) || null;
}

export async function updateOfficeSettingsAction(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const employee = await requireEmployee();
  if (employee.role !== 'admin') {
    return { error: 'تعديل إعدادات المكتب متاح للمدير فقط.' };
  }

  const officeName = textValue(formData, 'office_name');
  const tagline = textValue(formData, 'tagline');
  const logoPath = textValue(formData, 'logo_path') || '/logo-cropped.png';

  if (officeName.length < 2) return { error: 'اكتب اسم المكتب بشكل صحيح.' };
  if (tagline.length < 3) return { error: 'اكتب شعار المكتب.' };
  if (!logoPath.startsWith('/')) return { error: 'مسار اللوجو يجب أن يبدأ بـ / مثل /logo-cropped.png' };

  await query(
    `INSERT INTO office_settings (id, office_name, tagline, phone, whatsapp, email, address, logo_path)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       office_name = EXCLUDED.office_name,
       tagline = EXCLUDED.tagline,
       phone = EXCLUDED.phone,
       whatsapp = EXCLUDED.whatsapp,
       email = EXCLUDED.email,
       address = EXCLUDED.address,
       logo_path = EXCLUDED.logo_path,
       updated_at = CURRENT_TIMESTAMP`,
    [
      officeName,
      tagline,
      nullableText(formData, 'phone'),
      nullableText(formData, 'whatsapp'),
      nullableText(formData, 'email'),
      nullableText(formData, 'address'),
      logoPath,
    ]
  );
  await logAction({
    employee,
    action: 'update_office_settings',
    entityType: 'office_settings',
    entityId: 1,
    details: { officeName, tagline, logoPath },
  });

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: 'تم حفظ بيانات المكتب في قاعدة البيانات.' };
}
