export const ORDER_STATUSES = [
  "Order Received",
  "Order Confirmed",
  "Payment Pending",
  "Payment Received",
  "Parts Booked",
  "Parts Shipped",
  "Parts Received",
  "In Queue",
  "Work Started",
  "Testing",
  "Completed",
  "Packing",
  "Shipment Booked",
  "Shipment Picked Up",
  "In Transit",
  "Delivered",
  "Testing Warranty Active",
  "Order Completed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SERVICE_TYPES = [
  "Complete Switch Mod",
  "Switch Lubing",
  "Stabilizer Tuning",
  "Build Service",
  "Repair",
  "Custom",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

// ─── Single source of truth for status → progress percentage ──────────────
export const STATUS_PROGRESS: Record<string, number> = {
  "Order Received": 5,
  "Order Confirmed": 10,
  "Payment Pending": 15,
  "Payment Received": 20,
  "Parts Booked": 28,
  "Parts Shipped": 33,
  "Parts Received": 38,
  "In Queue": 42,
  "Work Started": 50,
  "Testing": 75,
  "Completed": 80,
  "Packing": 85,
  "Shipment Booked": 88,
  "Shipment Picked Up": 90,
  "In Transit": 93,
  "Delivered": 100,
  "Testing Warranty Active": 100,
  "Order Completed": 100,
};

// ─── Single source of truth for status → badge color classes ──────────────
export const STATUS_BADGE_COLORS: Record<string, string> = {
  "Order Received": "bg-sky-500/15 text-sky-300 border-sky-500/25",
  "Order Confirmed": "bg-sky-500/15 text-sky-300 border-sky-500/25",
  "Payment Pending": "bg-amber-500/15 text-amber-300 border-amber-500/25",
  "Payment Received": "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  "In Queue": "bg-violet-500/15 text-violet-300 border-violet-500/25",
  "Work Started": "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Testing": "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  "Completed": "bg-[var(--acc-dim)] text-[var(--acc)] border-[var(--acc)]/30",
  "In Transit": "bg-sky-500/15 text-sky-300 border-sky-500/25",
  "Delivered": "bg-[var(--acc-dim)] text-[var(--acc)] border-[var(--acc)]/30",
  "Testing Warranty Active": "bg-lime-500/15 text-lime-300 border-lime-500/25",
  "Order Completed": "bg-[var(--acc-dim)] text-[var(--acc)] border-[var(--acc)]/30",
  "Parts Booked": "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Parts Shipped": "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Parts Received": "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Packing": "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "Shipment Booked": "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "Shipment Picked Up": "bg-purple-500/15 text-purple-300 border-purple-500/25",
};

// ─── Dashboard stage bucketing ───────────────────────────────────────────
export interface DashboardStage {
  name: string;
  value: number;
  color: string;
  statuses: readonly string[];
}

export function createDashboardStages(): DashboardStage[] {
  return [
    { name: "Orders Received", value: 0, color: "#3b82f6", statuses: ["Order Received", "Order Confirmed"] },
    { name: "In Queue", value: 0, color: "#9494a6", statuses: ["In Queue", "Payment Pending", "Payment Received"] },
    { name: "Assembly", value: 0, color: "#c9f31d", statuses: ["Parts Booked", "Parts Shipped", "Parts Received", "Work Started"] },
    { name: "Testing", value: 0, color: "#f59e0b", statuses: ["Testing"] },
    { name: "Packing & Shipping", value: 0, color: "#7c6ff2", statuses: ["Completed", "Packing", "Shipment Booked", "Shipment Picked Up"] },
    { name: "In Transit", value: 0, color: "#f97316", statuses: ["In Transit"] },
    { name: "Delivered", value: 0, color: "#22c55e", statuses: ["Delivered"] },
    { name: "Warranty", value: 0, color: "#14b8a6", statuses: ["Testing Warranty Active"] },
    { name: "Completed", value: 0, color: "#10b981", statuses: ["Order Completed"] },
  ];
}

export function bucketOrderToStage(status: string, stages: DashboardStage[]): void {
  for (const stage of stages) {
    if (stage.statuses.includes(status)) {
      stage.value++;
      return;
    }
  }
  // Unknown statuses go to the first stage
  stages[0].value++;
}