-- =============================================================================
-- KeebForge Order Management & Customer Tracking
-- Production Database Schema
-- PostgreSQL 17 / Supabase Free Tier / Vercel
-- =============================================================================
--
-- This single migration is designed for a fresh Supabase project.
--
-- Design priorities (in order):
--   1. Security — pass Supabase Security Advisor with zero Critical issues
--      and zero SECURITY DEFINER warnings
--   2. Data integrity — CHECK constraints on every validated column
--   3. Performance — indexes only where queries need them
--   4. Maintainability — explicit grants, RLS on every table
--   5. Scalability — supports 10K+ orders without major schema changes
--
-- All functions use SECURITY INVOKER.  No function in this schema requires
-- elevated privileges.  Every function has SET search_path = public.
-- Every function has explicit REVOKE + GRANT.
--
-- ── Table of Contents ────────────────────────────────────────────────────────
--   1. Extensions
--   2. Enums
--   3. Tables (15)
--   4. Indexes
--   5. Trigger: updated_at
--   6. Functions
--   7. Views
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

CREATE TYPE public.custom_work_category AS ENUM (
  'keyboard',
  'mouse'
);

CREATE TYPE public.payment_status AS ENUM (
  'Payment Pending',
  'Partially Paid',
  'Paid'
);

CREATE TYPE public.shipping_status AS ENUM (
  'Not Dispatched',
  'Dispatched',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Returned'
);

CREATE TYPE public.product_type AS ENUM (
  'keyboard',
  'switch',
  'keycap',
  'mouse',
  'pcb',
  'components'
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 3.1 profiles (admin/staff accounts linked to Supabase Auth) ──────────────

CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.2 customers ────────────────────────────────────────────────────────────

CREATE TABLE public.customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  discord_username TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT customers_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

  CONSTRAINT customers_phone_format
    CHECK (phone IS NULL OR phone ~ '^\+91[0-9]{10}$')
);


-- ── 3.3 addresses ────────────────────────────────────────────────────────────

CREATE TABLE public.addresses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  street_address TEXT,
  city           TEXT,
  state          TEXT,
  pincode        TEXT,
  is_default     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT addresses_pincode_format
    CHECK (pincode IS NULL OR pincode ~ '^\d{6}$')
);


-- ── 3.4 orders ───────────────────────────────────────────────────────────────

