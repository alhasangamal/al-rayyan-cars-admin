import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from './db';
import { Employee, EmployeeRole } from '@/types';

const sessionCookieName = 'al_rayyan_admin_session';
const sessionMaxAgeSeconds = 60 * 60 * 8;
const developmentSessionSecret = 'development-only-al-rayyan-session-secret';

interface EmployeeWithPassword extends Employee {
  password_hash: string;
}

interface SessionPayload {
  employeeId: number;
  role: EmployeeRole;
  expiresAt: number;
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret === 'change-this-secret-before-production' || secret.length < 32) {
      throw new Error('AUTH_SESSION_SECRET must be set to a strong production secret.');
    }
  }

  return secret || developmentSessionSecret;
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function encodeSession(payload: SessionPayload) {
  const value = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${value}.${sign(value)}`;
}

function decodeSession(cookieValue: string): SessionPayload | null {
  const [value, signature] = cookieValue.split('.');
  if (!value || !signature) return null;

  const expectedSignature = sign(value);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.employeeId || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getEmployeeByUsername(username: string) {
  const rows = await query<EmployeeWithPassword>(
    `SELECT id, full_name, username, email, phone, password_hash, role, status
     FROM employees
     WHERE username = $1
     LIMIT 1`,
    [username]
  );

  return rows[0] || null;
}

export async function getEmployeeById(id: number) {
  const rows = await query<Employee>(
    `SELECT id, full_name, username, email, phone, role, status
     FROM employees
     WHERE id = $1 AND status = 'active'
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function createSession(employee: Employee) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + sessionMaxAgeSeconds * 1000;

  cookieStore.set(sessionCookieName, encodeSession({
    employeeId: employee.id,
    role: employee.role,
    expiresAt,
  }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionMaxAgeSeconds,
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getCurrentEmployee() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(sessionCookieName)?.value;
  if (!cookieValue) return null;

  const payload = decodeSession(cookieValue);
  if (!payload) return null;

  return getEmployeeById(payload.employeeId);
}

export async function requireEmployee() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect('/login');
  }

  return employee;
}
