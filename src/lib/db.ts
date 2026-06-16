import { Pool, type QueryResultRow } from 'pg';

const globalForPg = global as unknown as { adminPgPool?: Pool };

export const db =
  globalForPg.adminPgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.adminPgPool = db;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  const result = await db.query<T>(text, params);
  return result.rows;
}
