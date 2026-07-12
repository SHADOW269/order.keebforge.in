-- =============================================================================
-- KeebForge Order Management & Customer Tracking
-- Production Database Schema
-- PostgreSQL 17 / Supabase Free Tier / Vercel
-- =============================================================================
--
-- This single migration initializes an empty Supabase project from scratch.
-- It is idempotent (safe to apply exactly once) and replaces all prior
-- migration files.
--
-- Design priorities (in order):
--   1. Security — pass Supabase Security Advisor with zero Critical issues
--   2. Data integrity — CHECK constraints on every validated column
--   3. Performance — indexes only where queries need them, covering indexes
--      for dashboard paths, LATERAL joins instead of correlated subqueries
--   4. Maintainability — explicit grants, RLS on every table, no unused objects
--   5. Scalability — schema supports 10K+ orders, multiple admins, and future
--      features (workshops, attachments, audit logs) without major changes
--
-- ── Table of Contents ────────────────────────────────────────────────────────
--   1. Extensions
--   2. Enums
--   3. Tables (15)
--      3.1  profiles
--      3.2  customers
--      3.3  addresses
--      3.4  orders
--      3.5  order_products
--      3.6  order_services
--      3.7  order_custom_work
--      3.8  shipping_info
--      3.9  payments
--      3.10 order_timeline
--      3.11 customer_messages
--      3.12 admin_customer_notes
--      3.13 admin_internal_notes
--      3.14 warranty_records
--      3.15 order_tracking (denormalized — public-facing)
--   4. Indexes
--   5. Trigger: updated_at
--   6. Functions
--      6.1 trigger_set_updated_at()
--      6.2 generate_order_number()
--      6.3 is_admin()
--      6.4 sync_order_tracking()
--   7. Views
--      7.1 admin_orders_list
--      7.2 admin_order_kpis
--   8. Row Level Security
--   9. Grants
-- =============================================================================


-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ENUMS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TYPE product_type AS ENUM (
  'keyboard',
  'switch',
  'keycap',
  'mouse',
  'pcb',
  'components'
);

CREATE TYPE payment_status AS ENUM (
  'Payment Pending',
  'Partially Paid',
  'Paid'
);

CREATE TYPE shipping_status AS ENUM (
  'Not Dispatched',
  'Dispatched',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Returned'
);

CREATE TYPE custom_work_category AS ENUM (
  'keyboard',
  'mouse'
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 3.1 profiles (admin/staff accounts linked to Supabase Auth) ──────────────
-- Every admin or staff member must have a row here, linked to their auth.users
-- record.  There is no auto-create trigger — profiles are inserted explicitly
-- by an existing admin.

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.2 customers ────────────────────────────────────────────────────────────
-- Email uniqueness is enforced via a functional lower() index (case-insensitive)
-- rather than a plain UNIQUE constraint, so "User@Example.com" and
-- "user@example.com" are treated as the same customer.

CREATE TABLE customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  discord_username TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Basic email format validation
  CONSTRAINT customers_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

  -- Indian phone numbers: +91 followed by exactly 10 digits
  CONSTRAINT customers_phone_format
    CHECK (phone IS NULL OR phone ~ '^\+91[0-9]{10}$')
);


-- ── 3.3 addresses ────────────────────────────────────────────────────────────
-- At most one address per customer can be the default (enforced by a partial
-- unique index, not a CHECK constraint, because DEFAULT behaviour depends on
-- a boolean flag).

CREATE TABLE addresses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  street_address TEXT,
  city           TEXT,
  state          TEXT,
  pincode        TEXT,
  is_default     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Indian pincode: exactly 6 digits
  CONSTRAINT addresses_pincode_format
    CHECK (pincode IS NULL OR pincode ~ '^\d{6}$')
);


