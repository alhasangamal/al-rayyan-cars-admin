'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { createSession, getEmployeeByUsername } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { query } from '@/lib/db';

export interface LoginState {
  error?: string;
}

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const maxLoginAttempts = 5;
const lockoutMs = 15 * 60 * 1000;

function getAttemptKey(username: string) {
  return username.toLowerCase();
}

function isLocked(username: string) {
  const attempt = loginAttempts.get(getAttemptKey(username));
  if (!attempt) return false;
  if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) return true;
  if (attempt.lockedUntil && attempt.lockedUntil <= Date.now()) loginAttempts.delete(getAttemptKey(username));
  return false;
}

function recordFailedAttempt(username: string) {
  const key = getAttemptKey(username);
  const attempt = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  const count = attempt.count + 1;
  loginAttempts.set(key, {
    count,
    lockedUntil: count >= maxLoginAttempts ? Date.now() + lockoutMs : 0,
  });
}

function clearAttempts(username: string) {
  loginAttempts.delete(getAttemptKey(username));
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');

  if (!username || !password) {
    return { error: 'اكتب اسم المستخدم وكلمة المرور.' };
  }

  if (isLocked(username)) {
    return { error: 'تم إيقاف محاولات الدخول مؤقتاً. حاول مرة أخرى بعد 15 دقيقة.' };
  }

  const employee = await getEmployeeByUsername(username);

  if (!employee || employee.status !== 'active') {
    recordFailedAttempt(username);
    return { error: 'بيانات الدخول غير صحيحة.' };
  }

  const isValidPassword = await bcrypt.compare(password, employee.password_hash);

  if (!isValidPassword) {
    recordFailedAttempt(username);
    return { error: 'بيانات الدخول غير صحيحة.' };
  }

  clearAttempts(username);
  await createSession(employee);
  await query('UPDATE employees SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [employee.id]);
  await logAction({ employee, action: 'login', entityType: 'employee', entityId: employee.id });

  redirect('/dashboard');
}

export async function logoutAction() {
  const { clearSession, getCurrentEmployee } = await import('@/lib/auth');
  const employee = await getCurrentEmployee();
  await logAction({ employee, action: 'logout', entityType: 'employee', entityId: employee?.id });
  await clearSession();
  redirect('/login');
}
