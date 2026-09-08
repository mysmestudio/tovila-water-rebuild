-- =====================================================================
-- TOVILA ONLINE SHOP - SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- =====================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean up existing tables if re-running (safe cascade)
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS services CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE;

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('product', 'service', 'mixed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  unit TEXT NOT NULL DEFAULT 'per unit',
  sku TEXT NOT NULL UNIQUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  starting_price NUMERIC(10, 2) NOT NULL CHECK (starting_price >= 0),
  deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  deposit_type TEXT NOT NULL CHECK (deposit_type IN ('fixed', 'percentage')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT,
  site_address TEXT,
  preferred_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'fulfilled', 'delivered', 'cancelled')),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  amount_due NUMERIC(10, 2) NOT NULL CHECK (amount_due >= 0),
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  paystack_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'service')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  price_snapshot NUMERIC(10, 2) NOT NULL CHECK (price_snapshot >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ADMIN_USERS TABLE (links to Supabase auth.users via user UUID)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper security function: checks whether the current caller is an authenticated admin user
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- CATEGORIES POLICIES
-- ---------------------------------------------------------------------
-- Anyone can view categories on the storefront
DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

-- Only verified admin users can insert, update, or delete categories
DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- PRODUCTS POLICIES
-- ---------------------------------------------------------------------
-- Public storefront can only view active products. Admins can view all products (including inactive).
DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select"
  ON products FOR SELECT
  USING (active = true OR public.is_admin());

-- Only admins can add, edit, deactivate, or adjust prices/stock
DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all"
  ON products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- SERVICES POLICIES
-- ---------------------------------------------------------------------
-- Public storefront can view active services. Admins can view all services.
DROP POLICY IF EXISTS "services_select" ON services;
CREATE POLICY "services_select"
  ON services FOR SELECT
  USING (active = true OR public.is_admin());

-- Only admins can add or edit services
DROP POLICY IF EXISTS "services_admin_all" ON services;
CREATE POLICY "services_admin_all"
  ON services FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- ORDERS POLICIES
-- ---------------------------------------------------------------------
-- 1. Storefront users CANNOT read orders list or another customer's orders (PII protection).
--    Only authenticated admin users can read orders.
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
CREATE POLICY "orders_select_admin"
  ON orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 2. Public storefront can INSERT a new pending order at checkout.
--    Enforces that public orders MUST start with status 'pending' and amount_paid 0.
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT
  WITH CHECK (status = 'pending' AND amount_paid = 0);

-- 3. Public storefront CANNOT update orders.
--    Only admins can update orders (e.g. mark processing/fulfilled/delivered).
--    The Paystack webhook updates payment to 'paid' via the backend service_role key,
--    which safely bypasses RLS at the server level.
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_delete_admin" ON orders;
CREATE POLICY "orders_delete_admin"
  ON orders FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------
-- ORDER ITEMS POLICIES
-- ---------------------------------------------------------------------
-- Only admins can read order items
DROP POLICY IF EXISTS "order_items_select_admin" ON order_items;
CREATE POLICY "order_items_select_admin"
  ON order_items FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Public checkout can insert order items when creating an order
DROP POLICY IF EXISTS "order_items_insert_public" ON order_items;
CREATE POLICY "order_items_insert_public"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Only admins can modify or delete order items
DROP POLICY IF EXISTS "order_items_admin_modify" ON order_items;
CREATE POLICY "order_items_admin_modify"
  ON order_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- ADMIN USERS POLICIES
-- ---------------------------------------------------------------------
-- Authenticated users can check if their own UID is in the admin_users table
DROP POLICY IF EXISTS "admin_users_select" ON admin_users;
CREATE POLICY "admin_users_select"
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- Only existing admins can insert or update admin_users
DROP POLICY IF EXISTS "admin_users_modify" ON admin_users;
CREATE POLICY "admin_users_modify"
  ON admin_users FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- =====================================================================
-- SEED DATA (3 Categories + Placeholder Products & Services)
-- =====================================================================

-- Clean inserts with fixed IDs or slugs for idempotent execution
INSERT INTO categories (id, name, slug, type) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Dispenser Drinking Water Supply', 'dispenser-drinking-water', 'product'),
  ('c2000000-0000-0000-0000-000000000002', 'Water Treatment Products & Services', 'water-treatment', 'mixed'),
  ('c3000000-0000-0000-0000-000000000003', 'Borehole Drilling Services', 'borehole-drilling', 'service')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- CATEGORY 1: Products
INSERT INTO products (id, category_id, name, slug, description, price, unit, sku, stock_quantity, image_url, active) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '18.9L Refillable Water Bottle', '18-9l-refillable-water-bottle', 'Multi-stage purified drinking water in a heavy-duty polycarbonate bottle. Compatible with standard water dispensers.', 25.00, 'per bottle', 'DW-189L', 200, '/img/shop/bottle-18-9l.svg', true),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', '10L Water Dispenser Bottle', '10l-water-dispenser-bottle', 'Compact 10L purified drinking water container for smaller offices, homes, and countertop dispensers.', 15.00, 'per bottle', 'DW-10L', 150, '/img/shop/bottle-10l.svg', true),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', '500ml Sachet Water (Pack of 30)', '500ml-sachet-water-pack-30', 'Certified pure drinking water sealed in hygienic 500ml sachets. Convenient bundle pack of 30 for households and events.', 20.00, 'pack of 30', 'DW-SACHET-30', 500, '/img/shop/sachet-pack.svg', true),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', '1.5L Bottled Water (Pack of 12)', '1-5l-bottled-water-pack-12', 'Premium bottled drinking water, perfectly mineralized for daily hydration. Pack of 12 durable PET bottles.', 48.00, 'pack of 12', 'DW-15L-12', 100, '/img/shop/bottles-1-5l.svg', true),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Countertop Water Dispenser (Hot & Cold)', 'countertop-water-dispenser-hot-cold', 'Space-saving electronic dispenser providing instant piping hot water and chilled drinking water with child safety locks.', 850.00, 'per unit', 'WD-CT-HC', 20, '/img/shop/dispenser-countertop.svg', true),
  ('p1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Floor-Standing Water Dispenser (Hot & Cold)', 'floor-standing-water-dispenser-hot-cold', 'Commercial-grade freestanding hot and cold water dispenser with stainless steel reservoir and bottom storage cabinet.', 1200.00, 'per unit', 'WD-FS-HC', 15, '/img/shop/dispenser-floor.svg', true),
  ('p1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'Monthly Water Refill Subscription (4× 18.9L/month)', 'monthly-water-refill-subscription-4x18-9l', 'Scheduled weekly deliveries directly to your home or office. Includes 4× 18.9L refill bottles per month with free container exchange.', 90.00, 'per month', 'SUB-189L-4', 999, '/img/shop/subscription-monthly.svg', true)
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  description = EXCLUDED.description;

-- CATEGORY 2: Products
INSERT INTO products (id, category_id, name, slug, description, price, unit, sku, stock_quantity, image_url, active) VALUES
  ('p2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000002', 'Replacement Sediment Filter Cartridge', 'replacement-sediment-filter-cartridge', '5-micron spun polypropylene sediment filter. Traps silt, sand, rust, and particulate matter before fine filtration.', 45.00, 'per cartridge', 'WT-SED-10', 80, '/img/shop/filter-sediment.svg', true),
  ('p2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'Replacement Carbon Filter Cartridge', 'replacement-carbon-filter-cartridge', 'High-absorption extruded activated carbon block. Removes chlorine, odors, pesticides, and organic chemical contaminants.', 55.00, 'per cartridge', 'WT-CARB-10', 80, '/img/shop/filter-carbon.svg', true),
  ('p2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 'Replacement RO Membrane (50/75 GPD)', 'replacement-ro-membrane', 'Thin-film composite (TFC) reverse osmosis membrane element. Rejects 97%+ of total dissolved solids, heavy metals, and bacteria.', 180.00, 'per membrane', 'WT-RO-MEM', 40, '/img/shop/ro-membrane.svg', true),
  ('p2000000-0000-0000-0000-000000000004', 'c2000000-0000-0000-0000-000000000002', 'Home Water Test Kit', 'home-water-test-kit', 'Rapid multi-parameter test kit checking pH, total hardness, iron, chlorine, nitrates, and TDS. Includes colorimetric comparator chart.', 60.00, 'per kit', 'WT-TEST-KIT', 60, '/img/shop/water-test-kit.svg', true)
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  description = EXCLUDED.description;

-- CATEGORY 2: Services
INSERT INTO services (id, category_id, name, slug, description, starting_price, deposit_amount, deposit_type, active) VALUES
  ('s2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000002', 'Water Treatment System Installation', 'water-treatment-system-installation', 'Full turnkey installation of home or commercial water filtration/RO systems by Tovila certified engineers. Balance payable upon commissioning.', 1500.00, 300.00, 'fixed', true),
  ('s2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'Annual System Maintenance & Service', 'annual-system-maintenance-service', 'Complete 12-month preventive service covering filter replacements, pump inspection, pressure testing, and water quality recalibration.', 250.00, 250.00, 'fixed', true),
  ('s2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 'RO System Cleaning & Sanitisation', 'ro-system-cleaning-sanitisation', 'Deep chemical flushing of membrane housings, antimicrobial sanitisation of storage pressure tanks, and flow rate validation.', 180.00, 180.00, 'fixed', true),
  ('s2000000-0000-0000-0000-000000000004', 'c2000000-0000-0000-0000-000000000002', 'Water Quality Testing & Consultation (in-person)', 'water-quality-testing-consultation-in-person', 'On-site water sampling, digital electrochemical probe measurements, and comprehensive engineer assessment report for your site.', 120.00, 120.00, 'fixed', true)
ON CONFLICT (slug) DO UPDATE SET
  starting_price = EXCLUDED.starting_price,
  deposit_amount = EXCLUDED.deposit_amount,
  description = EXCLUDED.description;

-- CATEGORY 3: Services (Borehole Drilling)
INSERT INTO services (id, category_id, name, slug, description, starting_price, deposit_amount, deposit_type, active) VALUES
  ('s3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000003', 'Residential Borehole Drilling', 'residential-borehole-drilling', 'Rotary rig borehole drilling up to 80m depth for private homes. Includes geophysical site survey, casing installation, and pump testing. Deposit GHS 2,000.', 12000.00, 2000.00, 'fixed', true),
  ('s3000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000003', 'Commercial/Institutional Borehole Drilling', 'commercial-institutional-borehole-drilling', 'Heavy-duty deep aquifer borehole drilling for factories, hospitals, universities, and commercial estates. High-yield yield logging. Deposit GHS 5,000.', 35000.00, 5000.00, 'fixed', true),
  ('s3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', 'Borehole Rehabilitation & Redrilling', 'borehole-rehabilitation-redrilling', 'High-pressure air compressor flushing, screen descaling, yield restoration, and damaged casing recovery for silted wells. Deposit GHS 1,000.', 6000.00, 1000.00, 'fixed', true),
  ('s3000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000003', 'Hydro-geological Site Survey', 'hydro-geological-site-survey', 'Advanced electrical resistivity profiling and groundwater table mapping to pinpoint optimal drilling coordinates before drilling starts.', 800.00, 800.00, 'fixed', true)
ON CONFLICT (slug) DO UPDATE SET
  starting_price = EXCLUDED.starting_price,
  deposit_amount = EXCLUDED.deposit_amount,
  description = EXCLUDED.description;
