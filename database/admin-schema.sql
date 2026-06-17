-- Al Rayyan Cars internal admin schema
-- This schema is designed to run against the same PostgreSQL database used by the public marketing website.
-- It reuses the existing public.cars table and creates the office-management tables only.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    car_name VARCHAR(150) NOT NULL,
    car_model VARCHAR(100),
    model_year INT,
    color VARCHAR(50),
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    body_type VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50) NOT NULL DEFAULT 'Automatic',
    engine_cc INT,
    current_km INT NOT NULL DEFAULT 0,
    seats INT NOT NULL DEFAULT 5,
    daily_rental_price NUMERIC(12,2) NOT NULL,
    weekly_rental_price NUMERIC(12,2),
    monthly_rental_price NUMERIC(12,2),
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cars_status_check CHECK (status IN ('available', 'rented', 'maintenance', 'reserved', 'inactive')),
    CONSTRAINT cars_prices_check CHECK (daily_rental_price >= 0 AND (weekly_rental_price IS NULL OR weekly_rental_price >= 0) AND (monthly_rental_price IS NULL OR monthly_rental_price >= 0)),
    CONSTRAINT cars_seats_check CHECK (seats > 0),
    CONSTRAINT cars_km_check CHECK (current_km >= 0)
);

ALTER TABLE cars
  ADD COLUMN IF NOT EXISTS engine_cc INT;

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(50),
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'employee',
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employees_role_check CHECK (role IN ('admin', 'employee')),
    CONSTRAINT employees_status_check CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    alternate_phone VARCHAR(50),
    email VARCHAR(150),
    national_id VARCHAR(50) UNIQUE,
    driver_license_number VARCHAR(80),
    address TEXT,
    id_image_path TEXT,
    license_image_path TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE IF NOT EXISTS rental_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 1;

CREATE TABLE IF NOT EXISTS rentals (
    id SERIAL PRIMARY KEY,
    rental_number VARCHAR(30) NOT NULL UNIQUE,
    car_id INT NOT NULL REFERENCES cars(id) ON DELETE RESTRICT,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    created_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_return_date DATE,
    daily_rate NUMERIC(12,2) NOT NULL,
    total_days INT NOT NULL DEFAULT 1,
    total_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    notes TEXT,
    cancel_reason TEXT,
    cancelled_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rentals_status_check CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'overdue')),
    CONSTRAINT rentals_dates_check CHECK (end_date >= start_date),
    CONSTRAINT rentals_money_check CHECK (daily_rate >= 0 AND total_cost >= 0 AND paid_amount >= 0 AND remaining_amount >= 0)
);

ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

ALTER TABLE rentals
  DROP CONSTRAINT IF EXISTS rentals_no_overlapping_active_ranges;

ALTER TABLE rentals
  ADD CONSTRAINT rentals_no_overlapping_active_ranges
  EXCLUDE USING gist (
    car_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
  WHERE (status IN ('active', 'overdue'));

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    rental_id INT NOT NULL UNIQUE REFERENCES rentals(id) ON DELETE RESTRICT,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    issued_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
    invoice_file_path TEXT,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_status_check CHECK (status IN ('unpaid', 'partial', 'paid', 'cancelled')),
    CONSTRAINT invoices_money_check CHECK (
      subtotal >= 0 AND discount_amount >= 0 AND tax_amount >= 0 AND
      total_amount >= 0 AND paid_amount >= 0 AND remaining_amount >= 0
    )
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(30) NOT NULL UNIQUE,
    rental_id INT NOT NULL REFERENCES rentals(id) ON DELETE RESTRICT,
    invoice_id INT REFERENCES invoices(id) ON DELETE SET NULL,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    received_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash',
    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    receipt_file_path TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_amount_check CHECK (amount > 0),
    CONSTRAINT payments_method_check CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'wallet'))
);

