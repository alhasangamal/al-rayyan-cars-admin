import { query } from './db';

export async function getDashboardStats() {
  const rows = await query<{
    cars_count: number;
    available_cars: number;
    rented_cars: number;
    customers_count: number;
    active_rentals: number;
    overdue_rentals: number;
    today_payments: number;
  }>(`
    SELECT
      (SELECT COUNT(*)::int FROM cars) AS cars_count,
      (SELECT COUNT(*)::int FROM cars WHERE status = 'available') AS available_cars,
      (SELECT COUNT(*)::int FROM cars WHERE status = 'rented') AS rented_cars,
      (SELECT COUNT(*)::int FROM customers WHERE is_active = TRUE) AS customers_count,
      (SELECT COUNT(*)::int FROM rentals WHERE status IN ('active', 'overdue')) AS active_rentals,
      (SELECT COUNT(*)::int FROM overdue_rentals) AS overdue_rentals,
      (SELECT COALESCE(SUM(amount), 0)::numeric FROM payments WHERE paid_at::date = CURRENT_DATE) AS today_payments
  `);

  return {
    carsCount: Number(rows[0]?.cars_count || 0),
    availableCars: Number(rows[0]?.available_cars || 0),
    rentedCars: Number(rows[0]?.rented_cars || 0),
    customersCount: Number(rows[0]?.customers_count || 0),
    activeRentals: Number(rows[0]?.active_rentals || 0),
    overdueRentals: Number(rows[0]?.overdue_rentals || 0),
    todayPayments: Number(rows[0]?.today_payments || 0),
  };
}

export async function getRecentRentals() {
  return query<{
    id: number;
    rental_number: string;
    customer_name: string;
    car_name: string;
    status: string;
    total_cost: number;
  }>(`
    SELECT r.id, r.rental_number, c.full_name AS customer_name, cars.car_name,
           r.status, r.total_cost
    FROM rentals r
    JOIN customers c ON c.id = r.customer_id
    JOIN cars ON cars.id = r.car_id
    ORDER BY r.created_at DESC
    LIMIT 5
  `);
}

export async function getTodayReturnRentals() {
  return query<{
    id: number;
    rental_number: string;
    customer_name: string;
    car_name: string;
    end_date: Date;
    remaining_amount: number;
    status: string;
  }>(`
    SELECT r.id, r.rental_number, c.full_name AS customer_name, cars.car_name,
           r.end_date, r.remaining_amount, r.status
    FROM rentals r
    JOIN customers c ON c.id = r.customer_id
    JOIN cars ON cars.id = r.car_id
    WHERE r.status IN ('active', 'overdue')
      AND r.end_date <= CURRENT_DATE
    ORDER BY r.end_date ASC
    LIMIT 6
  `);
}

export async function getPendingPaymentRentals() {
  const rows = await query<{
    id: number;
    rental_number: string;
    customer_name: string;
    car_name: string;
    remaining_amount: number;
  }>(`
    SELECT r.id, r.rental_number, c.full_name AS customer_name, cars.car_name,
           r.remaining_amount
    FROM rentals r
    JOIN customers c ON c.id = r.customer_id
    JOIN cars ON cars.id = r.car_id
    WHERE r.status IN ('active', 'overdue')
      AND r.remaining_amount > 0
    ORDER BY r.remaining_amount DESC
    LIMIT 6
  `);

  return rows.map((row) => ({ ...row, remaining_amount: Number(row.remaining_amount) }));
}