-- ── 3.4 orders ───────────────────────────────────────────────────────────────
-- The central order record.  Soft-delete via is_deleted so orders can be
-- recovered.  billing_details is a JSONB blob populated by the application;
-- the DB only enforces non-negative estimated_total.

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT NOT NULL UNIQUE,
  customer_id      UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  address_id       UUID REFERENCES addresses(id) ON DELETE SET NULL,
  service_type     TEXT,
  current_status   TEXT NOT NULL DEFAULT 'Order Received',
  order_summary    TEXT,
  estimated_total  NUMERIC(12,2),
  billing_details  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_deleted       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT orders_estimated_total_non_negative
    CHECK (estimated_total IS NULL OR estimated_total >= 0)
);


-- ── 3.5 order_products ──────────────────────────────────────────────────────
-- Line items for each order.  Prices are tracked in billing_details JSON on
-- the order; this table records what was ordered, not how much it cost.
-- This avoids duplicating price data that changes over time.

CREATE TABLE order_products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type       product_type NOT NULL,
  name       TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.6 order_services ──────────────────────────────────────────────────────
-- Services selected for an order (e.g. "assembly", "tuning", "lubing").
-- service_id is a free-text identifier defined by the application.

CREATE TABLE order_services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id  TEXT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10,2),
  line_total  NUMERIC(10,2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT order_services_quantity_non_negative
    CHECK (quantity >= 0),
  CONSTRAINT order_services_unit_price_non_negative
    CHECK (unit_price IS NULL OR unit_price >= 0),
  CONSTRAINT order_services_line_total_non_negative
    CHECK (line_total IS NULL OR line_total >= 0)
);


-- ── 3.7 order_custom_work ────────────────────────────────────────────────────
-- Custom work items (keyboard builds, mouse mods, etc.) with their own pricing.

CREATE TABLE order_custom_work (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  category    custom_work_category NOT NULL DEFAULT 'keyboard',
  title       TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity    INT NOT NULL DEFAULT 1,
  notes       TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT order_custom_work_price_non_negative
    CHECK (price >= 0),
  CONSTRAINT order_custom_work_quantity_non_negative
    CHECK (quantity >= 0)
);


-- ── 3.8 shipping_info ────────────────────────────────────────────────────────
-- One shipping record per order.  UNIQUE constraint on order_id enforces 1:1.

CREATE TABLE shipping_info (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  courier                 TEXT,
  tracking_number         TEXT,
  tracking_url            TEXT,
  shipping_status         shipping_status NOT NULL DEFAULT 'Not Dispatched',
  shipping_cost           NUMERIC(10,2) NOT NULL DEFAULT 0,
  packaging_cost          NUMERIC(10,2) NOT NULL DEFAULT 0,
  estimated_dispatch_date DATE,
  estimated_delivery_date DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT shipping_info_cost_non_negative
    CHECK (shipping_cost >= 0),
  CONSTRAINT shipping_info_packaging_cost_non_negative
    CHECK (packaging_cost >= 0),
  CONSTRAINT shipping_info_dates_ordered
    CHECK (
      estimated_dispatch_date IS NULL
      OR estimated_delivery_date IS NULL
      OR estimated_delivery_date >= estimated_dispatch_date
    )
);


-- ── 3.9 payments ─────────────────────────────────────────────────────────────

CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount_paid    NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'Payment Pending',
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT payments_amount_non_negative
    CHECK (amount_paid >= 0)
);


-- ── 3.10 order_timeline ──────────────────────────────────────────────────────
-- Immutable audit trail of status changes.

CREATE TABLE order_timeline (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.11 customer_messages ───────────────────────────────────────────────────
-- Messages sent from the customer to the admin through the tracking page.

CREATE TABLE customer_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.12 admin_customer_notes ────────────────────────────────────────────────
-- Notes written by the admin that ARE visible to the customer on the tracking
-- page.

CREATE TABLE admin_customer_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.13 admin_internal_notes ────────────────────────────────────────────────
-- Notes written by the admin that are NOT visible to the customer.  RLS ensures
-- only authenticated admins can see these.

CREATE TABLE admin_internal_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.14 warranty_records ────────────────────────────────────────────────────
-- 1:1 warranty information per order.

CREATE TABLE warranty_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  warranty_status  TEXT,
  warranty_start   DATE,
  warranty_end     DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT warranty_dates_ordered
    CHECK (
      warranty_start IS NULL
      OR warranty_end IS NULL
      OR warranty_end >= warranty_start
    )
);


