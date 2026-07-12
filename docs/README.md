# KeebForge Order Tracking

A full-stack order management and customer tracking system for KeebForge, a custom mechanical keyboard workshop. Built with Next.js 16 and Supabase.

## Features

- **Customer Tracking** — Real-time order tracking by order number with build progress, timeline, shipping info, warranty status, and cost summary
- **Admin Dashboard** — Full order management with KPIs, revenue analytics, and production pipeline overview
- **Order Lifecycle** — 18 status stages from "Order Received" through "Order Completed" with granular timeline tracking
- **Billing Engine** — Automatic computation of subtotals, discounts (flat/percentage), tax, and balances
- **Role-Based Access** — Public tracking via order number; admin panel secured by Supabase Auth + Row-Level Security
- **Denormalized Tracking View** — Public-safe `order_tracking` table synced via PostgreSQL function for fast reads
- **Email Notifications** — Transactional emails via Resend (order confirmations, status updates)

## Screenshots

_Screenshots to be added._

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL 17 (via Supabase) |
| Auth | Supabase Auth (email/password) |
| ORM / Client | Supabase JS (`@supabase/ssr`, `@supabase/supabase-js`) |
| Charts | Recharts |
| Animations | animejs |
| Icons | Lucide React |
| Email | Resend + React Email |
| Analytics | Vercel Analytics + Speed Insights |
| Deployment | Vercel + Supabase |

## Folder Structure

```
order.keebforge.in/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin panel (protected)
│   │   │   ├── new/            # Create order
│   │   │   └── orders/         # All orders + order detail
│   │   ├── api/                # API route handlers
│   │   ├── login/              # Admin login
│   │   ├── track/              # Customer tracking
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── admin/              # Admin UI components
│   │   ├── track/              # Customer tracking components
│   │   └── ui/                 # Shared UI primitives
│   ├── constants/              # Statuses, services, states
│   ├── emails/                 # React Email templates
│   ├── lib/                    # Utilities, types, API helpers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── supabase/           # Supabase client setup
│   │   └── ...                 # Various utility modules
│   └── proxy.ts                # Next.js middleware (route protection)
├── supabase/                   # Local Supabase development
│   ├── config.toml             # Local Supabase configuration
│   ├── migrations/             # Database migrations
│   └── snippets/               # SQL editor snippets
├── docs/                       # Project documentation
├── scripts/                    # Build scripts
├── public/                     # Static assets
└── .env.example                # Environment variable template
```

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Docker (for local Supabase)
- Supabase CLI

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SHADOW269/order.keebforge.in.git
cd order.keebforge.in

# 2. Install JavaScript dependencies
npm install

# 3. Start local Supabase (runs from project root)
npx supabase start

# 4. Push database migrations
npx supabase db push

# 5. Start the development server
npm run dev
```

The app is available at `http://localhost:3000`. Supabase Studio runs at `http://localhost:54323`.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
```

Get local keys from `npx supabase status`.

## Building

```bash
npm run build
```

The build runs `node scripts/generate-logo.js` as a pre-build step, then `next build`.

## Deploying

1. Push migrations to production Supabase: `npx supabase db push --db-url <production-url>`
2. Connect the GitHub repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

See [DEPLOYMENT/](./DEPLOYMENT/) for detailed guides.

## Documentation

| Document | Description |
|----------|------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and data flow |
| [SECURITY.md](./SECURITY.md) | Authentication, authorization, RLS |
| [DATABASE/RLS.md](./DATABASE/RLS.md) | Row-level security policies |
| [DATABASE/FUNCTIONS.md](./DATABASE/FUNCTIONS.md) | PostgreSQL functions |
| [DEPLOYMENT/LOCAL_DEVELOPMENT.md](./DEPLOYMENT/LOCAL_DEVELOPMENT.md) | Local setup guide |
| [DEPLOYMENT/VERCEL.md](./DEPLOYMENT/VERCEL.md) | Vercel deployment guide |
| [DEPLOYMENT/SUPABASE.md](./DEPLOYMENT/SUPABASE.md) | Supabase setup and management |
| [DEPLOYMENT/DOMAIN_SETUP.md](./DEPLOYMENT/DOMAIN_SETUP.md) | Custom domain configuration |
| [API/ROUTES.md](./API/ROUTES.md) | API endpoint reference |
| [API/EXAMPLES.md](./API/EXAMPLES.md) | API usage examples with curl |
| [DEVELOPMENT/PROJECT_STRUCTURE.md](./DEVELOPMENT/PROJECT_STRUCTURE.md) | Detailed file structure |
| [DEVELOPMENT/TROUBLESHOOTING.md](./DEVELOPMENT/TROUBLESHOOTING.md) | Common issues and fixes |

## License

Private — internal use.
