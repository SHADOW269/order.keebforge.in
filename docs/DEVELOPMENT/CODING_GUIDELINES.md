# Coding Guidelines

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files | `kebab-case` | `order-statuses.ts`, `BillingSection.tsx` |
| React Components | `PascalCase` | `AllOrdersTable`, `TrackDashboard` |
| Functions | `camelCase` | `isAdmin`, `computeBillingTotals` |
| Variables | `camelCase` | `orderData`, `currentStatus` |
| Database Tables | `snake_case` | `order_tracking`, `shipping_info` |
| Database Columns | `snake_case` | `order_number`, `estimated_total` |
| API Routes | `kebab-case` | `/api/orders/[id]/timeline` |
| Types/Interfaces | `PascalCase` | `OrderRow`, `BillingDetails` |
| Constants | `UPPER_SNAKE_CASE` | `PAYMENT_STATUSES` |

## Project Conventions

### React Components

- Server Components by default; add `"use client"` only when interactivity is needed
- Co-locate component files with their page when specific to that route
- Shared components live in `src/components/ui/`
- Form sections live in `src/components/admin/order-form/`

### TypeScript

- Strict mode enabled
- Define types in `src/lib/types.ts` for application types
- Auto-generated Supabase types in `src/lib/database.types.ts`
- Use `type` over `interface` where possible
- Avoid `any` — prefer `unknown` with type guards

### Styling

- Tailwind CSS v4 utility classes
- Custom design tokens in `globals.css` (CSS custom properties)
- Animation classes defined as Tailwind utilities
- Reduced motion respected via `useReducedMotion` hook

### State Management

- No external state library (no Redux, Zustand, etc.)
- Server Components for data fetching (no client state needed)
- Client Components use `useState` + `useEffect` for form state
- Toast notifications via custom context in `Providers`

### Database

- All mutations through API routes using service role
- All reads through Supabase client (RLS-enforced)
- Always schema-qualify table references in SQL functions
- Always use `SET search_path = public` in SECURITY DEFINER functions

## How To Add...

### New Service

1. Add service definition to `src/constants/services.ts` (service_id, name, category, price, etc.)
2. The form and tracking components will pick it up automatically

### New Status

1. Add status to `src/constants/order-statuses.ts`
2. Update `BuildProgress.tsx` if the status affects progress calculation
3. No database changes needed — the status is a text field

### New Component

1. Decide: shared (`ui/`), admin-specific (`admin/`), or tracking-specific (`track/`)
2. Create component file with `PascalCase` naming
3. Add TypeScript types if needed
4. Import and use in parent component

### New API Endpoint

1. Create route file in `src/app/api/.../route.ts`
2. Use `requireAdmin()` for auth
3. Use `supabaseAdmin` for DB operations
4. Use `api-response.ts` helpers for response formatting
5. Call `syncTrackingRecord()` if the endpoint modifies order data

### New Database Table

1. Create migration file (`supabase/migrations/010_...sql`)
2. Add table with proper PK, FKs, defaults, and constraints
3. Enable RLS
4. Add RLS policy (admin-only, unless public)
5. Add grants in `007_grants.sql` style
6. Generate TypeScript types via `supabase gen types typescript --local`
7. Update `src/lib/database.types.ts` (regenerate or manual update)
8. Update `src/lib/types.ts` if new application-level types are needed
