# Migrations

Migrations are ordered sequentially (001–009) and applied by the Supabase CLI via `supabase db push`.

## 001_schema.sql

**Initial schema creation.**

- Creates extensions: `pgcrypto`, `uuid-ossp`
- Creates enums: `product_type`, `payment_status`, `shipping_status`, `custom_work_category`
- Creates all 15 tables with primary keys, foreign keys, defaults, and NOT NULL constraints
- Sets up the `updated_at` trigger on `orders`

## 002_indexes.sql

**Performance indexes.**

- `idx_orders_dashboard` — Covering index for dashboard queries (is_deleted, created_at DESC)
- `idx_orders_number_lookup` — Fast lookup by order_number
- `idx_payments_status` — Payment status queries by order
- `idx_orders_address` — FK index on orders.address_id (added in security fix)
- `idx_customers_email_phone` — Customer deduplication on create/update

## 003_functions.sql

**PostgreSQL functions.**

- `trigger_set_updated_at()` — Trigger function
- `generate_order_number()` — KF-XXXXXX order number generator
- `sync_order_tracking(p_order_id UUID)` — Denormalized tracking sync
- `get_admin_order(p_order_id UUID)` — Full order detail as JSONB

All functions use `SET search_path = public` and schema-qualified table references.

## 004_rls.sql

**Row-Level Security.**

- Creates `is_admin()` helper function (SECURITY DEFINER, STABLE)
- Enables RLS on all 15 tables
- Creates policies for admin access on all tables
- Creates public SELECT + admin write policies on `order_tracking`
- Creates self-access + admin access policies on `profiles`

## 005_views.sql

**Admin views.**

- `admin_orders_list` — Flattened list of non-deleted orders with customer, address, shipping, and payment info
- `admin_order_kpis` — Same as above plus amount_paid for dashboard KPIs
- Both views use `security_invoker = true`
- Grants SELECT to `authenticated` and `service_role`

## 006_seed.sql

**Seed data (disabled).**

- Contains a commented-out INSERT for the admin profile
- Uncomment and update `auth.uid()` reference for initial setup

## 007_grants.sql

**Explicit permission grants.**

- GRANT ALL on all admin tables to `service_role`
- GRANT SELECT on admin tables to `authenticated`
- GRANT ALL on `order_tracking` to `service_role`, SELECT to `anon` and `authenticated`
- GRANT SELECT on views to `authenticated`, `service_role`
- REVOKE EXECUTE on all functions from PUBLIC
- GRANT EXECUTE per function to appropriate roles

## 008_security_fixes.sql

**Security Advisor fixes (PG17+ syntax).**

- Sets `security_invoker = true` on views (uses `ALTER VIEW IF EXISTS` — PG16+ only)
- Sets `search_path = public` on all functions
- Marks `is_admin()` as STABLE
- Recreates `sync_order_tracking` and `get_admin_order` with schema-qualified refs
- Splits `order_tracking` RLS into separate INSERT/UPDATE/DELETE policies
- Revokes PUBLIC execute from all functions
- Drops duplicate index `idx_order_timeline_lookup`

**Note:** Uses `ALTER VIEW IF EXISTS` which is PostgreSQL 16+ syntax. Supabase may run PG15 where this will fail.

## 009_apply_security_fixes.sql

**PG15-compatible security fixes.**

Re-applies all fixes from 008 using syntax compatible with PostgreSQL 15:

- `ALTER VIEW ... SET (security_invoker = true)` — without `IF EXISTS`
- `ALTER FUNCTION ... SET search_path = public` — for functions not recreated
- `ALTER FUNCTION is_admin() STABLE`
- Full `CREATE OR REPLACE FUNCTION` for `sync_order_tracking` and `get_admin_order`
- `DROP POLICY IF EXISTS` + split `CREATE POLICY` statements
- `REVOKE EXECUTE ... FROM PUBLIC` + targeted `GRANT EXECUTE`
- `DROP INDEX IF EXISTS idx_order_timeline_lookup`

Idempotent — safe to run even if 008 already applied some changes.
