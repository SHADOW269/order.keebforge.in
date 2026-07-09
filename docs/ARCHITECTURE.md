# Architecture

## High-Level Overview

```mermaid
flowchart TD
    subgraph Client
        C[Customer Browser /track/KF-XXXXX]
        A[Admin Browser /admin/*]
    end

    subgraph Next.js App
        SC[Server Components]
        CC[Client Components]
        API[API Routes /api/*]
        MW[Middleware proxy.ts]
    end

    subgraph Supabase
        PG[PostgreSQL Database]
        AU[Auth Service]
        RLS[Row-Level Security]
        FU[Edge Functions]
    end

    C -->|Public Read| SC
    A -->|Auth Required| MW
    MW -->|Session Check| AU
    A -->|Authenticated Reads| SC
    A -->|Mutations| API
    API -->|service_role| PG
    SC -->|anon_key + RLS| PG
    CC -->|anon_key + RLS| PG
    API --> AU
    PG --> RLS
```

## Next.js Architecture

The project uses the **Next.js App Router** with a mix of Server and Client Components.

### App Router Structure

```
src/app/
├── page.tsx              # Landing page (Client)
├── layout.tsx            # Root layout (Server)
├── login/page.tsx        # Admin login (Client)
├── admin/
│   ├── layout.tsx        # Admin layout with nav (Server)
│   ├── page.tsx          # Dashboard (Server)
│   ├── loading.tsx       # Dashboard loading skeleton (Client)
│   ├── error.tsx         # Admin error boundary (Client)
│   ├── new/page.tsx      # Create order form (Client)
│   └── orders/
│       ├── page.tsx      # All orders list (Server)
│       └── [orderNumber]/
│           └── page.tsx  # Order detail/edit (Client)
├── track/
│   └── [orderNumber]/
│       ├── page.tsx      # Customer tracking (Server)
│       ├── loading.tsx   # Tracking loading (Client)
│       └── error.tsx     # Tracking error boundary (Client)
└── api/
    └── orders/
        ├── route.ts      # POST - Create order
        └── [id]/
            ├── route.ts  # PATCH/DELETE - Update/archive order
            └── timeline/
                └── route.ts  # POST - Add timeline update
```

### Server Components

Pages like `/admin`, `/admin/orders`, and `/track/[orderNumber]` are **Server Components**. They fetch data on the server using the Supabase server client and render HTML directly. This means:

- No client-side JavaScript for data fetching
- Direct database queries without API waterfalls
- Automatic streaming with `loading.tsx` boundaries

### Client Components

Interactive pages like `/admin/new`, `/admin/orders/[orderNumber]`, and `/login` are **Client Components** (`"use client"`). They use:

- Client-side Supabase for real-time form interactions
- Client-side state management for complex forms
- Client-side animations (animejs)

## API Routes

All mutations go through API routes that use the **service role key** (`supabaseAdmin`) to bypass RLS:

```mermaid
sequenceDiagram
    participant Client as Admin Browser
    participant API as Next.js API Route
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    Client->>API: PATCH /api/orders/:id
    API->>Auth: verify session token
    Auth-->>API: user identity
    API->>DB: mutate with service_role (bypass RLS)
    DB-->>API: result
    API-->>Client: success/error response
```

Every mutation API route:
1. Authenticates the admin via `requireAdmin()` (checks Supabase session)
2. Performs the mutation using the service role client (bypasses RLS)
3. Calls `syncTrackingRecord()` to sync the public tracking view
4. Returns a JSON response

## Supabase Integration

### Client Types

| Client | Location | Key | RLS | Use Case |
|--------|----------|-----|-----|----------|
| Browser Client | `lib/supabase/client.ts` | `anon_key` | Enforced | Client-side reads in tracking & admin pages |
| Server Client | `lib/supabase/server.ts` | `anon_key` | Enforced | Server-side reads in Server Components |
| Admin Client | `lib/supabaseAdmin.ts` | `service_role_key` | Bypassed | All API route mutations |
| Middleware | `lib/supabase/middleware.ts` | `anon_key` | Enforced | Session management |

### Data Flow for Order Tracking

```mermaid
sequenceDiagram
    participant Customer
    participant SC as Server Component
    participant DB as order_tracking table
    participant Admin
    participant API as API Route
    participant Func as sync_order_tracking()

    Admin->>API: Update order status
    API->>DB: Update orders, order_timeline
    API->>Func: CALL sync_order_tracking(order_id)
    Func->>DB: Rebuild denormalized row

    Customer->>SC: GET /track/KF-XXXXX
    SC->>DB: SELECT FROM order_tracking
    DB-->>SC: tracking data
    SC-->>Customer: Rendered page
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant MW as Middleware
    participant Login as /login
    participant Auth as Supabase Auth
    participant Admin as /admin

    User->>Admin: Visit /admin/*
    MW->>Auth: Check session cookie
    Auth-->>MW: No session
    MW->>User: Redirect to /login

    User->>Login: Enter email + password
    Login->>Auth: signInWithPassword()
    Auth-->>Login: session
    Login->>User: Redirect to /admin

    User->>Admin: Visit /admin/*
    MW->>Auth: Check session cookie
    Auth-->>MW: Valid session
    MW->>User: Allow access to /admin
```

## Security Architecture

See [SECURITY.md](./SECURITY.md) for a detailed breakdown.

Key principles:
- **RLS for reads** — All client-side queries go through RLS policies
- **Service role for writes** — All API mutations use the service role key
- **Admin authentication** — `requireAdmin()` checks Supabase Auth session on every API request
- **Defense in depth** — `is_admin()` PostgreSQL function is SECURITY DEFINER for RLS, but API routes also check auth server-side
