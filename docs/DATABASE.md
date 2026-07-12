# Database Overview

The database is a **PostgreSQL 17** instance managed by Supabase. It contains **15 tables**, **2 views**, **5 functions**, **1 trigger**, and a comprehensive set of **Row-Level Security policies**.

---

## Entity-Relationship Diagram

```mermaid
erDiagram
    customers ||--o{ orders : "places"
    customers ||--o{ customer_messages : "sends"
    addresses ||--o{ orders : "shipped to"
    orders ||--o{ order_products : "includes"
    orders ||--o{ order_services : "includes"
    orders ||--o{ order_custom_work : "includes"
    orders ||--o{ shipping_info : "has"
    orders ||--o{ payments : "has"
    orders ||--o{ order_timeline : "tracks"
    orders ||--o{ customer_messages : "has"
    orders ||--o{ admin_customer_notes : "has"
    orders ||--o{ admin_internal_notes : "has"
    orders ||--o{ warranty_records : "has"
    orders ||--o{ order_tracking : "syncs to"

    customers {
        uuid id PK
        text name
        text email UK
        text phone
        text discord_username
        timestamptz created_at
    }

    addresses {
        uuid id PK
        text street_address
        text city
        text state
        text pincode
        timestamptz created_at
    }

    orders {
        uuid id PK
        text order_number UK
        uuid customer_id FK
        uuid address_id FK
        text service_type
        text current_status
        jsonb order_summary
        numeric estimated_total
        jsonb billing_details
        boolean is_deleted
        timestamptz created_at
        timestamptz updated_at
    }

    order_products {
        uuid id PK
        uuid order_id FK
        text type
        text name
        integer sort_order
    }

    order_services {
        uuid id PK
        uuid order_id FK
        text service_id
        integer quantity
    }

    order_custom_work {
        uuid id PK
        uuid order_id FK
        text name
        text category
        text description
        numeric price
        integer sort_order
    }

    shipping_info {
        uuid id PK
        uuid order_id FK UK
        text shipping_status
        text tracking_number
        text tracking_url
        text courier
        numeric shipping_cost
        numeric packaging_cost
        date estimated_dispatch_date
        date estimated_delivery_date
    }

    payments {
        uuid id PK
        uuid order_id FK
        text payment_status
        numeric amount_paid
        timestamptz created_at
    }

    order_timeline {
        uuid id PK
        uuid order_id FK
        text status
        text note
        timestamptz created_at
    }

    order_tracking {
        uuid order_id PK FK
        text order_number
        text status
        text service_type
        jsonb products
        jsonb selected_services
        jsonb billing_summary
        numeric estimated_total
        text payment_status
        text shipping_status
        text tracking_number
        text tracking_url
        text courier
        date estimated_dispatch
        date estimated_delivery
        jsonb customer_notes
        jsonb timeline
        text warranty_status
        date warranty_start
        date warranty_end
        timestamptz updated_at
    }

    warranty_records {
        uuid id PK
        uuid order_id FK UK
        text warranty_status
        date warranty_start
        date warranty_end
    }
```

---

## Key Relationships

| Parent | Child | Type | Foreign Key |
|--------|-------|------|-------------|
| `customers` | `orders` | 1:N | `orders.customer_id` → `customers.id` |
| `addresses` | `orders` | 1:N | `orders.address_id` → `addresses.id` |
| `orders` | `order_products` | 1:N | `order_products.order_id` → `orders.id` |
| `orders` | `order_services` | 1:N | `order_services.order_id` → `orders.id` |
| `orders` | `order_custom_work` | 1:N | `order_custom_work.order_id` → `orders.id` |
| `orders` | `shipping_info` | 1:1 | `shipping_info.order_id` → `orders.id` |
| `orders` | `payments` | 1:N | `payments.order_id` → `orders.id` |
| `orders` | `order_timeline` | 1:N | `order_timeline.order_id` → `orders.id` |
| `orders` | `customer_messages` | 1:N | `customer_messages.order_id` → `orders.id` |
| `orders` | `admin_customer_notes` | 1:N | `admin_customer_notes.order_id` → `orders.id` |
| `orders` | `admin_internal_notes` | 1:N | `admin_internal_notes.order_id` → `orders.id` |
| `orders` | `warranty_records` | 1:1 | `warranty_records.order_id` → `orders.id` |
| `orders` | `order_tracking` | 1:1 | `order_tracking.order_id` → `orders.id` |

## Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `orders_pkey` | orders | id | Primary key |
| `idx_orders_number_lookup` | orders | order_number | Fast order lookup by number |
| `idx_orders_dashboard` | orders | is_deleted, created_at DESC | Dashboard queries |
| `idx_orders_address` | orders | address_id | FK lookup (added in 008) |
| `idx_payments_status` | payments | order_id, payment_status | Payment status queries |
| `idx_customers_email_phone` | customers | email, phone | Customer dedup |
| `idx_order_timeline_lookup` | order_timeline | order_id, created_at DESC | **Dropped** (duplicate of PK index) |

## Triggers

| Trigger | Table | Function | Event | Purpose |
|---------|-------|----------|-------|---------|
| `set_updated_at` | orders | `trigger_set_updated_at()` | BEFORE UPDATE | Auto-update `updated_at` column |

## Functions

| Function | Type | Purpose |
|----------|------|---------|
| `trigger_set_updated_at()` | Trigger | Sets `updated_at = now()` on row update |
| `generate_order_number()` | SECURITY DEFINER | Generates `KF-XXXXXX` unique order numbers |
| `sync_order_tracking(p_order_id UUID)` | SECURITY DEFINER | Rebuilds the denormalized `order_tracking` row |
| `get_admin_order(p_order_id UUID)` | SECURITY DEFINER | Returns full order detail as JSONB |
| `is_admin()` | STABLE SECURITY DEFINER | Checks if the current user is an admin |

See [DATABASE/FUNCTIONS.md](./DATABASE/FUNCTIONS.md) for full details.

## Views

| View | Definition | Purpose |
|------|-----------|---------|
| `admin_orders_list` | Flattened orders + customer + address + shipping + payment | Admin order listing (all non-deleted) |
| `admin_order_kpis` | Same as above + amount_paid | Dashboard KPIs |

Both views use `security_invoker = true` so they respect the calling user's RLS policies.

## Row-Level Security

RLS is enabled on all data tables. Policies are documented in [DATABASE/RLS.md](./DATABASE/RLS.md) and [DATABASE/POLICIES.md](./DATABASE/POLICIES.md).

## Migrations

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Full schema — tables, enums, extensions, indexes, functions, RLS, views, grants, security fixes |

See [DATABASE/MIGRATIONS.md](./DATABASE/MIGRATIONS.md) for details.
