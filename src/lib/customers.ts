import { Customer } from '@/types';
import { query } from './db';

export async function getCustomers(): Promise<Customer[]> {
  return query<Customer>(
    `SELECT id, full_name, phone, alternate_phone, email, national_id,
            driver_license_number, address, notes, is_active, created_at
     FROM customers
     ORDER BY created_at DESC`
  );
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const rows = await query<Customer>(
    `SELECT id, full_name, phone, alternate_phone, email, national_id,
            driver_license_number, address, notes, is_active, created_at
     FROM customers
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function getCustomerRentalSummary(id: number) {
  const summaryRows = await query<{
    rentals_count: number;
    total_cost: number;
    paid_amount: number;
    remaining_amount: number;
  }>(
    `SELECT COUNT(*)::int AS rentals_count,
            COALESCE(SUM(total_cost), 0)::numeric AS total_cost,
            COALESCE(SUM(paid_amount), 0)::numeric AS paid_amount,
            COALESCE(SUM(remaining_amount), 0)::numeric AS remaining_amount
     FROM rentals
     WHERE customer_id = $1`,
    [id]
  );

  const rentals = await query<{
    id: number;
    rental_number: string;
    car_name: string;
    start_date: Date;
    end_date: Date;
    total_cost: number;
    remaining_amount: number;
    status: string;
  }>(
    `SELECT r.id, r.rental_number, cars.car_name, r.start_date, r.end_date,
            r.total_cost, r.remaining_amount, r.status
     FROM rentals r
     JOIN cars ON cars.id = r.car_id
     WHERE r.customer_id = $1
     ORDER BY r.created_at DESC
     LIMIT 8`,
    [id]
  );

  const summary = summaryRows[0];
  return {
    summary: {
      rentalsCount: Number(summary?.rentals_count || 0),
      totalCost: Number(summary?.total_cost || 0),
      paidAmount: Number(summary?.paid_amount || 0),
      remainingAmount: Number(summary?.remaining_amount || 0),
    },
    rentals: rentals.map((rental) => ({
      ...rental,
      total_cost: Number(rental.total_cost),
      remaining_amount: Number(rental.remaining_amount),
    })),
  };
}
