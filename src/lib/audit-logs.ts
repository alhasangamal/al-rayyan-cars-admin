import { AuditLog } from '@/types';
import { query } from './db';

export async function getAuditLogs(limit = 80): Promise<AuditLog[]> {
  return query<AuditLog>(
    `SELECT id, employee_id, employee_name, action, entity_type, entity_id, details, created_at
     FROM audit_logs
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
}
