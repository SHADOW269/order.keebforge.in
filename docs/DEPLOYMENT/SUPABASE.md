# Supabase Setup and Management

## Creating a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Enter:
   - **Name:** `keebforge` (or similar)
   - **Database Password:** Generate and save securely
   - **Region:** Choose the closest to your users (e.g., `Singapore` for India)
   - **Pricing Plan:** Free tier (or Pro for production)
4. Wait for the database to provision (~2 minutes)

## Getting Connection Credentials

From the Supabase Dashboard → **Project Settings → API**:

| Setting | Location | Notes |
|---------|----------|-------|
| Project URL | `Settings → API → Project URL` | Used as `NEXT_PUBLIC_SUPABASE_URL` |
| Anon Key | `Settings → API → anon public` | Used as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Service Role Key | `Settings → API → service_role` | Used as `SUPABASE_SERVICE_ROLE_KEY` |
| Database Connection String | `Settings → Database → Connection string` | Used for direct connections |

## Running Migrations

### Local → Production

```bash
# Push migrations to production
supabase db push --db-url "postgresql://postgres:<password>@<host>:6543/postgres"
```

The `--db-url` flag uses the production database connection string from Supabase Dashboard → **Settings → Database → Connection string** (the URI format, with password).

### Direct SQL

For one-off changes or testing:

1. Supabase Dashboard → **SQL Editor**
2. Paste and run SQL statements
3. Changes are immediate (not tracked in migrations)

## Configuring Authentication

### Settings → Authentication → Providers

| Provider | Status | Notes |
|----------|--------|-------|
| Email | Enabled | Used for admin login |
| Magic Link | Optional | Can be enabled for password-less login |

### Settings → Authentication → Settings

| Setting | Value | Notes |
|---------|-------|-------|
| Site URL | `https://order.keebforge.in` | Production URL |
| Redirect URLs | `https://order.keebforge.in/**` | Allow auth redirects |
| JWT expiry | `3600` (default) | Session duration |

## Enabling Row-Level Security

RLS is enabled via migrations. To verify:

```sql
-- Run in SQL Editor
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

## Storage

Storage is configured but not actively used by the application. If needed:

1. **Supabase Dashboard → Storage**
2. Create buckets for uploads
3. Configure bucket-level RLS policies

## SQL Editor

Use the SQL Editor in the Supabase Dashboard for:
- Debugging queries
- Manual data fixes
- Testing new policies
- Running the seed INSERT for admin profile

## Database Backups

### Automatic (Supabase Pro)

- Daily backups with 7-day retention
- Point-in-time recovery available

### Manual

Use `pg_dump`:

```bash
pg_dump --dbname "postgresql://postgres:<password>@<host>:6543/postgres" \
  --format=custom \
  --file=keebforge_backup.dump
```

Restore:

```bash
pg_restore --dbname "postgresql://postgres:<password>@<host>:6543/postgres" \
  --clean \
  --if-exists \
  keebforge_backup.dump
```

## Edge Functions

Not currently used. The application handles all server-side logic via Next.js API routes.

## Production Checklist

- [ ] RLS is enabled on all tables
- [ ] `is_admin()` function uses schema-qualified refs
- [ ] PUBLIC execute revoked from all functions
- [ ] `get_admin_order` restricted to `service_role` only
- [ ] Views use `security_invoker = true`
- [ ] Strong database password set
- [ ] Service role key stored as Vercel environment variable (never exposed to client)
- [ ] Email auth provider configured with correct Site URL and Redirect URLs
- [ ] Admin profile exists in `profiles` table
- [ ] `supabase db push` applied all migrations
- [ ] Rate limiting configured (auth, API)
