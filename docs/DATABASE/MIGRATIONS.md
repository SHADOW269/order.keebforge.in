# Migrations

Migrations are applied by the Supabase CLI via `npx supabase db push`.

## 001_initial_schema.sql

**Full database schema.**

Contains everything needed for the database:

- **Extensions**: `pgcrypto`, `uuid-ossp`
- **Enums**: `product_type`, `payment_status`, `shipping_status`, `custom_work_category`
- **Tables**: All 15 tables with primary keys, foreign keys, defaults, and NOT NULL constraints
- **Indexes**: Performance indexes for dashboard queries, order lookups, payment status
- **Functions**: `trigger_set_updated_at()`, `generate_order_number()`, `sync_order_tracking()`, `get_admin_order()`, `is_admin()`
- **RLS**: Row-Level Security enabled on all tables with admin and public policies
- **Views**: `admin_orders_list`, `admin_order_kpis` with `security_invoker = true`
- **Grants**: Explicit permission grants for all roles
- **Security**: Schema-qualified refs, `SET search_path = public`, PUBLIC execute revoked

All functions use `SET search_path = public` and schema-qualified table references for security.

## Applying Migrations

```bash
# Local development
npx supabase db push

# Production
npx supabase db push --db-url "postgresql://postgres:<password>@<host>:6543/postgres"

# Reset and reapply
npx supabase reset
```

## Cleanup

`cleanup.sql` is a one-time script to drop legacy objects before re-applying the migration. Use only when setting up a fresh database.
