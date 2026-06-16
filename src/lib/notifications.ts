import { NotificationItem } from '@/types';
import { query } from './db';

export async function getNotificationItems(): Promise<NotificationItem[]> {
  const [overdueRentals, dueToday, pendingPayments, maintenanceCars] = await Promise.all([
    query<{ id: number; rental_number: string; customer_name: string }>(`
      SELECT r.id, r.rental_number, c.full_name AS customer_name
      FROM rentals r
      JOIN customers c ON c.id = r.customer_id
      WHERE r.status IN ('active', 'overdue') AND r.end_date < CURRENT_DATE
      ORDER BY r.end_date ASC
      LIMIT 5
    `),
    query<{ id: number; rental_number: string; customer_name: string }>(`
      SELECT r.id, r.rental_number, c.full_name AS customer_name
      FROM rentals r
      JOIN customers c ON c.id = r.customer_id
      WHERE r.status IN ('active', 'overdue') AND r.end_date = CURRENT_DATE
      ORDER BY r.end_date ASC
      LIMIT 5
    `),
    query<{ id: number; rental_number: string; remaining_amount: number }>(`
      SELECT id, rental_number, remaining_amount
      FROM rentals
      WHERE status IN ('active', 'overdue') AND remaining_amount > 0
      ORDER BY remaining_amount DESC
      LIMIT 5
    `),
    query<{ id: number; car_name: string }>(`
      SELECT id, car_name
      FROM cars
      WHERE status = 'maintenance' AND updated_at < CURRENT_DATE - INTERVAL '7 days'
      ORDER BY updated_at ASC
      LIMIT 5
    `),
  ]);

  return [
    ...overdueRentals.map((item) => ({
      id: `overdue-${item.id}`,
      title: 'تأجير متأخر',
      description: `${item.rental_number} - ${item.customer_name}`,
      tone: 'danger' as const,
      href: `/rentals/${item.id}`,
    })),
    ...dueToday.map((item) => ({
      id: `today-${item.id}`,
      title: 'سيارة راجعة اليوم',
      description: `${item.rental_number} - ${item.customer_name}`,
      tone: 'warning' as const,
      href: `/rentals/${item.id}`,
    })),
    ...pendingPayments.map((item) => ({
      id: `pending-${item.id}`,
      title: 'دفعة متبقية',
      description: `${item.rental_number} - ${Number(item.remaining_amount).toLocaleString('en-US')} جنيه`,
      tone: 'warning' as const,
      href: `/rentals/${item.id}`,
    })),
    ...maintenanceCars.map((item) => ({
      id: `maintenance-${item.id}`,
      title: 'صيانة طويلة',
      description: item.car_name,
      tone: 'neutral' as const,
      href: `/cars/${item.id}/edit`,
    })),
  ].slice(0, 12);
}
