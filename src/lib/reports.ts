import { query } from './db';

export async function getReportsData() {
  const [summaryRows, topCars, topCustomers, monthlyRevenue, dailyRevenue, paymentMethods, employeePerformance] = await Promise.all([
    query<{
      total_revenue: number;
      active_rentals: number;
      completed_rentals: number;
      overdue_rentals: number;
      available_cars: number;
      rented_cars: number;
      remaining_amount: number;
    }>(`
      SELECT
        (SELECT COALESCE(SUM(amount), 0)::numeric FROM payments) AS total_revenue,
        (SELECT COALESCE(SUM(remaining_amount), 0)::numeric FROM rentals WHERE status IN ('active', 'overdue')) AS remaining_amount,
        (SELECT COUNT(*)::int FROM rentals WHERE status IN ('active', 'overdue')) AS active_rentals,
        (SELECT COUNT(*)::int FROM rentals WHERE status = 'completed') AS completed_rentals,
        (SELECT COUNT(*)::int FROM overdue_rentals) AS overdue_rentals,
        (SELECT COUNT(*)::int FROM cars WHERE status = 'available') AS available_cars,
        (SELECT COUNT(*)::int FROM cars WHERE status = 'rented') AS rented_cars
    `),
    query<{ car_name: string; rentals_count: number; revenue: number }>(`
      SELECT cars.car_name, COUNT(r.id)::int AS rentals_count, COALESCE(SUM(r.total_cost), 0)::numeric AS revenue
      FROM cars
      LEFT JOIN rentals r ON r.car_id = cars.id
      GROUP BY cars.id, cars.car_name
      ORDER BY rentals_count DESC, revenue DESC
      LIMIT 5
    `),
    query<{ customer_name: string; rentals_count: number; paid: number }>(`
      SELECT c.full_name AS customer_name, COUNT(r.id)::int AS rentals_count, COALESCE(SUM(r.paid_amount), 0)::numeric AS paid
      FROM customers c
      LEFT JOIN rentals r ON r.customer_id = c.id
      GROUP BY c.id, c.full_name
      ORDER BY rentals_count DESC, paid DESC
      LIMIT 5
    `),
    query<{ month: string; revenue: number }>(`
      SELECT to_char(date_trunc('month', paid_at), 'YYYY-MM') AS month, COALESCE(SUM(amount), 0)::numeric AS revenue
      FROM payments
      GROUP BY date_trunc('month', paid_at)
      ORDER BY month DESC
      LIMIT 6
    `),
    query<{ day: string; revenue: number }>(`
      SELECT to_char(date_trunc('day', paid_at), 'YYYY-MM-DD') AS day, COALESCE(SUM(amount), 0)::numeric AS revenue
      FROM payments
      WHERE paid_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY date_trunc('day', paid_at)
      ORDER BY day DESC
    `),
    query<{ payment_method: string; revenue: number; payments_count: number }>(`
      SELECT payment_method, COALESCE(SUM(amount), 0)::numeric AS revenue, COUNT(*)::int AS payments_count
      FROM payments
      GROUP BY payment_method
      ORDER BY revenue DESC
    `),
    query<{ employee_name: string; rentals_count: number; payments_total: number }>(`
      SELECT COALESCE(e.full_name, 'غير محدد') AS employee_name,
             COUNT(DISTINCT r.id)::int AS rentals_count,
             COALESCE(SUM(p.amount), 0)::numeric AS payments_total
      FROM employees e
      LEFT JOIN rentals r ON r.created_by_employee_id = e.id
      LEFT JOIN payments p ON p.received_by_employee_id = e.id
      GROUP BY e.id, e.full_name
      ORDER BY rentals_count DESC, payments_total DESC
      LIMIT 10
    `),
  ]);

  const summary = summaryRows[0];
  return {
    summary: {
      totalRevenue: Number(summary?.total_revenue || 0),
      remainingAmount: Number(summary?.remaining_amount || 0),
      activeRentals: Number(summary?.active_rentals || 0),
      completedRentals: Number(summary?.completed_rentals || 0),
      overdueRentals: Number(summary?.overdue_rentals || 0),
      availableCars: Number(summary?.available_cars || 0),
      rentedCars: Number(summary?.rented_cars || 0),
    },
    topCars: topCars.map((car) => ({ ...car, revenue: Number(car.revenue) })),
    topCustomers: topCustomers.map((customer) => ({ ...customer, paid: Number(customer.paid) })),
    monthlyRevenue: monthlyRevenue.map((month) => ({ ...month, revenue: Number(month.revenue) })),
    dailyRevenue: dailyRevenue.map((day) => ({ ...day, revenue: Number(day.revenue) })),
    paymentMethods: paymentMethods.map((method) => ({
      ...method,
      revenue: Number(method.revenue),
      payments_count: Number(method.payments_count),
    })),
    employeePerformance: employeePerformance.map((item) => ({
      ...item,
      rentals_count: Number(item.rentals_count),
      payments_total: Number(item.payments_total),
    })),
  };
}
