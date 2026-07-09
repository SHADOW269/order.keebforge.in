# Components

## UI Primitives (`src/components/ui/`)

Shared, reusable UI components used across both admin and customer sections.

| Component | Props | Description |
|-----------|-------|-------------|
| `Badge` | `children`, `variant` (color) | Colored status badge |
| `Card` | `children`, `title`, `className` | Content container with optional title |
| `Field` | `label`, `error`, `children` | Form field wrapper with label + error |
| `Loading` | — | Full-page loading spinner |
| `NotesEditor` | `notes`, `onChange`, `readOnly` | Rich note editing interface |
| `NoteTimeline` | `notes` | Chronological display of notes |
| `OrderSearch` | `onSearch` | Search input for order lookup |
| `SectionLabel` | `children` | Form section heading |
| `Skeleton` | `width`, `height`, `className` | Loading skeleton placeholder |
| `Toast` | — | Toast notification container |

## Admin Components (`src/components/admin/`)

### AllOrdersTable

Renders a searchable, filterable table of all non-deleted orders. Data sourced from `admin_orders_list` view.

Features:
- Search by order number, customer name, email, or phone
- Column sorting
- Row click → navigate to order detail page
- Responsive layout (horizontal scroll on mobile)

### DashboardCharts

Renders the production overview bar chart and revenue analytics chart using Recharts.

### Order Form Components (`order-form/`)

Each section of the create/edit order form is a separate component:

| Component | Database Table(s) | Props |
|-----------|------------------|-------|
| `CustomerInfoSection` | `customers` | `customer`, `onChange` |
| `ShippingAddressSection` | `addresses` | `address`, `onChange` |
| `ProductsSection` | `order_products` | `products`, `onChange` |
| `ServicesSection` | `order_services` | `services`, `onChange`, `catalog` |
| `CustomWorkSection` | `order_custom_work` | `items`, `onChange` |
| `BillingSection` | `orders.billing_details` | `billing`, `services`, `customWork`, `onChange` |
| `LogisticsSection` | `shipping_info` | `logistics`, `onChange` |
| `CustomerMessageSection` | `customer_messages` | `message`, `onChange` |
| `AdminToCustomerSection` | `admin_customer_notes` | `notes`, `onChange` |
| `NotesSection` | `admin_internal_notes` | `notes`, `onChange` |

## Customer Tracking Components (`src/components/track/`)

| Component | Data Source | Description |
|-----------|------------|-------------|
| `BuildProgress` | `order_tracking.status` | Visual progress bar |
| `CostSummary` | `order_tracking.billing_summary` | Billing breakdown |
| `LogisticsCard` | `order_tracking.*_shipping_*` | Shipping details card |
| `ProductsList` | `order_tracking.products` | Ordered products |
| `RealTimeline` | `order_tracking.timeline` | Status update timeline |
| `ServicesList` | `order_tracking.selected_services` | Selected services |
| `TrackDashboard` | `order_tracking` (all) | Main tracking layout |
| `WarrantyCard` | `order_tracking.warranty_*` | Warranty info card |
| `WorkshopUpdates` | `order_tracking.customer_notes` | Admin-to-customer notes |

## Shared Components (`src/components/`)

| Component | Description |
|-----------|-------------|
| `LogoutButton` | Supabase logout action with redirect |
| `NumberInputGuard` | Prevents non-numeric input with scroll protection |
| `Providers` | Wraps children in context providers (toast) |
| `SiteNav` | Landing page navigation bar |
