# Functions

## trigger_set_updated_at()

A trigger function that automatically sets `updated_at = now()` on row update.

```sql
CREATE FUNCTION trigger_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

**Used by:** Trigger `set_updated_at` on `orders` table.

---

## generate_order_number()

Generates a unique order number in the format `KF-XXXXXX` where `XXXXXX` is a 6-character uppercase alphanumeric string.

```sql
CREATE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    result := 'KF-';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    done := NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = result);
  END LOOP;
  RETURN result;
END;
$$;
```

**Called by:** API route when creating orders (`POST /api/orders`).

---

## is_admin()

Checks whether the current authenticated user is an admin (hardik@keebforge.in).

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

**Called by:** RLS policies on 15+ tables.

**Security note:** Must remain SECURITY DEFINER because it's invoked within RLS policy checks. Without SECURITY DEFINER, the function would run as the calling user and RLS on `profiles` could hide the admin's row, causing the check to fail.

---

## sync_order_tracking(p_order_id UUID)

Rebuilds the denormalized `order_tracking` row from all related tables. Called after any order mutation.

```sql
CREATE FUNCTION sync_order_tracking(p_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- Reads from: orders, shipping_info, payments (latest), warranty_records,
--             order_products, order_services, admin_customer_notes,
--             order_timeline, customer_messages
-- Writes to: order_tracking (UPSERT)
--           + DELETE if order.is_deleted is true
$$;
```

**Called by:** API routes after every order create/update/delete/timeline update.

**Synced data:**
- Order metadata (number, status, service type, estimated total)
- Products list (type + name, sorted by sort_order)
- Services map (service_id → quantity)
- Billing summary (extra charges, discounts, tax, shipping costs, amount paid)
- Shipping info (status, tracking, courier, dates)
- Customer notes (visible to customer on tracking page)
- Timeline (all status updates, newest first)
- Warranty info (status, start date, end date)

**Edge case:** If `orders.is_deleted = true`, the function deletes the tracking row instead of upserting.

---

## get_admin_order(p_order_id UUID)

Returns the complete order detail as a single JSONB object, joining across all related tables. Used internally by the admin panel.

```sql
CREATE FUNCTION get_admin_order(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- Joins: orders, customers, addresses, shipping_info, warranty_records
-- Subqueries: order_products, order_services, order_custom_work,
--             payments, order_timeline, customer_messages,
--             admin_customer_notes, admin_internal_notes
$$;
```

**Returns:** A JSONB object with keys: `id`, `order_number`, `customer`, `address`, `service_type`, `current_status`, `order_summary`, `estimated_total`, `billing_details`, `is_deleted`, `created_at`, `updated_at`, `products`, `services`, `custom_work`, `shipping`, `payments`, `timeline`, `customer_messages`, `admin_customer_notes`, `admin_internal_notes`, `warranty`.

**Security note:** EXECUTE is granted to **service_role only**. This function bypasses RLS and returns all data including internal notes. It must never be callable from client-side code.
