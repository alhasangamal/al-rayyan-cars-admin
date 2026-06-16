import { Employee } from '@/types';
import { query } from './db';

export async function logAction({
  employee,
  action,
  entityType,
  entityId,
  details = {},
}: {
  employee: Employee | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  details?: Record<string, unknown>;
}) {
  await query(
    `INSERT INTO audit_logs (employee_id, employee_name, action, entity_type, entity_id, details)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
    [
      employee?.id || null,
      employee?.full_name || null,
      action,
      entityType,
      entityId == null ? null : String(entityId),
      JSON.stringify(details),
    ]
  );
}