-- ── 3.15 order_tracking (denormalized — public-facing) ───────────────────────
-- ARCHITECTURE DECISION: intentionally denormalized.
--
-- The customer tracking page is the most-frequently accessed public endpoint.
-- It needs data from 11 different tables.  Joining all 11 on every page load
-- would add significant latency and database load.  Instead, this table acts
-- as a read-optimized cache that is populated synchronously by
-- sync_order_tracking() after every mutation.
--
-- Trade-off: data is duplicated and must be kept in sync.  The sync function
-- is called from every API write route, so lag is minimal.  If the sync call
-- fails, stale data may be served until the next successful sync.
--
-- Security: anon (unauthenticated) users can SELECT from this table, which is
-- required for the public tracking page.  The table contains no customer PII
-- (name, email, phone, address) — only order status and shipping info.

CREATE TABLE order_tracking (
  order_id          UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  order_number      TEXT NOT NULL,
  status            TEXT,
  service_type      TEXT,
  products          JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_services JSONB NOT NULL DEFAULT '{}'::jsonb,
  billing_summary   JSONB NOT NULL DEFAULT '{}'::jsonb,
  estimated_total   NUMERIC(12,2),
  payment_status    TEXT,
  shipping_status   TEXT,
  tracking_number   TEXT,
  tracking_url      TEXT,
  courier           TEXT,
  estimated_dispatch  DATE,
  estimated_delivery  DATE,
  customer_notes    JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline          JSONB NOT NULL DEFAULT '[]'::jsonb,
  warranty_status   TEXT,
  warranty_start    DATE,
  warranty_end      DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT order_tracking_estimated_total_non_negative
    CHECK (estimated_total IS NULL OR estimated_total >= 0)
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Each index serves at least one query path confirmed by the application code.
-- No index is purely speculative.  Indexes that duplicate a UNIQUE constraint
-- index (auto-created) have been omitted.

-- ── customers ────────────────────────────────────────────────────────────────
-- Case-insensitive unique email lookup for dedup on order creation.
CREATE UNIQUE INDEX idx_customers_email ON customers (lower(email));

-- Unique phone lookup (partial — only indexed when phone is provided).
CREATE UNIQUE INDEX idx_customers_phone ON customers (phone) WHERE phone IS NOT NULL;

-- ── addresses ────────────────────────────────────────────────────────────────
-- FK lookup by customer_id (used when listing a customer's saved addresses).
CREATE INDEX idx_addresses_customer ON addresses (customer_id);

-- At most one default address per customer.
CREATE UNIQUE INDEX idx_addresses_single_default
  ON addresses (customer_id) WHERE is_default = true;

-- ── orders ───────────────────────────────────────────────────────────────────
-- FK lookups.
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_address  ON orders (address_id);

-- Dashboard: filter by status.
CREATE INDEX idx_orders_status ON orders (current_status);

-- Dashboard: sort by creation date.
CREATE INDEX idx_orders_created ON orders (created_at DESC);

-- Dashboard: covering index for the main "all orders" query
-- (sort by created_at DESC, filter by is_deleted = false, select status + total).
CREATE INDEX idx_orders_dashboard
  ON orders (created_at DESC, current_status, estimated_total)
  WHERE is_deleted = false;

-- Order detail page / API: lookup by order_number (only undeleted orders).
CREATE INDEX idx_orders_number_lookup
  ON orders (order_number)
  WHERE is_deleted = false;

-- ── order_products ───────────────────────────────────────────────────────────
CREATE INDEX idx_order_products_order ON order_products (order_id, sort_order);

-- ── order_services ───────────────────────────────────────────────────────────
CREATE INDEX idx_order_services_order ON order_services (order_id);

-- ── order_custom_work ────────────────────────────────────────────────────────
CREATE INDEX idx_order_custom_work_order ON order_custom_work (order_id, sort_order);

-- ── payments ─────────────────────────────────────────────────────────────────
-- Used by the timeline status view subquery (ORDER BY created_at DESC).
CREATE INDEX idx_payments_order ON payments (order_id, created_at DESC);

-- ── order_timeline ───────────────────────────────────────────────────────────
CREATE INDEX idx_order_timeline_order ON order_timeline (order_id, created_at DESC);

-- ── customer_messages ────────────────────────────────────────────────────────
CREATE INDEX idx_customer_messages_order ON customer_messages (order_id, created_at DESC);

-- ── admin_customer_notes ─────────────────────────────────────────────────────
CREATE INDEX idx_admin_customer_notes_order ON admin_customer_notes (order_id, created_at DESC);

-- ── admin_internal_notes ─────────────────────────────────────────────────────
CREATE INDEX idx_admin_internal_notes_order ON admin_internal_notes (order_id, created_at DESC);

-- ── order_tracking ───────────────────────────────────────────────────────────
-- Public tracking page: lookup by order_number.
CREATE INDEX idx_order_tracking_number ON order_tracking (order_number);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. TRIGGER: updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON shipping_info
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON warranty_records
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON order_tracking
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 6.1 trigger_set_updated_at() ──────────────────────────────────────────────
-- (Defined above in section 5, adjacent to its triggers.)

-- ── 6.2 generate_order_number() ──────────────────────────────────────────────
-- Generates a random order number in the format KF followed by 6 alphanumeric
-- characters (e.g. "KF3A9X2").  The uniqueness guarantee comes from the UNIQUE
-- constraint on orders.order_number; collisions are handled by the application.

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'KF';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 6.3 is_admin() ───────────────────────────────────────────────────────────
-- Returns TRUE if the calling user has an active profile with role 'admin' or
-- 'staff'.  Must be SECURITY DEFINER so RLS policies can check profiles without
-- needing direct SELECT grants on the profiles table.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 6.4 sync_order_tracking(p_order_id) ──────────────────────────────────────
-- Synchronises the denormalised order_tracking record for a given order.
-- Called by the application via RPC after every write to any order-related
-- table.  Uses explicit column lists (no SELECT *) for performance and
-- maintainability.

CREATE OR REPLACE FUNCTION sync_order_tracking(p_order_id UUID)
RETURNS void
SET search_path = public
AS $$
DECLARE
  v_order_id             UUID;
  v_order_number         TEXT;
  v_current_status       TEXT;
  v_service_type         TEXT;
  v_estimated_total      NUMERIC(12,2);
  v_billing_details      JSONB;
  v_is_deleted           BOOLEAN;

  v_shipping_status      shipping_status;
  v_tracking_number      TEXT;
  v_tracking_url         TEXT;
  v_courier              TEXT;
  v_shipping_cost        NUMERIC(10,2);
  v_packaging_cost       NUMERIC(10,2);
  v_estimated_dispatch   DATE;
  v_estimated_delivery   DATE;

  v_payment_amount       NUMERIC(10,2);
  v_payment_status       payment_status;

  v_warranty_status      TEXT;
  v_warranty_start       DATE;
  v_warranty_end         DATE;

  v_products             JSONB;
  v_services             JSONB;
  v_custom_notes         JSONB;
  v_timeline             JSONB;
  v_billing_summary      JSONB;
BEGIN
  -- Fetch order
  SELECT id, order_number, current_status, service_type,
         estimated_total, billing_details, is_deleted
  INTO   v_order_id, v_order_number, v_current_status, v_service_type,
         v_estimated_total, v_billing_details, v_is_deleted
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- Fetch shipping info
  SELECT shipping_status, tracking_number, tracking_url, courier,
         shipping_cost, packaging_cost,
         estimated_dispatch_date, estimated_delivery_date
  INTO   v_shipping_status, v_tracking_number, v_tracking_url, v_courier,
         v_shipping_cost, v_packaging_cost,
         v_estimated_dispatch, v_estimated_delivery
  FROM shipping_info
  WHERE order_id = p_order_id;

  -- Fetch latest payment
  SELECT amount_paid, payment_status
  INTO   v_payment_amount, v_payment_status
  FROM payments
  WHERE order_id = p_order_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Fetch warranty
  SELECT warranty_status, warranty_start, warranty_end
  INTO   v_warranty_status, v_warranty_start, v_warranty_end
  FROM warranty_records
  WHERE order_id = p_order_id;

  -- Aggregate products
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('type', type, 'name', name)
      ORDER BY sort_order
    ),
    '[]'::jsonb
  )
  INTO v_products
  FROM order_products
  WHERE order_id = p_order_id;

  -- Aggregate services
  SELECT COALESCE(
    jsonb_object_agg(service_id, quantity),
    '{}'::jsonb
  )
  INTO v_services
  FROM order_services
  WHERE order_id = p_order_id;

  -- Aggregate admin customer notes (visible on tracking page)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('text', text, 'createdAt', created_at)
      ORDER BY created_at ASC
    ),
    '[]'::jsonb
  )
  INTO v_custom_notes
  FROM admin_customer_notes
  WHERE order_id = p_order_id;

  -- Aggregate timeline
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('status', status, 'note', note, 'created_at', created_at)
      ORDER BY created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_timeline
  FROM order_timeline
  WHERE order_id = p_order_id;

  -- Build billing summary JSON
  v_billing_summary := jsonb_build_object(
    'extraCharges',       v_billing_details->'extraCharges',
    'flatDiscount',       v_billing_details->'flatDiscount',
    'percentageDiscount', v_billing_details->'percentageDiscount',
    'taxPercentage',      v_billing_details->'taxPercentage',
    'shippingCost',       COALESCE(v_shipping_cost, 0),
    'packagingCost',      COALESCE(v_packaging_cost, 0),
    'amountPaid',         COALESCE(v_payment_amount, 0),
    'paymentStatus',      COALESCE(v_payment_status::TEXT, 'Payment Pending')
  );

  -- Upsert tracking record
  INSERT INTO order_tracking (
    order_id, order_number, status, service_type,
    products, selected_services, billing_summary,
    estimated_total, payment_status,
    shipping_status, tracking_number, tracking_url, courier,
    estimated_dispatch, estimated_delivery,
    customer_notes, timeline,
    warranty_status, warranty_start, warranty_end,
    updated_at
  ) VALUES (
    v_order_id, v_order_number, v_current_status, v_service_type,
    v_products, v_services, v_billing_summary,
    v_estimated_total, COALESCE(v_payment_status::TEXT, 'Payment Pending'),
    COALESCE(v_shipping_status::TEXT, 'Not Dispatched'),
    v_tracking_number, v_tracking_url, v_courier,
    v_estimated_dispatch, v_estimated_delivery,
    v_custom_notes, v_timeline,
    v_warranty_status, v_warranty_start, v_warranty_end,
    now()
  )
  ON CONFLICT (order_id) DO UPDATE SET
    order_number       = EXCLUDED.order_number,
    status             = EXCLUDED.status,
    service_type       = EXCLUDED.service_type,
    products           = EXCLUDED.products,
    selected_services  = EXCLUDED.selected_services,
    billing_summary    = EXCLUDED.billing_summary,
    estimated_total    = EXCLUDED.estimated_total,
    payment_status     = EXCLUDED.payment_status,
    shipping_status    = EXCLUDED.shipping_status,
    tracking_number    = EXCLUDED.tracking_number,
    tracking_url       = EXCLUDED.tracking_url,
    courier            = EXCLUDED.courier,
    estimated_dispatch = EXCLUDED.estimated_dispatch,
    estimated_delivery = EXCLUDED.estimated_delivery,
    customer_notes     = EXCLUDED.customer_notes,
    timeline           = EXCLUDED.timeline,
    warranty_status    = EXCLUDED.warranty_status,
    warranty_start     = EXCLUDED.warranty_start,
    warranty_end       = EXCLUDED.warranty_end,
    updated_at         = now();

  -- If the order is soft-deleted, remove its tracking record
  IF v_is_deleted THEN
    DELETE FROM order_tracking WHERE order_id = p_order_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. VIEWS
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Both views use security_invoker = true so that RLS policies on the
-- underlying tables are applied per the calling user's privileges.