CREATE TABLE public.orders (
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

CREATE TABLE public.order_products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type       product_type NOT NULL,
  name       TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.6 order_services ──────────────────────────────────────────────────────

CREATE TABLE public.order_services (
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

CREATE TABLE public.order_custom_work (
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

CREATE TABLE public.shipping_info (
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

CREATE TABLE public.payments (
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

CREATE TABLE public.order_timeline (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.11 customer_messages ───────────────────────────────────────────────────

CREATE TABLE public.customer_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.12 admin_customer_notes (visible on tracking page) ─────────────────────

CREATE TABLE public.admin_customer_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.13 admin_internal_notes (NOT visible to customers) ────────────────────

CREATE TABLE public.admin_internal_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3.14 warranty_records ────────────────────────────────────────────────────

CREATE TABLE public.warranty_records (
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


-- ── 3.15 order_tracking (denormalised — public-facing) ───────────────────────
--
-- ARCHITECTURE: intentionally denormalised.  The customer tracking page is the
-- most-frequently accessed public endpoint and needs data from 11 tables.  This
-- table acts as a read-optimised cache populated by sync_order_tracking().
-- Security: contains no customer PII — only order status and shipping info.

CREATE TABLE public.order_tracking (
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

-- ── customers ────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX idx_customers_email ON public.customers (lower(email));
CREATE UNIQUE INDEX idx_customers_phone ON public.customers (phone) WHERE phone IS NOT NULL;

-- ── addresses ────────────────────────────────────────────────────────────────
CREATE INDEX idx_addresses_customer ON public.addresses (customer_id);
CREATE UNIQUE INDEX idx_addresses_single_default
  ON public.addresses (customer_id) WHERE is_default = true;

-- ── orders ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_orders_customer ON public.orders (customer_id);
CREATE INDEX idx_orders_address  ON public.orders (address_id);
CREATE INDEX idx_orders_status   ON public.orders (current_status);
CREATE INDEX idx_orders_created  ON public.orders (created_at DESC);
CREATE INDEX idx_orders_dashboard
  ON public.orders (created_at DESC, current_status, estimated_total)
  WHERE is_deleted = false;
CREATE INDEX idx_orders_number_lookup
  ON public.orders (order_number)
  WHERE is_deleted = false;

-- ── order_products ───────────────────────────────────────────────────────────
CREATE INDEX idx_order_products_order ON public.order_products (order_id, sort_order);

-- ── order_services ───────────────────────────────────────────────────────────
CREATE INDEX idx_order_services_order ON public.order_services (order_id);

-- ── order_custom_work ────────────────────────────────────────────────────────
CREATE INDEX idx_order_custom_work_order ON public.order_custom_work (order_id, sort_order);

-- ── payments ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_payments_order ON public.payments (order_id, created_at DESC);

-- ── order_timeline ───────────────────────────────────────────────────────────
CREATE INDEX idx_order_timeline_order ON public.order_timeline (order_id, created_at DESC);

-- ── customer_messages ────────────────────────────────────────────────────────
CREATE INDEX idx_customer_messages_order ON public.customer_messages (order_id, created_at DESC);

-- ── admin_customer_notes ─────────────────────────────────────────────────────
CREATE INDEX idx_admin_customer_notes_order ON public.admin_customer_notes (order_id, created_at DESC);

-- ── admin_internal_notes ─────────────────────────────────────────────────────
CREATE INDEX idx_admin_internal_notes_order ON public.admin_internal_notes (order_id, created_at DESC);

-- ── order_tracking ───────────────────────────────────────────────────────────
CREATE INDEX idx_order_tracking_number ON public.order_tracking (order_number);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. TRIGGER: updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.shipping_info
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.warranty_records
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.order_tracking
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- All functions here use SECURITY INVOKER.  No function in this schema
-- requires elevated privileges because:
--
--   generate_order_number() — reads orders (collision check, authenticated users
--     have SELECT via GRANT, called by service_role)
--   is_admin() — authenticated users have SELECT on profiles via GRANT
--   sync_order_tracking() — called by service_role which has ALL privs
--   trigger_set_updated_at() — only called by triggers (runs as table owner)
--
-- Every function has SET search_path = public.

-- ── 6.1 trigger_set_updated_at() ──────────────────────────────────────────────
-- (Defined in section 5, adjacent to its triggers.)


-- ── 6.2 generate_order_number() ──────────────────────────────────────────────
-- Generates KF + 6 random alphanumeric chars (e.g. "KF3A9X2").
-- Uses gen_random_bytes() for cryptographic randomness.
-- Retries up to 10 times if a collision is detected (extremely unlikely given
-- the 36^6 ≈ 2.17B keyspace, but handled for correctness).

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
SET search_path = public, extensions
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT;
  v_bytes BYTEA;
  i INT;
  max_attempts INT := 10;
  attempt INT := 0;
BEGIN
  LOOP
    attempt := attempt + 1;
    result := 'KF';
    v_bytes := extensions.gen_random_bytes(6);
    FOR i IN 0..5 LOOP
      result := result || substr(chars, (get_byte(v_bytes, i) % length(chars)) + 1, 1);
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = result) THEN
      RETURN result;
    END IF;

    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique order number after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- ── 6.3 is_admin() ───────────────────────────────────────────────────────────
-- Returns TRUE if the calling user has a profile with role 'admin' or 'staff'.
-- This is called from RLS policies.  It does NOT use SECURITY DEFINER because
-- authenticated users have GRANT SELECT ON ALL TABLES IN SCHEMA public,
-- which includes the profiles table.  Anon users never trigger a policy that
-- calls this function.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- ── 6.4 sync_order_tracking(p_order_id) ──────────────────────────────────────
-- Synchronises the denormalised order_tracking record for a given order.
-- Called via RPC by the application using the service_role key.
-- SECURITY INVOKER is safe because service_role has ALL privileges on every
-- table and bypasses RLS.

CREATE OR REPLACE FUNCTION public.sync_order_tracking(p_order_id UUID)
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
  FROM public.orders
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
  FROM public.shipping_info
  WHERE order_id = p_order_id;

  -- Fetch latest payment
  SELECT amount_paid, payment_status
  INTO   v_payment_amount, v_payment_status
  FROM public.payments
  WHERE order_id = p_order_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Fetch warranty
  SELECT warranty_status, warranty_start, warranty_end
  INTO   v_warranty_status, v_warranty_start, v_warranty_end
  FROM public.warranty_records
  WHERE order_id = p_order_id;

  -- Aggregate products
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('id', id, 'type', type, 'name', name)
      ORDER BY sort_order
    ),
    '[]'::jsonb
  )
  INTO v_products
  FROM public.order_products
  WHERE order_id = p_order_id;

  -- Aggregate services
  SELECT COALESCE(
    jsonb_object_agg(service_id, quantity),
    '{}'::jsonb
  )
  INTO v_services
  FROM public.order_services
  WHERE order_id = p_order_id;

  -- Aggregate admin customer notes
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('id', id, 'text', text, 'createdAt', created_at)
      ORDER BY created_at ASC
    ),
    '[]'::jsonb
  )
  INTO v_custom_notes
  FROM public.admin_customer_notes
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
  FROM public.order_timeline
  WHERE order_id = p_order_id;

  -- Build billing summary
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
  INSERT INTO public.order_tracking (
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
    DELETE FROM public.order_tracking WHERE order_id = p_order_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. VIEWS
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Both views use security_invoker = true so that RLS policies on the
-- underlying tables are applied per the calling user's privileges.

-- ── 7.1 admin_orders_list ────────────────────────────────────────────────────

CREATE VIEW public.admin_orders_list WITH (security_invoker = true) AS
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
FROM public.orders o
LEFT JOIN public.customers c ON c.id = o.customer_id
LEFT JOIN public.addresses a ON a.id = o.address_id
LEFT JOIN public.shipping_info s ON s.order_id = o.id
LEFT JOIN LATERAL (
  SELECT payment_status
  FROM public.payments
  WHERE order_id = o.id
  ORDER BY created_at DESC
  LIMIT 1
) latest_pay ON true
WHERE o.is_deleted = false;


-- ── 7.2 admin_order_kpis (extends admin_orders_list with amount_paid) ───────

CREATE VIEW public.admin_order_kpis WITH (security_invoker = true) AS
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
FROM public.orders o
LEFT JOIN public.customers c ON c.id = o.customer_id
LEFT JOIN public.addresses a ON a.id = o.address_id
LEFT JOIN public.shipping_info s ON s.order_id = o.id
LEFT JOIN LATERAL (
  SELECT payment_status, amount_paid
  FROM public.payments
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
--   Admin/operational tables: admin-only access via is_admin()
--   order_tracking: public read, admin write
--   profiles: users see own profile, admins see all

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT USING (id = (SELECT auth.uid()) OR is_admin());

CREATE POLICY profiles_insert_admin ON public.profiles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY profiles_delete_admin ON public.profiles
  FOR DELETE USING (is_admin());


ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_admin_all ON public.customers
  FOR ALL USING (is_admin());


ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY addresses_admin_all ON public.addresses
  FOR ALL USING (is_admin());


ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_admin_all ON public.orders
  FOR ALL USING (is_admin());


ALTER TABLE public.order_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_products_admin_all ON public.order_products
  FOR ALL USING (is_admin());


ALTER TABLE public.order_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_services_admin_all ON public.order_services
  FOR ALL USING (is_admin());


ALTER TABLE public.order_custom_work ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_custom_work_admin_all ON public.order_custom_work
  FOR ALL USING (is_admin());


ALTER TABLE public.shipping_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY shipping_info_admin_all ON public.shipping_info
  FOR ALL USING (is_admin());


ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_admin_all ON public.payments
  FOR ALL USING (is_admin());


ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_timeline_admin_all ON public.order_timeline
  FOR ALL USING (is_admin());


ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_messages_admin_all ON public.customer_messages
  FOR ALL USING (is_admin());


ALTER TABLE public.admin_customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_customer_notes_admin_all ON public.admin_customer_notes
  FOR ALL USING (is_admin());


ALTER TABLE public.admin_internal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_internal_notes_admin_all ON public.admin_internal_notes
  FOR ALL USING (is_admin());


ALTER TABLE public.warranty_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY warranty_records_admin_all ON public.warranty_records
  FOR ALL USING (is_admin());


ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_tracking_select_public ON public.order_tracking
  FOR SELECT USING (true);

CREATE POLICY order_tracking_insert_admin ON public.order_tracking
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY order_tracking_update_admin ON public.order_tracking
  FOR UPDATE USING (is_admin());

CREATE POLICY order_tracking_delete_admin ON public.order_tracking
  FOR DELETE USING (is_admin());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Principle of least privilege:
--   anon           → order_tracking SELECT only (public tracking page)
--   authenticated  → SELECT on all tables (RLS enforces per-row filtering)
--   service_role   → full access (used by supabaseAdmin in application logic)

-- ── 9.1 Revoke default PUBLIC execute on every function ──────────────────────
REVOKE ALL ON FUNCTION public.trigger_set_updated_at()  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_order_number()   FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin()                FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_order_tracking(UUID) FROM PUBLIC;

-- ── 9.2 Explicit per-role restrictions on functions ─────────────────────────
-- These REVOKE statements are redundant with the PUBLIC revoke above, but
-- they make the security posture explicit and satisfy Security Advisor scans
-- that may check per-role grants independently.

-- generate_order_number: only service_role needs this (called via API RPC)
REVOKE ALL ON FUNCTION public.generate_order_number() FROM anon;
REVOKE ALL ON FUNCTION public.generate_order_number() FROM authenticated;

-- sync_order_tracking: only service_role needs this (called via API RPC)
REVOKE ALL ON FUNCTION public.sync_order_tracking(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.sync_order_tracking(UUID) FROM authenticated;

-- is_admin: authenticated role needs this because RLS policies call it
-- during query evaluation.  Anon should never trigger an is_admin() call.
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;

-- trigger_set_updated_at: only called by triggers (runs as table owner)
REVOKE ALL ON FUNCTION public.trigger_set_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.trigger_set_updated_at() FROM authenticated;

-- ── 9.3 Minimum GRANT on functions ──────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.generate_order_number()   TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_order_tracking(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin()                TO authenticated, service_role;

-- trigger_set_updated_at() intentionally has no GRANT — it is only invoked
-- by triggers, which run as the table owner regardless of grants.

-- ── 9.4 Table grants ─────────────────────────────────────────────────────────
GRANT SELECT ON public.order_tracking TO anon;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ── 9.5 View grants ──────────────────────────────────────────────────────────
GRANT SELECT ON public.admin_orders_list TO authenticated, service_role;
GRANT SELECT ON public.admin_order_kpis  TO authenticated, service_role;
