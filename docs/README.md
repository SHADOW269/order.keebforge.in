# KeebForge Order Tracking

A full-stack order management and customer tracking system for KeebForge, a custom mechanical keyboard workshop. Built with Next.js and Supabase.

## Features

- **Customer Tracking** — Real-time order tracking by order number with build progress, timeline, shipping info, warranty status, and cost summary
- **Admin Dashboard** — Full order management with KPIs, revenue analytics, and production pipeline overview
- **Order Lifecycle** — 18 status stages from "Order Received" through "Order Completed" with granular timeline tracking
- **Billing Engine** — Automatic computation of subtotals, discounts (flat/percentage), tax, and balances
- **Role-Based Access** — Public tracking via order number; admin panel secured by Supabase Auth + Row-Level Security
- **Denormalized Tracking View** — Public-safe `order_tracking` table synced via PostgreSQL function for fast reads

## Screenshots

_Screenshots to be added._

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL 17 (via Supabase) |
| Auth | Supabase Auth (email/password) |
| ORM / Client | Supabase JS (`@supabase/ssr`, `@supabase/supabase-js`) |
| Charts | Recharts |
| Animations | animejs |
| Icons | Lucide React |
| Deployment | Vercel + Supabase |

## Folder Structure

```
order.keebforge.in/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin panel pages
│   │   │   ├── new/         # Create order
│   │   │   └── orders/      # All orders + order detail
│   │   ├── api/             # API route handlers
│   │   ├── login/           # Admin login
│   │   ├── track/           # Customer tracking
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── admin/           # Admin UI components
│   │   ├── track/           # Customer tracking components
│   │   └── ui/              # Shared UI primitives
│   ├── constants/           # Statuses, services, states
│   ├── lib/                 # Utilities, types, API helpers
│   └── proxy.ts             # Next.js middleware
supabase/
├── migrations/              # Database migrations (001–009)
└── config.toml              # Local Supabase configuration
```

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Docker
- Supabase CLI

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/keebforge.git
cd keebforge/order.keebforge.in

# 2. Install JavaScript dependencies
npm install

# 3. Start local Supabase
cd ../supabase
supabase start

# 4. Run database migrations
supabase db push

# 5. Start the development server
cd ../order.keebforge.in
npm run dev
```

The app is available at `http://localhost:3000`. Supabase Studio runs at `http://localhost:54323`.

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
```

Get local keys from `supabase status`.

## Building

```bash
npm run build
```

## Deploying

1. Push migrations to production Supabase: `supabase db push --db-url <production-url>`
2. Connect the GitHub repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

See [DEPLOYMENT/](./DEPLOYMENT/) for detailed guides.

## Documentation

| Document | Description |
|----------|------------|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | High-level project explanation |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and data flow |
| [DATABASE.md](./DATABASE.md) | Database schema, tables, relationships |
| [SECURITY.md](./SECURITY.md) | Authentication, authorization, RLS |
| [DEPLOYMENT/LOCAL_DEVELOPMENT.md](./DEPLOYMENT/LOCAL_DEVELOPMENT.md) | Local setup guide |
| [DEPLOYMENT/VERCEL.md](./DEPLOYMENT/VERCEL.md) | Vercel deployment guide |
| [DEPLOYMENT/SUPABASE.md](./DEPLOYMENT/SUPABASE.md) | Supabase setup and management |
| [ADMIN/DASHBOARD.md](./ADMIN/DASHBOARD.md) | Admin panel documentation |
| [CUSTOMER/TRACKING.md](./CUSTOMER/TRACKING.md) | Customer tracking page |
| [API/ROUTES.md](./API/ROUTES.md) | API endpoint reference |
| [DEVELOPMENT/](./DEVELOPMENT/) | Coding guidelines and project structure |

## License

Private — internal use.
