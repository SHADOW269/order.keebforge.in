# Environment Variables

## Overview

The application uses three environment variables for Supabase integration. Client-safe variables are prefixed with `NEXT_PUBLIC_`; the service role key is server-only.

## Variables

### NEXT_PUBLIC_SUPABASE_URL

| | |
|---|---|
| **Purpose** | Supabase project API endpoint URL |
| **Example** | `https://<project-id>.supabase.co` (production) or `http://127.0.0.1:54321` (local) |
| **Required** | Yes |
| **Exposure** | Client + Server |
| **Default** | None |

### NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

| | |
|---|---|
| **Purpose** | Public anon/publishable key for client-side Supabase queries. RLS policies enforce data access. |
| **Example** | `eyJhbGciOiJIUzI1NiIs...` |
| **Required** | Yes |
| **Exposure** | Client + Server (safe — RLS-enforced) |
| **Default** | None |

### SUPABASE_SERVICE_ROLE_KEY

| | |
|---|---|
| **Purpose** | Admin key that bypasses all RLS policies. Used only in API routes for mutations. |
| **Example** | `eyJhbGciOiJIUzI1NiIs...` |
| **Required** | Yes |
| **Exposure** | **Server only** — never expose to the client |
| **Default** | None |
| **Warning** | This key has full access to all data. Keep it secret. Never commit it to version control. |

## Configuration Files

### Local Development — `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

Obtain local keys by running `supabase status` in the `supabase/` directory.

### Production — Vercel Environment Variables

Set in **Vercel Dashboard → Project Settings → Environment Variables**.

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Security Notes

1. `SUPABASE_SERVICE_ROLE_KEY` must **never** be used in client-side code
2. Only `src/lib/supabaseAdmin.ts` uses the service role key
3. All client components use the browser client (`src/lib/supabase/client.ts`) with the anon key
4. Server Components use the server client (`src/lib/supabase/server.ts`) with the anon key
5. RLS policies are the primary access control for all anon-key queries

## Verification

To verify environment variables are loaded correctly:

```bash
# Local
echo $NEXT_PUBLIC_SUPABASE_URL

# Or check via Next.js runtime
curl http://localhost:3000/api/health  # if a health endpoint exists
```
