# Domain Setup

## Custom Domain: order.keebforge.in

The application is deployed at `order.keebforge.in`, a subdomain of keebforge.in.

## DNS Configuration

### Apex Domain (keebforge.in)

Configure at your DNS provider (e.g., GoDaddy, Cloudflare, Namecheap):

| Record Type | Name | Value | Notes |
|------------|------|-------|-------|
| CNAME | `order` | `cname.vercel-dns.com` | Points subdomain to Vercel |

If using Cloudflare:

| Record Type | Name | Value | Proxy |
|------------|------|-------|-------|
| CNAME | `order` | `cname.vercel-dns.com` | DNS only (grey cloud) or Proxied (orange cloud) |

### Alternative: A Records

If CNAME is not supported, use Vercel's IP addresses (check current IPs in Vercel docs):

| Record Type | Name | Value |
|------------|------|-------|
| A | `order` | `76.76.21.21` |

## Vercel Configuration

### Add Domain

1. **Vercel Dashboard → Project → Settings → Domains**
2. Enter `order.keebforge.in`
3. Click **Add**

Vercel will:
- Verify DNS configuration
- Provision an SSL certificate via Let's Encrypt
- Configure automatic HTTPS redirects

### SSL/TLS

- Vercel provides automatic SSL certificates
- No manual certificate management needed
- Certificates renew automatically

## Supabase Configuration

Update Supabase Auth settings to reflect the custom domain:

1. **Supabase Dashboard → Authentication → Settings**
2. Set **Site URL** to `https://order.keebforge.in`
3. Add `https://order.keebforge.in/**` to **Redirect URLs**

## Verification

```bash
# DNS propagation check
dig order.keebforge.in CNAME +short

# SSL certificate check
curl -I https://order.keebforge.in

# Full page load test
curl -L https://order.keebforge.in
```

## Troubleshooting

### DNS not propagating

DNS changes can take 24–48 hours to propagate globally. Use:

```bash
dig order.keebforge.in @8.8.8.8  # Query Google DNS directly
```

### SSL certificate not issued

Vercel provisions certificates after DNS is verified. If it's stuck:

1. Ensure the CNAME record points to `cname.vercel-dns.com`
2. Remove and re-add the domain in Vercel settings
3. Wait up to 30 minutes

### Mixed content warnings

If the tracking page shows mixed content warnings, ensure:
- All API calls use `https://`
- External resources (fonts, images) use `https://`
- Couriers' tracking URLs (if embedded) use `https://`

### Redirect loop

Clear browser cache and cookies. If the issue persists, check:
- Middleware (`src/proxy.ts`) is not redirecting incorrectly
- Auth session cookies are valid
- `NEXT_PUBLIC_SUPABASE_URL` uses the correct production URL
