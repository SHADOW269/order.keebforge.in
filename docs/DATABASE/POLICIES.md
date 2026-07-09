# RLS Policies

This file documents every RLS policy defined in the database.

## Summary

| Table | Policy Name | Operations | Access |
|-------|------------|-----------|-------|
| profiles | `profiles_self_access` | ALL | Self |
| profiles | `profiles_admin_all` | ALL | Admin |
| orders | `orders_admin_all` | ALL | Admin |
| customers | `customers_admin_all` | ALL | Admin |
| addresses | `addresses_admin_all` | ALL | Admin |
| order_products | `order_products_admin_all` | ALL | Admin |
| order_services | `order_services_admin_all` | ALL | Admin |
| order_custom_work | `order_custom_work_admin_all` | ALL | Admin |
| shipping_info | `shipping_info_admin_all` | ALL | Admin |
| payments | `payments_admin_all` | ALL | Admin |
| order_timeline | `order_timeline_admin_all` | ALL | Admin |
| customer_messages | `customer_messages_admin_all` | ALL | Admin |
| admin_customer_notes | `admin_customer_notes_admin_all` | ALL | Admin |
| admin_internal_notes | `admin_internal_notes_admin_all` | ALL | Admin |
| warranty_records | `warranty_records_admin_all` | ALL | Admin |
| order_tracking | `order_tracking_select_all` | SELECT | Public |
| order_tracking | `order_tracking_admin_insert` | INSERT | Admin |
| order_tracking | `order_tracking_admin_update` | UPDATE | Admin |
| order_tracking | `order_tracking_admin_delete` | DELETE | Admin |

## Policy Definitions

### Admin-Only Tables

All admin tables use the same policy pattern:

```sql
CREATE POLICY "{table}_admin_all" ON {table}
  FOR ALL USING (public.is_admin());
```

This grants full CRUD access when `is_admin()` returns true.

### profiles — Special Case

```sql
CREATE POLICY "profiles_self_access" ON profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (public.is_admin());
```

Non-admin users can only see their own profile row. Admins can see all profiles.

### order_tracking — Public + Admin Split

```sql
-- Anyone can read tracking data (no auth required)
CREATE POLICY "order_tracking_select_all" ON order_tracking
  FOR SELECT USING (true);

-- Admin-only write operations (split to avoid "multiple permissive" warning)
CREATE POLICY "order_tracking_admin_insert" ON order_tracking
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "order_tracking_admin_update" ON order_tracking
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "order_tracking_admin_delete" ON order_tracking
  FOR DELETE USING (public.is_admin());
```

## How Policies Are Applied

1. **Client-side reads (anon key):** `SELECT` queries respect RLS. Public users can only read from `order_tracking`. Admin users (authenticated) can read from all tables via `is_admin()`.
2. **Service role writes:** API routes use `supabaseAdmin` which has the `service_role` key. This bypasses all RLS. The `requireAdmin()` function provides application-level auth instead.
3. **Views:** `admin_orders_list` and `admin_order_kpis` use `security_invoker = true`, meaning they inherit the caller's RLS policies on the underlying `orders`, `customers`, etc. tables.
