# Troubleshooting

## Local Development

### Supabase Won't Start

```bash
npx supabase start
# Error: Cannot connect to the Docker daemon
```

**Fix:** Start Docker Desktop/Docker daemon first.

```bash
npx supabase start
# Error: Port 54321 already in use
```

**Fix:** Change port in `supabase/config.toml` or stop the process using that port.

```bash
npx supabase start
# Takes forever / downloads images every time
```

**Fix:** Ensure Docker has stable internet. First download is slow; subsequent starts use cached images.

### Migration Failures

```
npx supabase db push
# Error: relation "public.orders" already exists
```

**Fix:** The migration was partially applied. Use repair:

```bash
npx supabase migration repair --status applied 001
# Then retry
npx supabase db push
```

```
npx supabase db push
# Error: syntax error at or near "IF"
```

**Fix:** Check the migration SQL for syntax issues. If the error is in a specific migration, you can reset and reapply from scratch:

```bash
npx supabase db reset
```

### Docker Issues

```bash
docker ps
# Error: permission denied
```

**Fix:** Add your user to the Docker group:

```bash
sudo usermod -aG docker $USER
# Then log out and back in
```

```bash
# Docker runs out of disk space
```

**Fix:** Clean up unused Docker resources:

```bash
docker system prune -a
```

### Node.js / npm Issues

```bash
npm install
# Error: EACCES: permission denied
```

**Fix:** Don't use `sudo` with npm. Fix permissions:

```bash
sudo chown -R $(whoami) ~/.npm
```

```bash
npm run dev
# Error: Module not found: @/lib/...
```

**Fix:** Ensure `tsconfig.json` has the path alias configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Vercel Deployment

### Build Fails

```
Error: Command "npm run build" exited with 1
```

Check the build logs in Vercel Dashboard. Common causes:
- TypeScript errors — run `npm run typecheck` locally first
- Missing modules — ensure `npm install` works locally
- Environment variables — verify all required vars are set in Vercel

### Page Not Found on Refresh

Ensure no custom rewrites in `next.config.ts` conflict with App Router routes.

### API Returns 401

- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables
- Ensure the session cookie is being sent (check browser dev tools → Network → Request Headers)

### Environment Variables Not Working

- Client-side vars must be prefixed with `NEXT_PUBLIC_`
- After adding/changing env vars in Vercel, redeploy
- The old build may be cached — use **Redeploy (without cache)**

## Database

### Permission Denied

```
ERROR: permission denied for table orders
```

**Fix:** Check RLS policies. The user may not have the correct role. For anon-access tables like `order_tracking`, ensure the SELECT policy is permissive (`true`).

### Function Not Found

```
ERROR: function sync_order_tracking(uuid) does not exist
```

**Fix:** Ensure migrations are fully applied. The function may be in a later migration.

### is_admin() Returns False

1. Check that the admin user profile exists in the `profiles` table
2. Verify the profile's `id` matches `auth.users.id` for the authenticated user
3. Check that `email` matches `'hardik@keebforge.in'`
4. Ensure RLS on `profiles` allows reading the admin row (the function is SECURITY DEFINER, so this shouldn't be an issue)

## Authentication

### Can't Log In

- Check credentials in Supabase Auth dashboard
- For local dev: check Inbucket at `http://localhost:54324` for confirmation emails
- Ensure `Site URL` and `Redirect URLs` are configured in Supabase Auth settings

### Session Expired Immediately

Check `JWT expiry` setting in Supabase Auth settings (default 3600s = 1 hour).

### Redirect Loop on Admin Pages

Clear browser cookies and local storage. The middleware might have a stale session cookie.

## RLS

### Query Returns Empty Results

Run the same query in Supabase SQL Editor to check:
- Is RLS enabled? (`SELECT * FROM pg_tables WHERE tablename = 'orders'` — check `rowsecurity`)
- Are policies created correctly?
- Does `is_admin()` return true for the current user?

### Policy Not Applied

Check policy order. PostgreSQL evaluates all permissive policies — if one allows access, access is granted. Restrictive policies (with `WITH CHECK`) are separate from permissive ones.

## Build Errors

### TypeScript Errors

```bash
npm run typecheck
```

Fix reported errors before building.

### Hydration Errors

Common causes:
- Different HTML on server vs client render
- Browser extensions modifying DOM
- Using `useEffect` without proper client-side only rendering

Fix:
- Ensure consistent rendering between server and client
- Use `suppressHydrationWarning` on intentionally different elements (like timestamps)
- Check for third-party scripts modifying the DOM

### CSS / Tailwind Issues

- Tailwind v4 uses the new `@import "tailwindcss"` syntax (not the v3 `@tailwind` directives)
- Custom utilities are defined with `@utility` in `globals.css`
- Ensure PostCSS config is compatible with Tailwind v4