-- ── 7.1 admin_orders_list ────────────────────────────────────────────────────
-- Used by the admin dashboard (all-orders list filtered to non-deleted rows).
-- Uses LATERAL join instead of correlated subquery for the latest payment;
-- this is both clearer and often faster in PostgreSQL's query planner.

CREATE VIEW admin_orders_list WITH (security_invoker = true) AS
SELECT
  o.id,
  o.order_number,
  c.name            AS customer_name,
  c.email           AS customer_email,
  c.phone           AS customer_phone,
  c.discord_username,
  o.service_type,
  o.current_status,
  o.estimated_total,
  o.created_at,
  o.updated_at,
  a.street_address,
  a.city,
  a.state,
  a.pincode,
  COALESCE(s.shipping_status::TEXT, 'Not Dispatched') AS shipping_status,
  COALESCE(latest_pay.payment_status::TEXT, 'Payment Pending') AS payment_status
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
LEFT JOIN addresses a ON a.id = o.address_id
LEFT JOIN shipping_info s ON s.order_id = o.id
LEFT JOIN LATERAL (
  SELECT payment_status
  FROM payments
  WHERE order_id = o.id
  ORDER BY created_at DESC
  LIMIT 1
) latest_pay ON true
WHERE o.is_deleted = false;


-- ── 7.2 admin_order_kpis ─────────────────────────────────────────────────────
-- Extends admin_orders_list with KPIs needed for dashboard analytics.
-- Separated from admin_orders_list to keep the list view lightweight;
-- this view adds amount_paid for revenue computations.

