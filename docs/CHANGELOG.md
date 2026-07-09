# Changelog

All notable changes to the KeebForge Order Tracking project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Initial project setup
- Next.js 16 App Router with Server Components
- Supabase integration (Auth, PostgreSQL, RLS)
- Admin dashboard with KPIs, production overview, revenue analytics
- Order creation and editing forms
- Customer tracking page with build progress, timeline, shipping, warranty
- PostgreSQL database with 15 tables, 2 views, 5 functions
- RLS policies for admin-only access with public tracking data
- Service catalog with pricing and categories
- Order status workflow with 18 statuses
- Billing engine with automatic totals computation
- Landing page with animated hero and order search
- Admin authentication via Supabase Auth (email/password)
- Security Advisor fixes:
  - `security_invoker = true` on admin views
  - Schema-qualified references in SECURITY DEFINER functions
  - `SET search_path = public` on all functions
  - `is_admin()` marked STABLE
  - PUBLIC execute revoked from all functions
  - `get_admin_order` restricted to service_role only
  - Split order_tracking RLS policies to avoid "multiple permissive" warning
  - Removed duplicate index `idx_order_timeline_lookup`
  - Added missing FK index `idx_orders_address`
- Comprehensive project documentation in `/docs/`

### Changed

- (none)

### Fixed

- (none)

### Security

- (none)

## Template for Future Releases

```markdown
## [1.0.0] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Deprecated
- Features to be removed in future releases

### Removed
- Removed features

### Security
- Security improvements
```
