import { query } from './db';

export interface CommandSearchItem {
  id: string;
  label: string;
  description: string;
  href: string;
  type: 'car' | 'customer' | 'rental';
}

export async function getCommandSearchItems(): Promise<CommandSearchItem[]> {
  const [cars, customers, rentals] = await Promise.all([
    query<{ id: number; car_name: string; plate_number: string | null; status: string }>(`
      SELECT id, car_name, plate_number, status FROM cars ORDER BY updated_at DESC LIMIT 80
    `),
    query<{ id: number; full_name: string; phone: string }>(`
      SELECT id, full_name, phone FROM customers ORDER BY created_at DESC LIMIT 80
    `),
    query<{ id: number; rental_number: string; customer_name: string; status: string }>(`
      SELECT r.id, r.rental_number, c.full_name AS customer_name, r.status
      FROM rentals r
      JOIN customers c ON c.id = r.customer_id
      ORDER BY r.created_at DESC
      LIMIT 80
    `),
  ]);

  return [
    ...cars.map((car) => ({
      id: `car-${car.id}`,
      type: 'car' as const,
      label: car.car_name,
      description: `${car.plate_number || 'بدون لوحة'} - ${car.status}`,
      href: `/cars/${car.id}/edit`,
    })),
    ...customers.map((customer) => ({
      id: `customer-${customer.id}`,
      type: 'customer' as const,
      label: customer.full_name,
      description: customer.phone,
      href: `/customers/${customer.id}`,
    })),
    ...rentals.map((rental) => ({
      id: `rental-${rental.id}`,
      type: 'rental' as const,
      label: rental.rental_number,
      description: `${rental.customer_name} - ${rental.status}`,
      href: `/rentals/${rental.id}`,
    })),
  ];
}
