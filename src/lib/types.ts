// ─── Normalized Database Types ─────────────────────────────────────────────────

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  discord_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddressRow {
  id: string;
  customer_id: string;
  street_address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_default: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string;
  address_id: string | null;
  service_type: string | null;
  current_status: string;
  order_summary: string | null;
  estimated_total: number | null;
  billing_details: BillingDetails;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingDetails {
  shippingCost?: number;
  packagingCost?: number;
  extraCharges?: ExtraCharge[];
  flatDiscount?: number;
  percentageDiscount?: number;
  taxPercentage?: number;
}

export interface OrderProductRow {
  id: string;
  order_id: string;
  type: ProductType;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface OrderServiceRow {
  id: string;
  order_id: string;
  service_id: string;
  quantity: number;
  unit_price: number | null;
  line_total: number | null;
  created_at: string;
}

export interface OrderCustomWorkRow {
  id: string;
  order_id: string;
  category: "keyboard" | "mouse";
  title: string;
  description: string | null;
  price: number;
  quantity: number;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface ShippingInfoRow {
  id: string;
  order_id: string;
  courier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipping_status: ShippingStatus;
  shipping_cost: number;
  packaging_cost: number;
  estimated_dispatch_date: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  amount_paid: number;
  payment_status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface OrderTimelineRow {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
}

export interface CustomerMessageRow {
  id: string;
  order_id: string;
  message: string;
  created_at: string;
}

export interface AdminCustomerNoteRow {
  id: string;
  order_id: string;
  text: string;
  created_at: string;
}

export interface AdminInternalNoteRow {
  id: string;
  order_id: string;
  text: string;
  created_at: string;
}

export interface WarrantyRecordRow {
  id: string;
  order_id: string;
  warranty_status: string | null;
  warranty_start: string | null;
  warranty_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderTrackingRow {
  order_id: string;
  order_number: string;
  status: string | null;
  service_type: string | null;
  products: ProductEntry[];
  selected_services: SelectedServices;
  billing_summary: BillingDetails;
  estimated_total: number | null;
  payment_status: string | null;
  shipping_status: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  courier: string | null;
  estimated_dispatch: string | null;
  estimated_delivery: string | null;
  customer_notes: CustomerNote[];
  timeline: TimelineEntry[];
  warranty_status: string | null;
  warranty_start: string | null;
  warranty_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEntry {
  status: string;
  note: string | null;
  created_at: string;
}

// ─── Admin List View (from admin_orders_list view) ────────────────────────────

export interface AdminOrdersListRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  discord_username: string | null;
  service_type: string | null;
  current_status: string;
  estimated_total: number | null;
  created_at: string;
  updated_at: string;
  street_address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  shipping_status: string;
  payment_status: string;
}

// ─── Order Form Types ─────────────────────────────────────────────────────────

export type ProductType = "keyboard" | "switch" | "keycap" | "mouse" | "pcb" | "components";

export interface ProductEntry {
  id: string;
  type: ProductType;
  name: string;
}

export type SelectedServices = Record<string, number>;

export interface ExtraCharge {
  id: string;
  label: string;
  amount: number;
}

export interface InternalNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface CustomerNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface CustomWorkItem {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  notes: string;
}

export type PaymentStatus = "Paid" | "Partially Paid" | "Payment Pending";

export type ShippingStatus =
  | "Not Dispatched"
  | "Dispatched"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Returned";

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  "Payment Pending",
  "Partially Paid",
  "Paid",
] as const;

export const SHIPPING_STATUSES: readonly ShippingStatus[] = [
  "Not Dispatched",
  "Dispatched",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Returned",
] as const;

export interface BillingState {
  shippingCost: number;
  packagingCost: number;
  extraCharges: ExtraCharge[];
  flatDiscount: number;
  percentageDiscount: number;
  taxPercentage: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
}

export const INITIAL_BILLING: BillingState = {
  shippingCost: 0,
  packagingCost: 0,
  extraCharges: [],
  flatDiscount: 0,
  percentageDiscount: 0,
  taxPercentage: 0,
  amountPaid: 0,
  paymentStatus: "Payment Pending",
};

export interface LogisticsState {
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDispatchDate: string;
  estimatedDeliveryDate: string;
  shippingStatus: ShippingStatus;
}

export const INITIAL_LOGISTICS: LogisticsState = {
  courier: "",
  trackingNumber: "",
  trackingUrl: "",
  estimatedDispatchDate: "",
  estimatedDeliveryDate: "",
  shippingStatus: "Not Dispatched",
};

// ─── Billing Computation Types ───────────────────────────────────────────────

export interface BillingTotals {
  servicesSubtotal: number;
  extraChargesTotal: number;
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
  taxAmount: number;
  grandTotal: number;
  remainingBalance: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatINR(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  return `₹${(Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = MONTHS_SHORT[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const date = formatDate(d);
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${date} • ${hh}:${min}`;
}

export function dateLabel(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const now = new Date();
  const startOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOf(now).getTime() - startOf(d).getTime()) / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return formatDate(iso);
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number;
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
  pendingOrders: number;
  completedOrders: number;
  warrantyActive: number;
  avgCompletionDays: number | null;
  newCustomersThisMonth: number;
  returningCustomers: number;
  repeatRate: number;
  totalRevenue: number;
  revenueThisMonth: number;
  avgOrderValue: number;
  highestValueOrder: AdminOrdersListRow | null;
  pendingPaymentsCount: number;
  pendingPaymentsValue: number;
  topStates: { name: string; value: number }[];
  serviceBreakdown: { name: string; value: number }[];
  topKeyboardModels: { name: string; value: number }[];
  recentOrders: AdminOrdersListRow[];
  recentlyUpdated: AdminOrdersListRow[];
  recentlyCompleted: AdminOrdersListRow[];
}
