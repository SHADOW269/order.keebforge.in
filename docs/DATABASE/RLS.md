# Row-Level Security

RLS is enabled on all data tables. Policies are designed to:
- Allow **public read** of tracking data
- Allow **admin full access** to all tables
- Restrict **anon** users from admin data

## is_admin() Function

The core authorization primitive used by almost every RLS policy:

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

## Policies by Table

### profiles

| Policy | Operation | Using/Check | Effect |
|--------|-----------|-------------|--------|
| `profiles_self_access` | ALL | `id = auth.uid()` | Users can see their own profile |
| `profiles_admin_all` | ALL | `public.is_admin()` | Admin can see all profiles |

### orders, customers, addresses, payments, shipping_info

Each of these has a single admin policy:

| Policy | Operation | Using/Check |
|--------|-----------|-------------|
| `{table}_admin_all` | ALL | `public.is_admin()` |

### order_products, order_services, order_custom_work

Same pattern — admin-only access:

| Policy | Operation | Using/Check |
|--------|-----------|-------------|
| `{table}_admin_all` | ALL | `public.is_admin()` |

### order_timeline

| Policy | Operation | Using/Check |
|--------|-----------|-------------|
| `order_timeline_admin_all` | ALL | `public.is_admin()` |

### customer_messages, admin_customer_notes, admin_internal_notes

| Policy | Operation | Using/Check |
|--------|-----------|-------------|
| `{table}_admin_all` | ALL | `public.is_admin()` |

### warranty_records

| Policy | Operation | Using/Check |
|--------|-----------|-------------|
| `warranty_records_admin_all` | ALL | `public.is_admin()` |

### order_tracking (Public-Facing)

| Policy | Operation | Using/Check | Notes |
|--------|-----------|-------------|-------|
| `order_tracking_select_all` | SELECT | `true` | Anyone can read tracking data |
| `order_tracking_admin_insert` | INSERT | `public.is_admin()` | |
| `order_tracking_admin_update` | UPDATE | `public.is_admin()` | |
| `order_tracking_admin_delete` | DELETE | `public.is_admin()` | |

## Policy Design Rationale

**Why use `USING (public.is_admin())` instead of a direct email check?**
- The `is_admin()` function is reusable across all tables
- If the admin check logic changes, it's updated in one place
- The function is SECURITY DEFINER so it can actually read the `profiles` table

**Why does order_tracking have separate INSERT/UPDATE/DELETE policies?**
- Supabase Security Advisor warns about "Multiple Permissive Policies" when a single `FOR ALL` policy overlaps with other policies on the same table
- Splitting into individual operation policies eliminates the warning while maintaining the same security posture

**Why is there no RLS on views?**
- Views use `security_invoker = true`, so they inherit the RLS policies of the underlying tables
- The view owner's permissions are not checked — only the calling user's permissions matter