CREATE VIEW admin_order_kpis WITH (security_invoker = true) AS
SELECT
  o.id,
  o.order_number,
  c.name            AS customer_name,
  c.email           AS customer_email,
  c.phone           AS customer_phone,
  c.discord_username,
  o.service_type,
  o.current_status,
  o.estimated_total,
  o.created_at,
  o.updated_at,
  a.state,
  COALESCE(s.shipping_status::TEXT, 'Not Dispatched')    AS shipping_status,
  COALESCE(latest_pay.payment_status::TEXT, 'Payment Pending') AS payment_status,
  COALESCE(latest_pay.amount_paid, 0)                     AS amount_paid
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
LEFT JOIN addresses a ON a.id = o.address_id
LEFT JOIN shipping_info s ON s.order_id = o.id
LEFT JOIN LATERAL (
  SELECT payment_status, amount_paid
  FROM payments
  WHERE order_id = o.id
  ORDER BY created_at DESC
  LIMIT 1
) latest_pay ON true
WHERE o.is_deleted = false;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- All tables have RLS enabled.  The pattern is consistent:
--   - Tables containing admin/operational data: admin-only access via is_admin()
--   - order_tracking: public read, admin write
--   - profiles: users can see own profile, admins can see all

-- ── 8.1 profiles ─────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own_or_admin ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY profiles_insert_admin ON profiles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY profiles_delete_admin ON profiles
  FOR DELETE USING (is_admin());


