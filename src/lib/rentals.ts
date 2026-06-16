import { RentalDetails, RentalFile, RentalListItem } from '@/types';
import { query } from './db';

export async function getRentals(): Promise<RentalListItem[]> {
  const rentals = await query<RentalListItem>(
    `SELECT r.id, r.rental_number, c.full_name AS customer_name, cars.car_name,
            r.start_date, r.end_date, r.total_cost, r.paid_amount, r.remaining_amount, r.status
     FROM rentals r
     JOIN customers c ON c.id = r.customer_id
     JOIN cars ON cars.id = r.car_id
     ORDER BY r.created_at DESC`
  );

  return rentals.map((rental) => ({
    ...rental,
    total_cost: Number(rental.total_cost),
    paid_amount: Number(rental.paid_amount),
    remaining_amount: Number(rental.remaining_amount),
  }));
}

export async function getRentalById(id: number): Promise<RentalDetails | null> {
  const rentals = await query<RentalDetails>(
    `SELECT r.id, r.rental_number, r.customer_id, r.car_id, c.full_name AS customer_name,
            c.phone AS customer_phone, cars.car_name, cars.car_model, cars.model_year,
            cars.color, cars.plate_number, r.start_date, r.end_date, r.daily_rate, r.total_days,
            r.total_cost, r.paid_amount, r.remaining_amount, r.status, r.notes,
            r.cancel_reason, r.cancelled_at, r.cancelled_by_employee_id
     FROM rentals r
     JOIN customers c ON c.id = r.customer_id
     JOIN cars ON cars.id = r.car_id
     WHERE r.id = $1
     LIMIT 1`,
    [id]
  );

  const rental = rentals[0];
  if (!rental) return null;

  return {
    ...rental,
    daily_rate: Number(rental.daily_rate),
    total_days: Number(rental.total_days),
    total_cost: Number(rental.total_cost),
    paid_amount: Number(rental.paid_amount),
    remaining_amount: Number(rental.remaining_amount),
  };
}

export async function getRentalFiles(rentalId: number): Promise<RentalFile[]> {
  return query<RentalFile>(
    `SELECT id, rental_id, file_type, file_path, created_at
     FROM rental_files
     WHERE rental_id = $1
     ORDER BY created_at DESC`,
    [rentalId]
  );
}

export async function getPayableRentals(): Promise<RentalListItem[]> {
  const rentals = await query<RentalListItem>(
    `SELECT r.id, r.rental_number, c.full_name AS customer_name, cars.car_name,
            r.start_date, r.end_date, r.total_cost, r.paid_amount, r.remaining_amount, r.status
     FROM rentals r
     JOIN customers c ON c.id = r.customer_id
     JOIN cars ON cars.id = r.car_id
     WHERE r.status IN ('active', 'overdue') AND r.remaining_amount > 0
     ORDER BY r.created_at DESC`
  );

  return rentals.map((rental) => ({
    ...rental,
    total_cost: Number(rental.total_cost),
    paid_amount: Number(rental.paid_amount),
    remaining_amount: Number(rental.remaining_amount),
  }));
}
