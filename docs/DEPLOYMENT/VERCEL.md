# Vercel Deployment

## Prerequisites

- A Vercel account ([vercel.com](https://vercel.com))
- GitHub repository with the project code
- Supabase project (production) — see [SUPABASE.md](./SUPABASE.md)

## Step-by-Step

### 1. Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select the `order.keebforge.in` directory as the root (if using a monorepo)
4. Framework preset: **Next.js** (auto-detected)

### 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `.` (or `order.keebforge.in` if using a monorepo) |
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm install` (default) |

**Note:** The `supabase/` directory inside the project is only used for local development. Vercel does not need it during builds.

### 3. Configure Environment Variables

Add the following environment variables in the Vercel project settings (**Settings → Environment Variables**):

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key from Supabase | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase | All |

**Never commit these values to the repository.** Add them directly in Vercel.

### 4. Deploy

1. **Production:** Push to `main` branch (or configured production branch)
2. **Preview:** Push to any feature branch — Vercel creates a preview deployment automatically with unique URL

Alternatively, use the Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

### 5. Custom Domain

See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for configuring `order.keebforge.in`.

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database migrations have been applied to production Supabase
- [ ] Admin user can log in
- [ ] Order tracking page loads for public users
- [ ] API routes return correct responses
- [ ] RLS is enabled on production database

## Troubleshooting

### Build fails

```
Error: Module not found: @/lib/...
```

Check that path aliases in `tsconfig.json` are correct and the files exist.

```
Error: Supabase client initialization failed
```

Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set.

### 404 on page refresh

Next.js App Router handles this automatically. Ensure there are no custom rewrites in `next.config.ts` that interfere.

### 401 on API calls

The `requireAdmin()` function checks the Supabase auth session. Ensure:
- The user is logged in
- The session cookie is being sent with requests
- The cookie is not blocked by the browser (third-party cookie restrictions)

### Environment variables not available

- Client-side variables must be prefixed with `NEXT_PUBLIC_`
- Re-deploy after adding/changing environment variables
- Restart the Vercel dev server locally after changing `.env.local`

### Stale cache

Vercel caches the Next.js build output. If changes aren't showing:

1. Trigger a new deployment without cache: **Vercel Dashboard → Deployments → ⋮ → Redeploy (without cache)**
2. Or set `nextConfig.experimental.isrFlushToDisk` temporarily (for ISG issues)
