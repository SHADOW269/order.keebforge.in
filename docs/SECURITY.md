# Security

## Overview

The application uses a **defense-in-depth** approach combining Supabase Auth, Row-Level Security (RLS), API-level authentication, and least-privilege database grants.

```mermaid
flowchart TD
    subgraph Client Layer
        C[Customer Browser]
        A[Admin Browser]
    end

    subgraph API Layer
        MW[Next.js Middleware]
        API[API Routes]
        requireAdmin[requireAdmin()]
    end

    subgraph Database Layer
        RLS[Row-Level Security]
        SR[service_role Bypass]
        Func[SECURITY DEFINER Functions]
    end

    C -->|anon + RLS| RLS
    A -->|Session Cookie| MW
    MW -->|Redirect if no session| A
    A -->|anon + RLS| RLS
    A -->|Mutation| API
    API -->|Check session| requireAdmin
    API -->|service_role key| SR
    SR -->|Bypass RLS| Func
    Func -->|Schema-qualified| DB[(PostgreSQL)]
```

## Authentication

### Supabase Auth

The system uses **Supabase Auth with email/password** for admin authentication.

**Login flow:**
1. Admin visits `/login`, enters email + password
2. `supabase.auth.signInWithPassword()` creates a session
3. Session stored in HTTP-only cookies via `@supabase/ssr`
4. Middleware checks session on every `/admin/*` request

### Middleware (`src/proxy.ts`)

The middleware checks for a valid Supabase session on protected routes. If the user is not authenticated and tries to access `/admin/*`, they are redirected to `/login`. If already authenticated and visiting `/login`, they are redirected to `/admin`.

Routes **excluded** from auth checks:
- `/_next/static/*`, `/_next/image/*` — static assets
- `/favicon.ico`
- `/api/*` — API routes handle auth internally
- `/track/*` — public tracking pages
- `/` — landing page

## Authorization

### Admin API Authentication (`requireAdmin`)

Every API route calls `requireAdmin()` (`src/lib/api-auth.ts`) which:
1. Creates a Supabase server client using request cookies
2. Calls `supabase.auth.getUser()`
3. Returns `401 Unauthorized` JSON response if no valid session
4. Returns `{ user }` on success

### Role Checks

The system does **not** currently check for an admin role in `app_metadata`. The `profiles` table exists but RLS is configured so that only the admin profile (hardik@keebforge.in) passes the `is_admin()` check. This is configured via an `id = auth.uid()` check with a specific email filter in the `is_admin()` function.

## Row-Level Security

RLS is enabled on **all tables** except `order_tracking` (which has its own policies).

### Public Access

| Table | Access | Policy |
|-------|--------|--------|
| `order_tracking` | **SELECT** — anon + authenticated | Anyone can read tracking data by order number |
| `order_tracking` | **INSERT/UPDATE/DELETE** — admin only | Via `is_admin()` check |

### Admin Access

All admin tables (`orders`, `customers`, `addresses`, `payments`, `shipping_info`, `order_products`, `order_services`, `order_custom_work`, `order_timeline`, `customer_messages`, `admin_customer_notes`, `admin_internal_notes`, `warranty_records`, `profiles`) use the policy:

```sql
USING (public.is_admin())
```

This grants full access (SELECT/INSERT/UPDATE/DELETE) to admin users.

### `is_admin()` Function

```sql
CREATE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND email = 'hardik@keebforge.in'
  );
END;
$$;
```

Key characteristics:
- **SECURITY DEFINER** — Required because it's called from RLS policies. Without this, the function would run as the calling user and RLS on `profiles` could hide the row.
- **STABLE** — Allows PostgreSQL to cache `auth.uid()` within a query, reducing function call overhead.
- **SET search_path = public** — Prevents search-path hijacking attacks.

## Service Role

For mutations, API routes use `supabaseAdmin` (`src/lib/supabaseAdmin.ts`), which authenticates with the **Supabase service_role key**. This key:

- Bypasses all RLS policies
- Has full database access
- Must never be exposed to the client
- Is stored as `SUPABASE_SERVICE_ROLE_KEY` in environment variables

## Database Permissions (Grants)

### Functions

| Function | PUBLIC | authenticated | service_role |
|----------|--------|---------------|--------------|
| `trigger_set_updated_at()` | ✗ | ✗ | ✗ (implicit) |
| `generate_order_number()` | ✗ | ✗ | ✓ |
| `sync_order_tracking(p_order_id UUID)` | ✗ | ✗ | ✓ |
| `get_admin_order(p_order_id UUID)` | ✗ | ✗ | ✓ |
| `is_admin()` | ✗ | ✓ | ✓ |

### Tables (Primary Grants)

| Table | anon | authenticated | service_role |
|-------|------|---------------|--------------|
| Admin tables (orders, customers, etc.) | — | SELECT | ALL |
| `order_tracking` | SELECT | SELECT | ALL |
| `admin_orders_list` (view) | — | SELECT | SELECT |
| `admin_order_kpis` (view) | — | SELECT | SELECT |

## API Security

- **HTTP Security Headers** — Configured in `next.config.ts`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`
- **Console Removal** — `console.log` stripped in production builds
- **React Strict Mode** — Enabled
- **No `poweredByHeader`** — Hidden

## SECURITY DEFINER Review

Three functions use `SECURITY DEFINER`:

| Function | Reason | Compensating Controls |
|----------|--------|----------------------|
| `is_admin()` | Called from RLS policies across 15+ tables | `SET search_path = public`, schema-qualified refs, PUBLIC execute revoked |
| `sync_order_tracking()` | Reads/writes across all admin tables | Called only via service_role, schema-qualified refs, PUBLIC execute revoked |
| `get_admin_order()` | Bypasses RLS to return full order details | EXECUTE restricted to `service_role` only, schema-qualified refs |

## Environment Variables

| Variable | Visibility | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + Server | Public anon/publishable key (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key (bypasses RLS) |

## Best Practices

1. **Never expose the service_role key** — It's server-only via environment variables
2. **Always use `requireAdmin()`** — Every API route must authenticate
3. **RLS is defense-in-depth, not the sole barrier** — API routes also check auth server-side
4. **Schema-qualify all table references** — In SECURITY DEFINER functions to prevent schema-shadowing
5. **Revoke PUBLIC execute** — On all functions; grant only to necessary roles
6. **Keep functions STABLE where possible** — Allows PostgreSQL to optimize repeated calls
7. **Use `security_invoker = true`** — On views so they respect the caller's RLS