-- ── 8.2 customers ────────────────────────────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_admin_all ON customers
  FOR ALL USING (is_admin());


-- ── 8.3 addresses ────────────────────────────────────────────────────────────

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY addresses_admin_all ON addresses
  FOR ALL USING (is_admin());


-- ── 8.4 orders ────────────────────────────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_admin_all ON orders
  FOR ALL USING (is_admin());


-- ── 8.5 order_products ────────────────────────────────────────────────────────

ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_products_admin_all ON order_products
  FOR ALL USING (is_admin());


-- ── 8.6 order_services ────────────────────────────────────────────────────────

ALTER TABLE order_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_services_admin_all ON order_services
  FOR ALL USING (is_admin());


-- ── 8.7 order_custom_work ─────────────────────────────────────────────────────

ALTER TABLE order_custom_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_custom_work_admin_all ON order_custom_work
  FOR ALL USING (is_admin());


-- ── 8.8 shipping_info ─────────────────────────────────────────────────────────

ALTER TABLE shipping_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY shipping_info_admin_all ON shipping_info
  FOR ALL USING (is_admin());


-- ── 8.9 payments ──────────────────────────────────────────────────────────────

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_admin_all ON payments
  FOR ALL USING (is_admin());


-- ── 8.10 order_timeline ───────────────────────────────────────────────────────

ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_timeline_admin_all ON order_timeline
  FOR ALL USING (is_admin());


