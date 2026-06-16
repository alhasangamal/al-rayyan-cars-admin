import { Employee } from '@/types';
import { query } from './db';

export async function getEmployees(): Promise<Employee[]> {
  return query<Employee>(
    `SELECT id, full_name, username, email, phone, role, status
     FROM employees
     ORDER BY created_at DESC`
  );
}

export async function getEmployeeProfileById(id: number): Promise<Employee | null> {
  const rows = await query<Employee>(
    `SELECT id, full_name, username, email, phone, role, status
     FROM employees
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}
