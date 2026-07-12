# Project Structure

## Application Source

```
order.keebforge.in/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── admin/                    # Admin panel (authenticated)
│   │   │   ├── layout.tsx            # Admin nav bar layout
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── error.tsx             # Error boundary
│   │   │   ├── loading.tsx           # Loading skeleton
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create order form
│   │   │   └── orders/
│   │   │       ├── page.tsx          # All orders table
│   │   │       └── [orderNumber]/
│   │   │           └── page.tsx      # Order detail/edit
│   │   ├── api/
│   │   │   └── orders/              # REST API routes
│   │   │       ├── route.ts          # GET/POST (list + create)
│   │   │       └── [id]/
│   │   │           ├── route.ts      # PATCH/DELETE
│   │   │           └── timeline/
│   │   │               └── route.ts  # GET/POST timeline entries
│   │   ├── login/
│   │   │   └── page.tsx              # Admin login page
│   │   ├── track/
│   │   │   └── [orderNumber]/
│   │   │       ├── page.tsx          # Public tracking page
│   │   │       ├── error.tsx         # Error boundary
│   │   │       └── loading.tsx       # Loading state
│   │   ├── globals.css               # Global styles + Tailwind
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── error.tsx                 # Root error boundary
│   │   ├── loading.tsx               # Root loading
│   │   └── not-found.tsx             # 404 page
│   ├── components/
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── AdminOrderClient.tsx   # Order detail client wrapper
│   │   │   ├── AllOrdersTable.tsx     # Order listing table
│   │   │   ├── DashboardCharts.tsx    # Dashboard chart components
│   │   │   └── order-form/           # Order form sections
│   │   │       ├── types.ts          # Form type definitions
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
│   │   ├── track/                    # Customer tracking components
│   │   │   ├── TrackDashboard.tsx
│   │   │   ├── BuildProgress.tsx
│   │   │   ├── CostSummary.tsx
│   │   │   ├── LogisticsCard.tsx
│   │   │   ├── ProductsList.tsx
│   │   │   ├── RealTimeline.tsx
│   │   │   ├── ServicesList.tsx
│   │   │   ├── WarrantyCard.tsx
│   │   │   └── WorkshopUpdates.tsx
│   │   ├── ui/                       # Shared UI primitives
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
│   ├── constants/                    # Static data & configuration
│   │   ├── india-states.ts           # Indian states & UTs
│   │   ├── order-statuses.ts         # Status definitions
│   │   └── services.ts              # Service catalog with pricing
│   ├── emails/                       # React Email templates
│   ├── lib/                          # Utilities, types, helpers
│   │   ├── hooks/
│   │   │   ├── useReducedMotion.ts
│   │   │   ├── useTaskNotification.ts
│   │   │   ├── useToast.ts
│   │   │   └── useTopProgress.ts
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── middleware.ts          # Session refresh logic
│   │   │   └── server.ts             # Server client
│   │   ├── api-auth.ts               # requireAdmin()
│   │   ├── api-mutation.ts           # Client-side mutation helper
│   │   ├── api-response.ts           # JSON response helpers
│   │   ├── database.types.ts         # Supabase type definitions
│   │   ├── email.ts                  # Email sending via Resend
│   │   ├── env.ts                    # Environment variable validation
│   │   ├── monitor.ts                # Performance monitoring
│   │   ├── order-compute.ts          # Billing computation
│   │   ├── rate-limit.ts             # Rate limiting utility
│   │   ├── resend.ts                 # Resend client setup
│   │   ├── stats.ts                  # Dashboard statistics
│   │   ├── supabaseAdmin.ts          # Service role client
│   │   ├── tracking-sync.ts          # syncTrackingRecord()
│   │   ├── types.ts                  # Application types
│   │   └── utils.ts                  # cn() helper
│   ├── proxy.ts                      # Next.js middleware (route protection)
│   └── next.config.ts                # Security headers + build config
├── supabase/                         # Local Supabase development
│   ├── config.toml                   # Local Supabase configuration
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Full database schema
│   ├── cleanup.sql                   # Cleanup script for legacy objects
│   └── snippets/                     # SQL editor snippets
├── docs/                             # Project documentation
├── scripts/                          # Build scripts
│   └── generate-logo.js             # Logo generation (pre-build)
├── scratch/                          # Debug/scratch scripts
├── public/                           # Static assets
├── .env.example                      # Environment variable template
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── package.json
└── eslint.config.mjs
```

## Key Directories

### `src/app/` — Routes

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Page | Public | Landing page |
| `/login` | Page | Public | Admin login |
| `/track/[orderNumber]` | Page | Public | Customer order tracking |
| `/admin` | Page | Admin | Dashboard with KPIs |
| `/admin/new` | Page | Admin | Create new order |
| `/admin/orders` | Page | Admin | All orders list |
| `/admin/orders/[orderNumber]` | Page | Admin | Order detail/edit |
| `/api/orders` | API | Admin | Create/list orders |
| `/api/orders/[id]` | API | Admin | Update/delete order |
| `/api/orders/[id]/timeline` | API | Admin | Manage timeline entries |

### `src/lib/supabase/` — Client Configuration

| File | Purpose |
|------|---------|
| `client.ts` | Browser-side client (`createBrowserClient`) |
| `server.ts` | Server-side client (`createServerClient` with cookies) |
| `middleware.ts` | Session refresh + admin route protection |

### `supabase/` — Database

| File | Purpose |
|------|---------|
| `config.toml` | Local Supabase config (ports, auth, services) |
| `migrations/001_initial_schema.sql` | Full schema (tables, RLS, functions, indexes) |
| `cleanup.sql` | One-time cleanup for legacy objects |
| `snippets/` | Saved SQL queries from Supabase Studio |
