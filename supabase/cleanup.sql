-- =============================================================================
-- KeebForge — One-Time Cleanup Script
-- =============================================================================
--
-- This script drops every object that may exist from previous migrations.
-- It is intended to be run ONCE against a production/staging database BEFORE
-- applying the new 001_initial_schema.sql migration.
--
-- IMPORTANT: This script drops ALL data in the public schema.  Only run it
-- on a fresh project or after backing up any data you need to keep.
--
-- Usage (Supabase SQL Editor):
--   1. Connect to your Supabase project
--   2. Open the SQL Editor
--   3. Paste and execute this script
--   4. Then apply the new migration via `supabase db push`
--
-- Ordering: views before tables, dependency-ordered, CASCADE where needed.
-- =============================================================================

-- ── Legacy Supabase helper functions (may exist in older projects) ──────────
DROP FUNCTION IF EXISTS public.rls_auto_enable() CASCADE;
DROP FUNCTION IF EXISTS public.rls_auto_enable(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ── Functions from prior versions of this schema ────────────────────────────
DROP FUNCTION IF EXISTS public.get_admin_order(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.sync_order_tracking(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_set_updated_at() CASCADE;

-- ── Views ──────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS public.admin_order_kpis CASCADE;
DROP VIEW IF EXISTS public.admin_orders_list CASCADE;

-- ── Tables (dependency order: reverse) ────────────────────────────────────
DROP TABLE IF EXISTS public.order_tracking CASCADE;
DROP TABLE IF EXISTS public.warranty_records CASCADE;
DROP TABLE IF EXISTS public.admin_internal_notes CASCADE;
DROP TABLE IF EXISTS public.admin_customer_notes CASCADE;
DROP TABLE IF EXISTS public.customer_messages CASCADE;
DROP TABLE IF EXISTS public.order_timeline CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.shipping_info CASCADE;
DROP TABLE IF EXISTS public.order_custom_work CASCADE;
DROP TABLE IF EXISTS public.order_services CASCADE;
DROP TABLE IF EXISTS public.order_products CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ── Enums ──────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS public.custom_work_category CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.product_type CASCADE;
DROP TYPE IF EXISTS public.shipping_status CASCADE;
