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
order.keebforge.in/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── admin/                    # Admin dashboard (protected)
│   │   │   ├── layout.tsx            # Admin nav bar layout
│   │   │   ├── loading.tsx           # Loading state
│   │   │   ├── error.tsx             # Error state
│   │   │   ├── page.tsx              # Dashboard overview + stats
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create new order form
│   │   │   └── orders/
│   │   │       ├── page.tsx          # All orders list
│   │   │       └── [orderNumber]/
│   │   │           └── page.tsx      # Edit order page
│   │   ├── api/
│   │   │   └── orders/
│   │   │       ├── route.ts          # GET/POST /api/orders
│   │   │       └── [id]/
│   │   │           ├── route.ts      # PATCH/DELETE /api/orders/:id
│   │   │           └── timeline/
│   │   │               └── route.ts  # GET/POST /api/orders/:id/timeline
│   │   ├── login/
│   │   │   └── page.tsx              # Admin login page
│   │   ├── track/
│   │   │   └── [orderNumber]/
│   │   │       ├── loading.tsx       # Loading state
│   │   │       ├── error.tsx         # Error state
│   │   │       └── page.tsx          # Public order tracking page
│   │   ├── loading.tsx               # Root loading state
│   │   ├── error.tsx                 # Root error state
│   │   ├── not-found.tsx             # 404 page
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles + CSS variables
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminOrderClient.tsx   # Admin order detail client wrapper
│   │   │   ├── AllOrdersTable.tsx     # Order listing table
│   │   │   ├── DashboardCharts.tsx    # Recharts chart components (client)
│   │   │   └── order-form/           # Admin order form sections (client)
│   │   │       ├── types.ts
│   │   │       ├── SearchableSelect.tsx
│   │   │       ├── CustomerInfoSection.tsx
│   │   │       ├── ProductsSection.tsx
│   │   │       ├── ServicesSection.tsx
│   │   │       ├── LogisticsSection.tsx
│   │   │       ├── ShippingAddressSection.tsx
│   │   │       ├── BillingSection.tsx
│   │   │       ├── CustomWorkSection.tsx
│   │   │       ├── NotesSection.tsx
│   │   │       ├── CustomerMessageSection.tsx
│   │   │       └── AdminToCustomerSection.tsx
│   │   ├── track/                    # Public tracking components
│   │   │   ├── TrackDashboard.tsx
│   │   │   ├── BuildProgress.tsx
│   │   │   ├── CostSummary.tsx
│   │   │   ├── LogisticsCard.tsx
│   │   │   ├── ProductsList.tsx
│   │   │   ├── RealTimeline.tsx
│   │   │   ├── ServicesList.tsx
│   │   │   ├── WarrantyCard.tsx
│   │   │   └── WorkshopUpdates.tsx
│   │   ├── ui/                       # Reusable UI primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Field.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── NetworkIndicator.tsx
│   │   │   ├── NoteTimeline.tsx
│   │   │   ├── NotesEditor.tsx
│   │   │   ├── OrderSearch.tsx
│   │   │   ├── SectionLabel.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── TaskNotification.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── TopProgressBar.tsx
│   │   ├── LogoutButton.tsx
│   │   ├── NumberInputGuard.tsx
│   │   ├── Providers.tsx
│   │   └── SiteNav.tsx
│   │
│   ├── constants/                    # Shared constants
│   │   ├── india-states.ts           # Indian states and UTs
│   │   ├── order-statuses.ts         # Order lifecycle statuses
│   │   └── services.ts               # Service catalog (pricing, descriptions)
│   │
│   ├── lib/                          # Shared utilities
│   │   ├── hooks/
│   │   │   ├── useReducedMotion.ts
│   │   │   ├── useTaskNotification.ts
│   │   │   ├── useToast.ts
│   │   │   └── useTopProgress.ts
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser-side Supabase client
│   │   │   ├── middleware.ts         # Auth middleware (session refresh)
│   │   │   └── server.ts             # Server-side Supabase client
│   │   ├── api-auth.ts               # Admin auth guard for API routes
│   │   ├── api-mutation.ts           # Client-side mutation helper
│   │   ├── api-response.ts           # Standardized API response helpers
│   │   ├── database.types.ts         # Supabase generated types
│   │   ├── email.ts                  # Email sending via Resend
│   │   ├── env.ts                    # Environment variable validation
│   │   ├── monitor.ts                # Performance monitoring
│   │   ├── order-compute.ts          # Billing/service totals computation
│   │   ├── rate-limit.ts             # Rate limiting utility
│   │   ├── resend.ts                 # Resend client setup
│   │   ├── stats.ts                  # Dashboard statistics computation
│   │   ├── supabaseAdmin.ts          # Service-role Supabase client
│   │   ├── tracking-sync.ts          # Sync orders → order_tracking
│   │   ├── types.ts                  # Shared TypeScript types
│   │   └── utils.ts                  # cn() helper
│   │
│   ├── proxy.ts                      # Next.js middleware (route protection)
│   ├── emails/                       # React Email templates
│   └── next.config.ts                # Security headers + build config
│
├── supabase/                         # Local Supabase development
│   ├── config.toml                   # Local Supabase configuration
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Full database schema
│   ├── cleanup.sql                   # Cleanup script for legacy objects
│   └── snippets/                     # SQL editor snippets
│
├── docs/                             # Project documentation
├── scripts/                          # Build scripts (generate-logo.js)
├── scratch/                          # Debug/scratch scripts
├── public/                           # Static assets
├── .env.example                      # Environment variable template
└── package.json
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

- Node.js 20+
- npm
- Docker (for local Supabase)
- Supabase CLI

### Installation

```bash
git clone https://github.com/SHADOW269/order.keebforge.in.git
cd order.keebforge.in
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
| `RESEND_API_KEY` | Resend API key for transactional emails | No |
| `EMAIL_FROM` | Sender email address | No |
| `NEXT_PUBLIC_APP_URL` | App URL for building links | No |

### Development

```bash
# Start local Supabase (from project root)
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

#### Option A: Local Development

```bash
npx supabase start
npx supabase db push
```

#### Option B: Production

```bash
npx supabase db push --db-url "postgresql://postgres:<password>@<host>:6543/postgres"
```

#### Schema Overview

The full schema is in `supabase/migrations/001_initial_schema.sql`. Key tables:

| Table | Purpose |
|-------|---------|
| `orders` | Admin table with full PII |
| `order_updates` | Timeline entries per order |
| `order_tracking` | Public-safe denormalized view (no PII) |

Enable RLS on `order_tracking` for public access:

```sql
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracking" ON order_tracking
  FOR SELECT USING (true);
```

The `orders` and `order_updates` tables should **not** have public RLS policies — they are accessed exclusively through admin API routes using the service_role key.

---

## Environment

- **Frontend**: Vercel (`order.keebforge.in`)
- **Database**: Supabase (PostgreSQL 17)
- **Email**: Resend
- **Domains**: `order.keebforge.in` (production), `keebforge.in` (apex)

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Pre-build (generate-logo) + production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## Future Roadmap

### Customer
- Email notifications (in progress — Resend integration)
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