-- ── 8.11 customer_messages ────────────────────────────────────────────────────

ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_messages_admin_all ON customer_messages
  FOR ALL USING (is_admin());


-- ── 8.12 admin_customer_notes ────────────────────────────────────────────────

ALTER TABLE admin_customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_customer_notes_admin_all ON admin_customer_notes
  FOR ALL USING (is_admin());


-- ── 8.13 admin_internal_notes ────────────────────────────────────────────────

ALTER TABLE admin_internal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_internal_notes_admin_all ON admin_internal_notes
  FOR ALL USING (is_admin());


-- ── 8.14 warranty_records ────────────────────────────────────────────────────

ALTER TABLE warranty_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY warranty_records_admin_all ON warranty_records
  FOR ALL USING (is_admin());


-- ── 8.15 order_tracking ──────────────────────────────────────────────────────
-- Public read (anon) — required for the customer tracking page.
-- Admin write — only authenticated admins can modify tracking data.

ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_tracking_select_public ON order_tracking
  FOR SELECT USING (true);

CREATE POLICY order_tracking_insert_admin ON order_tracking
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY order_tracking_update_admin ON order_tracking
  FOR UPDATE USING (is_admin());

CREATE POLICY order_tracking_delete_admin ON order_tracking
  FOR DELETE USING (is_admin());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 9.1 Revoke default PUBLIC execute on functions ───────────────────────────
REVOKE ALL ON FUNCTION trigger_set_updated_at()  FROM PUBLIC;
REVOKE ALL ON FUNCTION generate_order_number()   FROM PUBLIC;
REVOKE ALL ON FUNCTION sync_order_tracking(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION is_admin()                FROM PUBLIC;

-- ── 9.2 Table grants ─────────────────────────────────────────────────────────
-- anon           → order_tracking only (public tracking page)
-- authenticated  → SELECT on all tables (RLS enforces per-row filtering)
-- service_role   → full access (used by supabaseAdmin for application logic)

GRANT SELECT ON order_tracking TO anon;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ── 9.3 View grants ──────────────────────────────────────────────────────────
GRANT SELECT ON admin_orders_list TO authenticated, service_role;
GRANT SELECT ON admin_order_kpis  TO authenticated, service_role;

-- ── 9.4 Function execution grants ────────────────────────────────────────────
-- generate_order_number / sync_order_tracking: service_role only
-- is_admin: authenticated (called by RLS policy evaluations) and service_role

GRANT EXECUTE ON FUNCTION generate_order_number()   TO service_role;
GRANT EXECUTE ON FUNCTION sync_order_tracking(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION is_admin()                TO authenticated, service_role;
