'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireEmployee } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { query } from '@/lib/db';

export interface EmployeeFormState {
  error?: string;
  success?: string;
}

export async function createEmployeeAction(_prevState: EmployeeFormState, formData: FormData): Promise<EmployeeFormState> {
  const currentEmployee = await requireEmployee();
  if (currentEmployee.role !== 'admin') return { error: 'هذه الصلاحية متاحة للمدير فقط.' };

  const fullName = String(formData.get('full_name') || '').trim();
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const role = String(formData.get('role') || 'employee');
  const phone = String(formData.get('phone') || '').trim() || null;
  const email = String(formData.get('email') || '').trim() || null;

  if (fullName.length < 3) return { error: 'اكتب اسم الموظف بشكل صحيح.' };
  if (username.length < 3) return { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل.' };
  if (password.length < 6) return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' };
  if (!['admin', 'employee'].includes(role)) return { error: 'صلاحية الموظف غير صحيحة.' };

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const rows = await query<{ id: number }>(
      `INSERT INTO employees (full_name, username, email, phone, password_hash, role, status)
       VALUES ($1,$2,$3,$4,$5,$6,'active')
       RETURNING id`,
      [fullName, username, email, phone, passwordHash, role]
    );
    await logAction({
      employee: currentEmployee,
      action: 'create_employee',
      entityType: 'employee',
      entityId: rows[0].id,
      details: { fullName, username, role },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('employees_username_key')) {
      return { error: 'اسم المستخدم موجود بالفعل.' };
    }
    return { error: 'تعذر إضافة الموظف.' };
  }

  revalidatePath('/employees');
  return { success: 'تم إضافة الموظف بنجاح.' };
}

export async function updateEmployeeAction(id: number, _prevState: EmployeeFormState, formData: FormData): Promise<EmployeeFormState> {
  const currentEmployee = await requireEmployee();
  const isAdmin = currentEmployee.role === 'admin';
  const isSelf = currentEmployee.id === id;

  if (!isAdmin && !isSelf) {
    return { error: 'غير مسموح بتعديل بيانات موظف آخر.' };
  }

  const fullName = String(formData.get('full_name') || '').trim();
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const phone = String(formData.get('phone') || '').trim() || null;
  const email = String(formData.get('email') || '').trim() || null;
  const requestedRole = String(formData.get('role') || 'employee');
  const requestedStatus = String(formData.get('status') || 'active');

  if (fullName.length < 3) return { error: 'اكتب اسم الموظف بشكل صحيح.' };
  if (username.length < 3) return { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل.' };
  if (password && password.length < 6) return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' };
  const existingRows = await query<{ role: string; status: string }>(
    'SELECT role, status FROM employees WHERE id = $1 LIMIT 1',
    [id]
  );
  if (!existingRows[0]) return { error: 'الموظف غير موجود.' };

  const role = isAdmin ? requestedRole : existingRows[0].role;
  const status = isAdmin ? requestedStatus : existingRows[0].status;

  if (!['admin', 'employee'].includes(role)) return { error: 'صلاحية الموظف غير صحيحة.' };
  if (!['active', 'inactive'].includes(status)) return { error: 'حالة الموظف غير صحيحة.' };

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  try {
    await query(
      `UPDATE employees
       SET full_name=$1, username=$2, email=$3, phone=$4,
           role=$5, status=$6,
           password_hash = COALESCE($7, password_hash),
           updated_at=CURRENT_TIMESTAMP
       WHERE id=$8`,
      [fullName, username, email, phone, role, status, passwordHash, id]
    );

    await logAction({
      employee: currentEmployee,
      action: isSelf ? 'update_own_profile' : 'update_employee',
      entityType: 'employee',
      entityId: id,
      details: {
        fullName,
        username,
        role,
        status,
        passwordChanged: Boolean(passwordHash),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('employees_username_key')) {
      return { error: 'اسم المستخدم موجود بالفعل.' };
    }
    if (error instanceof Error && error.message.includes('employees_email_key')) {
      return { error: 'البريد الإلكتروني موجود بالفعل.' };
    }
    return { error: 'تعذر تعديل بيانات الموظف.' };
  }

  revalidatePath('/employees');
  revalidatePath(`/employees/${id}/edit`);
  redirect('/employees');
}
