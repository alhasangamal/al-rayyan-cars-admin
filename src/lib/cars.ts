import { Car } from '@/types';
import { query } from './db';

export async function getAdminCars(): Promise<Car[]> {
  const cars = await query<Car>(
    `SELECT id, car_name, car_model, model_year, color, plate_number, body_type, fuel_type,
            transmission, current_km, seats, daily_rental_price, weekly_rental_price,
            monthly_rental_price, status, image_url, notes
     FROM cars
     ORDER BY id ASC`
  );

  return cars.map((car) => ({
    ...car,
    daily_rental_price: Number(car.daily_rental_price),
    weekly_rental_price: car.weekly_rental_price ? Number(car.weekly_rental_price) : null,
    monthly_rental_price: car.monthly_rental_price ? Number(car.monthly_rental_price) : null,
  }));
}

export async function getCarById(id: number): Promise<Car | null> {
  const cars = await query<Car>(
    `SELECT id, car_name, car_model, model_year, color, plate_number, body_type, fuel_type,
            transmission, current_km, seats, daily_rental_price, weekly_rental_price,
            monthly_rental_price, status, image_url, notes
     FROM cars
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  const car = cars[0];
  if (!car) return null;

  return {
    ...car,
    daily_rental_price: Number(car.daily_rental_price),
    weekly_rental_price: car.weekly_rental_price ? Number(car.weekly_rental_price) : null,
    monthly_rental_price: car.monthly_rental_price ? Number(car.monthly_rental_price) : null,
  };
}

export async function getCarStatusLogs(carId: number): Promise<Array<{
  id: number;
  old_status: string | null;
  new_status: string;
  reason: string | null;
  employee_name: string | null;
  created_at: Date;
}>> {
  return query(
    `SELECT l.id, l.old_status, l.new_status, l.reason, e.full_name AS employee_name, l.created_at
     FROM car_status_logs l
     LEFT JOIN employees e ON e.id = l.changed_by_employee_id
     WHERE l.car_id = $1
     ORDER BY l.created_at DESC
     LIMIT 20`,
    [carId]
  );
}
