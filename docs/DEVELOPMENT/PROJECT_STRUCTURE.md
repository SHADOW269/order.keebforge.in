# Project Structure

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
│   │   │       ├── route.ts          # POST (create)
│   │   │       └── [id]/
│   │   │           ├── route.ts      # PATCH/DELETE
│   │   │           └── timeline/
│   │   │               └── route.ts  # POST timeline entry
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
│   │   │   ├── AllOrdersTable.tsx     # Order listing table
│   │   │   ├── DashboardCharts.tsx    # Dashboard chart components
│   │   │   └── order-form/           # Order form sections
│   │   │       ├── index.ts          # (implicit barrel exports)
│   │   │       ├── types.ts          # Form type definitions
│   │   │       ├── AdminToCustomerSection.tsx
│   │   │       ├── BillingSection.tsx
│   │   │       ├── CustomerInfoSection.tsx
│   │   │       ├── CustomerMessageSection.tsx
│   │   │       ├── CustomWorkSection.tsx
│   │   │       ├── LogisticsSection.tsx
│   │   │       ├── NotesSection.tsx
│   │   │       ├── ProductsSection.tsx
│   │   │       ├── SearchableSelect.tsx
│   │   │       ├── ServicesSection.tsx
│   │   │       └── ShippingAddressSection.tsx
│   │   ├── track/                    # Customer tracking components
│   │   │   ├── BuildProgress.tsx
│   │   │   ├── CostSummary.tsx
│   │   │   ├── LogisticsCard.tsx
│   │   │   ├── ProductsList.tsx
│   │   │   ├── RealTimeline.tsx
│   │   │   ├── ServicesList.tsx
│   │   │   ├── TrackDashboard.tsx
│   │   │   ├── WarrantyCard.tsx
│   │   │   └── WorkshopUpdates.tsx
│   │   ├── ui/                       # Shared UI primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Field.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── NotesEditor.tsx
│   │   │   ├── NoteTimeline.tsx
│   │   │   ├── OrderSearch.tsx
│   │   │   ├── SectionLabel.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   ├── LogoutButton.tsx
│   │   ├── NumberInputGuard.tsx
│   │   ├── Providers.tsx
│   │   └── SiteNav.tsx
│   ├── constants/                    # Static data & configuration
│   │   ├── india-states.ts           # Indian states & UTs
│   │   ├── order-statuses.ts         # Status definitions
│   │   └── services.ts              # Service catalog with pricing
│   └── lib/                          # Utilities, types, helpers
│       ├── hooks/
│       │   ├── useReducedMotion.ts
│       │   └── useToast.ts
│       ├── supabase/
│       │   ├── client.ts             # Browser client
│       │   ├── middleware.ts          # Auth middleware
│       │   └── server.ts             # Server client
│       ├── api-auth.ts               # requireAdmin()
│       ├── api-response.ts           # JSON response helpers
│       ├── database.types.ts         # Supabase type definitions
│       ├── order-compute.ts          # Billing computation
│       ├── stats.ts                  # Dashboard statistics
│       ├── supabaseAdmin.ts          # Service role client
│       ├── tracking-sync.ts          # syncTrackingRecord()
│       ├── types.ts                  # Application types
│       └── utils.ts                  # cn() helper
├── proxy.ts                          # Next.js middleware
├── next.config.ts
├── tsconfig.json
├── package.json
├── eslint.config.mjs
└── .env.local                        # Local environment variables
```

## Supabase Directory

```
supabase/
├── config.toml                       # Local Supabase config
├── migrations/                       # Database migrations
│   ├── 001_schema.sql
│   ├── 002_indexes.sql
│   ├── 003_functions.sql
│   ├── 004_rls.sql
│   ├── 005_views.sql
│   ├── 006_seed.sql
│   ├── 007_grants.sql
│   ├── 008_security_fixes.sql
│   └── 009_apply_security_fixes.sql
├── snippets/                         # SQL snippets
└── .temp/                            # CLI temporary data
```
