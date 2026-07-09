# Tables

## profiles

Stores admin user metadata. Currently used for the `is_admin()` check.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, references `auth.users` | Supabase Auth user ID |
| `email` | `text` | | Admin email address |
| `name` | `text` | | Display name |

**RLS:** Admin only (`USING (public.is_admin())`)

---

## customers

Stores customer contact information.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `name` | `text` | NOT NULL | Customer name |
| `email` | `text` | | Used for dedup on create |
| `phone` | `text` | | |
| `discord_username` | `text` | | Optional Discord handle |
| `created_at` | `timestamptz` | default `now()` | |

**Indexes:** `idx_customers_email_phone` on `(email, phone)`

---

## addresses

Stores shipping addresses.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `street_address` | `text` | NOT NULL | |
| `city` | `text` | NOT NULL | |
| `state` | `text` | NOT NULL | Indian state |
| `pincode` | `text` | NOT NULL | |
| `created_at` | `timestamptz` | default `now()` | |

---

## orders

Core order table. Links customers, addresses, billing, and all related data.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `order_number` | `text` | UNIQUE NOT NULL | Format: `KF-XXXXXX` |
| `customer_id` | `uuid` | FK → `customers(id)` NOT NULL | |
| `address_id` | `uuid` | FK → `addresses(id)` NOT NULL | |
| `service_type` | `text` | NOT NULL | e.g. "Full Build", "Assembly Only" |
| `current_status` | `text` | NOT NULL, default `'order_received'` | One of 18 statuses |
| `order_summary` | `jsonb` | | Stores computed summary |
| `estimated_total` | `numeric(10,2)` | | Computed grand total |
| `billing_details` | `jsonb` | | JSON with extra_charges, discounts, tax |
| `is_deleted` | `boolean` | default `false` | Soft-delete flag |
| `created_at` | `timestamptz` | default `now()` | |
| `updated_at` | `timestamptz` | default `now()` | Auto-updated by trigger |

**Indexes:** `idx_orders_dashboard` on `(is_deleted, created_at DESC)`, `idx_orders_number_lookup` on `(order_number)`

---

## order_products

Line items for products included in an order.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `order_id` | `uuid` | FK → `orders(id)` NOT NULL | |
| `type` | `text` | NOT NULL | `product_type` enum |
| `name` | `text` | NOT NULL | |
| `sort_order` | `integer` | default `0` | Display ordering |

---

## order_services

Selected services for an order with quantities.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `order_id` | `uuid` | FK → `orders(id)` NOT NULL | |
| `service_id` | `text` | NOT NULL | References constants/services.ts |
| `quantity` | `integer` | default `1` | |

---

## order_custom_work

Custom work items (keyboard/mouse builds, repairs).

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `order_id` | `uuid` | FK → `orders(id)` NOT NULL | |
| `name` | `text` | NOT NULL | |
| `category` | `text` | NOT NULL | `custom_work_category` enum |
| `description` | `text` | | Free-text description |
| `price` | `numeric(10,2)` | default `0` | |
| `sort_order` | `integer` | default `0` | |

---

## shipping_info

Shipping details for an order (1:1 with orders).

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `order_id` | `uuid` | FK → `orders(id)`, UNIQUE NOT NULL | |
| `shipping_status` | `text` | NOT NULL, default `'not_dispatched'` | `shipping_status` enum |
| `tracking_number` | `text` | | Courier tracking number |
| `tracking_url` | `text` | | URL to courier tracking page |
| `courier` | `text` | | Courier name |
| `shipping_cost` | `numeric(10,2)` | default `0` | |
| `packaging_cost` | `numeric(10,2)` | default `0` | |
| `estimated_dispatch_date` | `date` | | |
| `estimated_delivery_date` | `date` | | |

---

## payments

Payment records for an order (1:N, multiple payments possible).

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `order_id` | `uuid` | FK → `orders(id)` NOT NULL | |
| `payment_status` | `text` | NOT NULL | `payment_status` enum |
| `amount_paid` | `numeric(10,2)` | default `0` | |
| `created_at` | `timestamptz` | default `now()` | |

**Indexes:** `idx_payments_status` on `(order_id, payment_status)`

---

## order_timeline

Chronological log of status changes for an order.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `order_id` | `uuid` | FK → `orders(id)` NOT NULL | |
| `status` | `text` | NOT NULL | Status enum value |
| `note` | `text` | | Optional admin note |
| `created_at` | `timestamptz` | default `now()` | |

---

## order_tracking

Denormalized, public-safe view of order data. Synced by `sync_order_tracking()` after every mutation. This is the table customers query.

| Column | Type | Constraints |
|--------|------|------------|
| `order_id` | `uuid` | PK, FK → `orders(id)` |
| `order_number` | `text` | |
| `status` | `text` | |
| `service_type` | `text` | |
| `products` | `jsonb` | Array of `{type, name}` |
| `selected_services` | `jsonb` | Object of `{service_id: quantity}` |
| `billing_summary` | `jsonb` | |
| `estimated_total` | `numeric(10,2)` | |
| `payment_status` | `text` | |
| `shipping_status` | `text` | |
| `tracking_number` | `text` | |
| `tracking_url` | `text` | |
| `courier` | `text` | |
| `estimated_dispatch` | `date` | |
| `estimated_delivery` | `date` | |
| `customer_notes` | `jsonb` | Array of notes visible to customer |
| `timeline` | `jsonb` | Array of status updates |
| `warranty_status` | `text` | |
| `warranty_start` | `date` | |
| `warranty_end` | `date` | |
| `updated_at` | `timestamptz` | |

**RLS:** Public SELECT, admin INSERT/UPDATE/DELETE.

---

## customer_messages

Messages from customer to admin (e.g., order instructions).

| Column | Type | Constraints |
|--------|------|------------|
| `id` | `uuid` | PK |
| `order_id` | `uuid` | FK → `orders(id)` |
| `message` | `text` | |

---

## admin_customer_notes

Notes from admin visible to the customer on the tracking page.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | `uuid` | PK |
| `order_id` | `uuid` | FK → `orders(id)` |
| `text` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

---

## admin_internal_notes

Notes from admin **not** visible to customers.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | `uuid` | PK |
| `order_id` | `uuid` | FK → `orders(id)` |
| `text` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

---

## warranty_records

Warranty information for completed orders (1:1 with orders).

| Column | Type | Constraints |
|--------|------|------------|
| `id` | `uuid` | PK |
| `order_id` | `uuid` | FK → `orders(id)`, UNIQUE |
| `warranty_status` | `text` | e.g. "active", "expired", "claimed" |
| `warranty_start` | `date` | |
| `warranty_end` | `date` | |