CREATE TABLE IF NOT EXISTS office_settings (
    id INT PRIMARY KEY DEFAULT 1,
    office_name VARCHAR(150) NOT NULL DEFAULT 'الريان كار',
    tagline VARCHAR(200) NOT NULL DEFAULT 'تأجير سيارات بثقة وراحة',
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    logo_path TEXT NOT NULL DEFAULT '/logo-cropped.png',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT office_settings_single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    employee_name VARCHAR(150),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS car_status_logs (
    id BIGSERIAL PRIMARY KEY,
    car_id INT NOT NULL REFERENCES cars(id) ON DELETE RESTRICT,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    changed_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rental_files (
    id BIGSERIAL PRIMARY KEY,
    rental_id INT NOT NULL REFERENCES rentals(id) ON DELETE RESTRICT,
    file_type VARCHAR(30) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rental_files_type_check CHECK (file_type IN ('before', 'after', 'contract', 'other'))
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_rentals_car_dates ON rentals(car_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_payments_rental ON payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_employee ON audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_car_status_logs_car ON car_status_logs(car_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rental_files_rental ON rental_files(rental_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION make_document_number(prefix TEXT, seq_name TEXT)
RETURNS TEXT AS $$
DECLARE
  next_number BIGINT;
BEGIN
  EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_number;
  RETURN prefix || '-' || EXTRACT(YEAR FROM CURRENT_DATE)::INT || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prepare_rental()
RETURNS TRIGGER AS $$
DECLARE
  current_car_status TEXT;
BEGIN
  IF NEW.rental_number IS NULL OR NEW.rental_number = '' THEN
    NEW.rental_number = make_document_number('RENT', 'rental_number_seq');
  END IF;

  NEW.total_days = GREATEST((NEW.end_date - NEW.start_date) + 1, 1);
  NEW.total_cost = NEW.total_days * NEW.daily_rate;
  NEW.remaining_amount = GREATEST(NEW.total_cost - NEW.paid_amount, 0);

  IF NEW.status IN ('active', 'overdue') THEN
    SELECT status INTO current_car_status FROM cars WHERE id = NEW.car_id;

    IF current_car_status IS NULL THEN
      RAISE EXCEPTION 'Car % does not exist', NEW.car_id;
    END IF;

    IF (
      TG_OP = 'INSERT'
      OR OLD.status NOT IN ('active', 'overdue')
      OR OLD.car_id <> NEW.car_id
    ) AND current_car_status <> 'available' THEN
      RAISE EXCEPTION 'Car % is not available for rent', NEW.car_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_car_status_from_rental()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('active', 'overdue') THEN
    UPDATE cars SET status = 'rented' WHERE id = NEW.car_id;
  ELSIF NEW.status IN ('completed', 'cancelled') THEN
    IF NOT EXISTS (
      SELECT 1 FROM rentals
      WHERE car_id = NEW.car_id
        AND id <> NEW.id
        AND status IN ('active', 'overdue')
    ) THEN
      UPDATE cars SET status = 'available' WHERE id = NEW.car_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prepare_invoice()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number = make_document_number('INV', 'invoice_number_seq');
  END IF;

  NEW.total_amount = GREATEST(NEW.subtotal - NEW.discount_amount + NEW.tax_amount, 0);
  NEW.remaining_amount = GREATEST(NEW.total_amount - NEW.paid_amount, 0);

  IF NEW.paid_amount <= 0 THEN
    NEW.status = 'unpaid';
  ELSIF NEW.remaining_amount <= 0 THEN
    NEW.status = 'paid';
  ELSE
    NEW.status = 'partial';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prepare_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
    NEW.receipt_number = make_document_number('REC', 'receipt_number_seq');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_payment_totals()
RETURNS TRIGGER AS $$
DECLARE
  target_rental_id INT;
  total_paid NUMERIC(12,2);
BEGIN
  target_rental_id = COALESCE(NEW.rental_id, OLD.rental_id);

  SELECT COALESCE(SUM(amount), 0)
  INTO total_paid
  FROM payments
  WHERE rental_id = target_rental_id;

  UPDATE rentals
  SET paid_amount = total_paid,
      remaining_amount = GREATEST(total_cost - total_paid, 0),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = target_rental_id;

  UPDATE invoices
  SET paid_amount = total_paid,
      remaining_amount = GREATEST(total_amount - total_paid, 0),
      status = CASE
        WHEN total_paid <= 0 THEN 'unpaid'
        WHEN GREATEST(total_amount - total_paid, 0) <= 0 THEN 'paid'
        ELSE 'partial'
      END,
      updated_at = CURRENT_TIMESTAMP
  WHERE rental_id = target_rental_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_rentals_prepare ON rentals;
CREATE TRIGGER trg_rentals_prepare
BEFORE INSERT OR UPDATE ON rentals
FOR EACH ROW EXECUTE FUNCTION prepare_rental();

DROP TRIGGER IF EXISTS trg_rentals_sync_car_status ON rentals;
CREATE TRIGGER trg_rentals_sync_car_status
AFTER INSERT OR UPDATE OF status ON rentals
FOR EACH ROW EXECUTE FUNCTION sync_car_status_from_rental();

DROP TRIGGER IF EXISTS trg_invoices_prepare ON invoices;
CREATE TRIGGER trg_invoices_prepare
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION prepare_invoice();

DROP TRIGGER IF EXISTS trg_payments_prepare ON payments;
CREATE TRIGGER trg_payments_prepare
BEFORE INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION prepare_payment();

DROP TRIGGER IF EXISTS trg_payments_sync_totals_insert ON payments;
CREATE TRIGGER trg_payments_sync_totals_insert
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION sync_payment_totals();

DROP TRIGGER IF EXISTS trg_office_settings_updated_at ON office_settings;
CREATE TRIGGER trg_office_settings_updated_at
BEFORE UPDATE ON office_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cars_updated_at ON cars;
CREATE TRIGGER trg_cars_updated_at
BEFORE UPDATE ON cars
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE VIEW overdue_rentals AS
SELECT *
FROM rentals
WHERE status IN ('active', 'overdue')
  AND end_date < CURRENT_DATE;

COMMENT ON TABLE cars IS 'Fleet cars available for rent.';
COMMENT ON TABLE employees IS 'Internal system users: admins and employees.';
COMMENT ON TABLE customers IS 'Rental customers. Customers with history should be marked inactive instead of deleted.';
COMMENT ON TABLE rentals IS 'Rental contracts linked to public cars table.';
COMMENT ON TABLE payments IS 'Rental payment receipts.';
COMMENT ON TABLE invoices IS 'Rental invoices.';
COMMENT ON TABLE office_settings IS 'Single-row office profile used by the admin UI and invoices.';
COMMENT ON TABLE audit_logs IS 'System audit trail for employee actions.';
COMMENT ON TABLE car_status_logs IS 'Status lifecycle events for cars.';
COMMENT ON TABLE rental_files IS 'Files attached to rental contracts, including before/after car photos.';

INSERT INTO employees (
    full_name,
    username,
    email,
    phone,
    password_hash,
    role,
    status
)
VALUES (
    'مدير النظام',
    'admin',
    'admin@alrayyan-cars.com',
    '01033257024',
    '$2b$12$7m3gJqB.qs4RHevPuvYfTeY9HunySMiD0dIZpd43VbsCjuXhT9BCW',
    'admin',
    'active'
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO office_settings (
    id,
    office_name,
    tagline,
    phone,
    whatsapp,
    email,
    address,
    logo_path
)
VALUES (
    1,
    'الريان كار',
    'تأجير سيارات بثقة وراحة',
    '01033257024',
    '01033257024',
    'admin@alrayyan-cars.com',
    'مصر',
    '/logo-cropped.png'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (
    full_name,
    phone,
    alternate_phone,
    email,
    national_id,
    driver_license_number,
    address,
    notes,
    is_active
)
VALUES
(
    'أحمد محمود علي',
    '01011112222',
    '01033334444',
    'ahmed@example.com',
    '29801011234567',
    'DL-102030',
    'القاهرة - مدينة نصر',
    'عميل دائم يفضل السيارات السيدان.',
    TRUE
),
(
    'محمد حسن',
    '01055556666',
    NULL,
    'mohamed@example.com',
    '29505017654321',
    'DL-405060',
    'الجيزة - الدقي',
    'يفضل سيارات SUV للسفر.',
    TRUE
),
(
    'سارة عبد الرحمن',
    '01077778888',
    NULL,
    'sara@example.com',
    '30009019876543',
    'DL-708090',
    'القاهرة - التجمع الخامس',
    'تواصل عبر واتساب.',
    TRUE
)
ON CONFLICT (national_id) DO NOTHING;

INSERT INTO cars (
    car_name,
    car_model,
    model_year,
    color,
    plate_number,
    body_type,
    fuel_type,
    transmission,
    current_km,
    seats,
    daily_rental_price,
    weekly_rental_price,
    monthly_rental_price,
    status
)
VALUES
(
    'هيونداي إلنترا',
    'Elantra CN7',
    2023,
    'فضي',
    'س ص ج 1234',
    'Sedan',
    'Gasoline',
    'Automatic',
    15000,
    5,
    800.00,
    5000.00,
    18000.00,
    'available'
),
(
    'كيا سبورتاج',
    'Sportage',
    2024,
    'أسود',
    'أ ب ت 5678',
    'SUV',
    'Gasoline',
    'Automatic',
    8000,
    5,
    1500.00,
    9000.00,
    32000.00,
    'available'
),
(
    'تويوتا كورولا',
    'Corolla',
    2022,
    'أبيض',
    'ر و ق 9101',
    'Sedan',
    'Gasoline',
    'Automatic',
    35000,
    5,
    750.00,
    4500.00,
    16000.00,
    'available'
)
ON CONFLICT (plate_number) DO NOTHING;
