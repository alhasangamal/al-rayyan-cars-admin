export type EmployeeRole = 'admin' | 'employee';

export type EmployeeStatus = 'active' | 'inactive';

export type RentalStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'overdue';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'wallet';

export type CarStatus = 'available' | 'rented' | 'maintenance' | 'reserved' | 'inactive';

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'cancelled';

export interface Employee {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: EmployeeRole;
  status: EmployeeStatus;
}

export interface Car {
  id: number;
  car_name: string;
  car_model: string | null;
  model_year: number | null;
  color: string | null;
  plate_number?: string;
  body_type: string | null;
  fuel_type: string | null;
  transmission: string | null;
  current_km?: number | null;
  seats: number;
  daily_rental_price: number;
  weekly_rental_price: number | null;
  monthly_rental_price: number | null;
  status: CarStatus | string;
  image_url: string | null;
  notes?: string | null;
}

export interface Customer {
  id: number;
  full_name: string;
  phone: string;
  alternate_phone: string | null;
  email: string | null;
  national_id: string | null;
  driver_license_number: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface RentalListItem {
  id: number;
  rental_number: string;
  customer_name: string;
  car_name: string;
  start_date: Date;
  end_date: Date;
  total_cost: number;
  paid_amount: number;
  remaining_amount: number;
  status: RentalStatus;
}

export interface RentalDetails extends RentalListItem {
  customer_id: number;
  car_id: number;
  daily_rate: number;
  total_days: number;
  notes: string | null;
  customer_phone: string;
  car_model: string | null;
  model_year: number | null;
  color: string | null;
  plate_number: string | null;
  cancel_reason?: string | null;
  cancelled_at?: Date | null;
  cancelled_by_employee_id?: number | null;
}

export interface RentalFile {
  id: number;
  rental_id: number;
  file_type: 'before' | 'after' | 'contract' | 'other';
  file_path: string;
  created_at: Date;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  tone: 'danger' | 'warning' | 'success' | 'neutral';
  href: string;
}

export interface PaymentListItem {
  id: number;
  receipt_number: string;
  rental_id: number;
  rental_number: string;
  customer_name: string;
  amount: number;
  payment_method: PaymentMethod;
  paid_at: Date;
}

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  rental_id: number;
  rental_number: string;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: InvoiceStatus;
  issued_at: Date;
}

export interface InvoiceDetails extends InvoiceListItem {
  customer_phone: string;
  customer_national_id: string | null;
  car_name: string;
  car_model: string | null;
  model_year: number | null;
  color: string | null;
  plate_number: string | null;
  start_date: Date;
  end_date: Date;
  total_days: number;
  employee_name: string | null;
}

export interface OfficeSettings {
  id: number;
  office_name: string;
  tagline: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  logo_path: string;
}

export interface AuditLog {
  id: number;
  employee_id: number | null;
  employee_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: Date;
}
