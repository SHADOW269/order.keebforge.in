# KeebForge Order Management & Tracking System

Internal order management dashboard and public order tracking system for KeebForge — a custom mechanical keyboard building service.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js 16 App Router                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Public Pages │  │ Admin Pages  │  │ API Routes     │ │
│  │ /track/:id   │  │ /admin/*     │  │ /api/orders/*  │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘ │
│         │                 │                   │          │
│  ┌──────┴──────────────────┴───────────────────┴──────┐ │
│  │                Supabase Client Layer                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │ │
│  │  │ Browser  │  │  Server  │  │ Admin (service   │ │ │
│  │  │ Client   │  │  Client  │  │ role)            │ │ │
│  └──┴──────────┴──┴──────────┴──┴──────────────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │   PostgreSQL (Supabase)  │
              │  ┌────────┐ ┌─────────┐  │
              │  │ orders │ │order_   │  │
              │  │        │ │tracking │  │
              │  └────────┘ └─────────┘  │
              └─────────────────────────┘
```

### Key Design Decisions

- **Two-table separation**: Admin data lives in `orders` (full PII). Customer-safe data is synced to `order_tracking` (no PII). This prevents data leaks.
- **Service-role for admin ops**: All admin API routes use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS. Public tracking uses the anon key with strict RLS.
- **Server Components by default**: Data-fetching pages (tracking, dashboard) are server components. Only interactive admin forms are client components.
- **No customer accounts**: Customers track via order number only. Admins authenticate via Supabase Auth.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL 17 (Supabase) |
| Auth | Supabase Auth |
| Charts | Recharts |
| Hosting | Vercel (frontend) + Supabase (database) |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── layout.tsx            # Force-dynamic for admin routes
│   │   ├── loading.tsx           # Loading state
│   │   ├── error.tsx             # Error state
│   │   ├── page.tsx              # Dashboard overview + stats
│   │   ├── new/
│   │   │   └── page.tsx          # Create new order form
│   │   └── orders/
│   │       └── [orderNumber]/
│   │           └── page.tsx      # Edit order page
│   ├── api/
│   │   └── orders/
│   │       ├── route.ts          # POST /api/orders
│   │       └── [id]/
│   │           ├── route.ts      # PATCH/DELETE /api/orders/:id
│   │           └── timeline/
│   │               └── route.ts  # POST /api/orders/:id/timeline
│   ├── login/
│   │   └── page.tsx              # Admin login page
│   ├── track/
│   │   └── [orderNumber]/
│   │       ├── loading.tsx       # Loading state
│   │       ├── error.tsx         # Error state
│   │       └── page.tsx          # Public order tracking page
│   ├── loading.tsx               # Root loading state
│   ├── error.tsx                 # Root error state
│   ├── not-found.tsx             # 404 page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles + CSS variables
│
├── components/
│   ├── admin/
│   │   ├── DashboardCharts.tsx   # Recharts chart components (client)
│   │   └── order-form/           # Admin order form sections (client)
│   │       ├── BillingSection.tsx
│   │       ├── CollapsibleSection.tsx
│   │       ├── LogisticsSection.tsx
│   │       ├── NotesSection.tsx
│   │       ├── ProductsSection.tsx
│   │       ├── SearchableSelect.tsx
│   │       ├── ServicesSection.tsx
│   │       ├── types.ts          # Re-exports from lib/types
│   │       └── WorkshopNotesSection.tsx
│   ├── track/                    # Public tracking components
│   │   ├── BuildProgress.tsx
│   │   ├── CostSummary.tsx
│   │   ├── LogisticsCard.tsx
│   │   ├── ProductsList.tsx
│   │   ├── RealTimeline.tsx
│   │   ├── ServicesList.tsx
│   │   ├── WarrantyCard.tsx
│   │   └── WorkshopUpdates.tsx
│   ├── ui/                       # Reusable UI primitives
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Field.tsx
│   │   ├── Loading.tsx
│   │   ├── NotesEditor.tsx
│   │   └── SectionLabel.tsx
│   └── LogoutButton.tsx          # Admin logout (client)
│
├── constants/                    # Shared constants
│   ├── india-states.ts           # Indian states and UTs
│   ├── order-statuses.ts         # Order lifecycle statuses
│   └── services.ts               # Service catalog (pricing, descriptions)
│
├── lib/                          # Shared utilities
│   ├── api-auth.ts               # Admin auth guard for API routes
│   ├── api-response.ts           # Standardized API response helpers
│   ├── order-compute.ts          # Billing/service totals computation
│   ├── stats.ts                  # Dashboard statistics computation
│   ├── supabase/
│   │   ├── client.ts             # Browser-side Supabase client
│   │   ├── middleware.ts         # Auth middleware (session refresh)
│   │   └── server.ts             # Server-side Supabase client
│   ├── supabaseAdmin.ts          # Service-role Supabase client (admin ops)
│   ├── tracking-sync.ts          # Sync orders → order_tracking
│   └── types.ts                  # Shared TypeScript types
│
├── middleware.ts                  # Route protection for /admin/*
└── next.config.ts                # Security headers + build config
```

---

## Order Lifecycle

```
Order Received → Order Confirmed → Payment Pending → Payment Received →
Parts Booked → Parts Shipped → Parts Received → In Queue → Work Started →
Testing → Completed → Packing → Shipment Booked → Shipment Picked Up →
In Transit → Delivered → Warranty Active → Order Completed
```

---

## Database Schema

### `orders` (admin table — contains PII)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| order_number | varchar(8) | Unique, e.g. KF000001 |
| customer_name | text | |
| customer_email | text | |
| customer_phone | text | |
| discord_username | text | |
| service_type | text | |
| current_status | text | Current lifecycle status |
| estimated_total | numeric | |
| street_address | text | |
| city | text | |
| state | text | |
| pincode | text | |
| products | jsonb | Array of products |
| selected_services | jsonb | Map of service IDs → quantities |
| billing | jsonb | Billing breakdown |
| courier | text | |
| tracking_number | text | |
| tracking_url | text | |
| estimated_dispatch_date | date | |
| estimated_delivery | date | |
| shipping_status | text | |
| warranty_status | text | |
| warranty_start_date | date | |
| warranty_end_date | date | |
| internal_notes | jsonb | Admin-only notes |
| customer_notes | jsonb | Customer-facing notes |
| is_deleted | boolean | Soft delete flag |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `order_updates` (timeline entries)

| Column | Type |
|--------|------|
| id | uuid |
| order_id | uuid → orders.id |
| status | text |
| note | text |
| created_at | timestamptz |

### `order_tracking` (public-safe view)

Synced from `orders` + `order_updates`. Contains **no PII**. Only fields customers are allowed to see.

---

## API Routes

All admin API routes require authentication. Public routes need no auth.

### `POST /api/orders`
Create a new order. Generates an order number (`KF######`).

### `PATCH /api/orders/:id`
Update order fields. Only allowed fields are accepted. Rolls back on sync failure.

### `DELETE /api/orders/:id`
Soft-delete (archive) an order. Sets `is_deleted = true`.

### `POST /api/orders/:id/timeline`
Add a timeline update. Updates the order's `current_status`.

---

## Security

- **Row Level Security (RLS)**: The `order_tracking` table should have RLS enabled allowing public select access only.
- **Service role isolation**: Admin API routes use `SUPABASE_SERVICE_ROLE_KEY` — never exposed to the client.
- **PII separation**: Customer names, email, phone, address, Discord handle, and internal notes never leave the `orders` table.
- **Input validation**: API routes validate JSON body and required fields.
- **Security headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy set in `next.config.ts`.
- **Soft delete**: Orders are archived, never permanently deleted.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project (local or cloud)

### Installation

```bash
git clone https://github.com/shadow269/track.keebforge.in.git
cd track.keebforge.in
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (server-only) | Yes |

### Development

```bash
# Start local Supabase (if using local development)
npx supabase start

# Start Next.js dev server
npm run dev
```

### Production Build

```bash
npm run build
npm run lint
```

### Database Setup

Run these SQL statements in your Supabase SQL Editor (Dashboard > SQL Editor) or via `psql`.

#### `orders` table (admin — contains PII)

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number varchar(8) NOT NULL UNIQUE,
  customer_name text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  discord_username text DEFAULT '',
  service_type text DEFAULT 'Custom Build Service',
  current_status text NOT NULL DEFAULT 'Order Received',
  estimated_total numeric DEFAULT 0,
  keyboard_pcb_model text DEFAULT '',
  switch_details text DEFAULT '',
  street_address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  pincode text DEFAULT '',
  products jsonb DEFAULT '[]'::jsonb,
  selected_services jsonb DEFAULT '{}'::jsonb,
  billing jsonb DEFAULT '{}'::jsonb,
  courier text DEFAULT '',
  tracking_number text DEFAULT '',
  tracking_url text DEFAULT '',
  shipping_status text DEFAULT 'Not Dispatched',
  estimated_dispatch_date date,
  estimated_delivery date,
  warranty_status text DEFAULT '',
  warranty_start_date date,
  warranty_end_date date,
  order_summary text DEFAULT '',
  internal_notes jsonb DEFAULT '[]'::jsonb,
  customer_notes jsonb DEFAULT '[]'::jsonb,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_status ON orders (current_status);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE INDEX idx_orders_not_deleted ON orders (is_deleted) WHERE is_deleted = false;
```

#### `order_updates` table (timeline entries)

```sql
CREATE TABLE order_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_updates_order ON order_updates (order_id, created_at DESC);
```

#### `order_tracking` table (public-safe view — no PII)

```sql
CREATE TABLE order_tracking (
  order_id uuid PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  order_number varchar(8) NOT NULL,
  status text,
  service_type text,
  products jsonb DEFAULT '[]'::jsonb,
  selected_services jsonb DEFAULT '{}'::jsonb,
  billing_summary jsonb DEFAULT '{}'::jsonb,
  estimated_total numeric,
  payment_status text,
  shipping_status text,
  tracking_number text,
  tracking_url text,
  courier text,
  estimated_dispatch date,
  estimated_delivery date,
  customer_notes jsonb DEFAULT '[]'::jsonb,
  timeline jsonb DEFAULT '[]'::jsonb,
  warranty_status text,
  warranty_start date,
  warranty_end date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tracking_order_number ON order_tracking (order_number);
```

#### Row-Level Security

Enable RLS on `order_tracking` (the only table customers query):

```sql
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anyone to look up an order by its number
CREATE POLICY "Anyone can view tracking" ON order_tracking
  FOR SELECT USING (true);
```

The `orders` and `order_updates` tables should **not** have public RLS policies — they are accessed exclusively through admin API routes using the service_role key.

#### Auto-generation for order numbers

Create a sequence or handle numbering in application code. The app generates `KF######` numbers (e.g. `KF000001`) at creation time via the API route.

---

## Environment

- **Frontend**: Vercel (`order.keebforge.in`)
- **Database**: Supabase
- **Domains**: `order.keebforge.in` (production)

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## Future Roadmap

### Customer
- Email notifications
- SMS notifications
- Live shipment tracking
- Build gallery
- Invoice download

### Admin
- Search and filters
- Bulk operations
- Order restore
- PDF invoice generation
- Photo uploads
- Timeline editor
- Admin roles and permissions
- Activity logs
- Automatic status emails

---

## License

Private project. Copyright © KeebForge. All rights reserved.

---

## Author

**Shadow269** — KeebForge
# order.keebforge.in
