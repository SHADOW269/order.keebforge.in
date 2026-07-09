import type { AdminOrdersListRow, DashboardStats, OrderTimelineRow } from "@/lib/types";

export function computeDashboardStats(orders: AdminOrdersListRow[], updates: OrderTimelineRow[]): DashboardStats {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalOrders = orders.length;

  const createdToday = orders.filter((o) => new Date(o.created_at) >= startOfToday).length;
  const createdThisWeek = orders.filter((o) => new Date(o.created_at) >= startOfWeek).length;
  const createdThisMonth = orders.filter((o) => new Date(o.created_at) >= startOfMonth).length;

  const completedOrders = orders.filter((o) => o.current_status === "Order Completed");
  const warrantyActive = orders.filter(
    (o) => o.current_status === "Testing Warranty Active"
  ).length;
  const pendingOrders = orders.filter(
    (o) =>
      o.current_status !== "Order Completed" &&
      o.current_status !== "Testing Warranty Active"
  ).length;

  const completionByOrder = new Map<string, Date>();
  for (const u of updates) {
    if (u.status === "Order Completed" && !completionByOrder.has(u.order_id)) {
      completionByOrder.set(u.order_id, new Date(u.created_at));
    }
  }
  const completionDurations: number[] = [];
  for (const o of orders) {
    const completedAt = completionByOrder.get(o.id);
    if (completedAt) {
      const days = (completedAt.getTime() - new Date(o.created_at).getTime()) / 86_400_000;
      if (days >= 0) completionDurations.push(days);
    }
  }
  const avgCompletionDays =
    completionDurations.length > 0
      ? completionDurations.reduce((a, b) => a + b, 0) / completionDurations.length
      : null;

  const customerKey = (o: AdminOrdersListRow) => o.customer_email?.trim().toLowerCase() || o.customer_phone?.trim();
  const customerFirstOrder = new Map<string, Date>();
  const customerOrderCount = new Map<string, number>();
  for (const o of orders) {
    const key = customerKey(o);
    if (!key) continue;
    customerOrderCount.set(key, (customerOrderCount.get(key) ?? 0) + 1);
    const created = new Date(o.created_at);
    const existing = customerFirstOrder.get(key);
    if (!existing || created < existing) customerFirstOrder.set(key, created);
  }
  const totalCustomers = customerOrderCount.size;
  const returningCustomers = [...customerOrderCount.values()].filter((c) => c > 1).length;
  const repeatRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
  const newCustomersThisMonth = [...customerFirstOrder.values()].filter(
    (d) => d >= startOfMonth
  ).length;

  const toNumber = (v: number | string | null) => {
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isFinite(n) ? (n as number) : 0;
  };

  const totalRevenue = orders.reduce((sum, o) => sum + toNumber(o.estimated_total), 0);
  const revenueThisMonth = orders
    .filter((o) => new Date(o.created_at) >= startOfMonth)
    .reduce((sum, o) => sum + toNumber(o.estimated_total), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const highestValueOrder = orders.reduce<AdminOrdersListRow | null>((max, o) => {
    if (!max) return o;
    return toNumber(o.estimated_total) > toNumber(max.estimated_total) ? o : max;
  }, null);
  const pendingPaymentOrders = orders.filter((o) => o.payment_status === "Payment Pending");
  const pendingPaymentsCount = pendingPaymentOrders.length;
  const pendingPaymentsValue = pendingPaymentOrders.reduce(
    (sum, o) => sum + toNumber(o.estimated_total),
    0
  );

  const stateCounts = new Map<string, number>();
  for (const o of orders) {
    const state = o.state?.trim();
    if (!state) continue;
    stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1);
  }
  const topStates = [...stateCounts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const serviceCounts = new Map<string, number>();
  for (const o of orders) {
    const type = o.service_type?.trim();
    if (!type) continue;
    serviceCounts.set(type, (serviceCounts.get(type) ?? 0) + 1);
  }
  const serviceBreakdown = [...serviceCounts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // keyboard_pcb_model removed from normalized schema
  const topKeyboardModels: { name: string; value: number }[] = [];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const recentlyUpdated = [...orders]
    .filter((o) => o.updated_at !== o.created_at)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);
  const recentlyCompleted = [...completedOrders]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return {
    totalOrders,
    createdToday,
    createdThisWeek,
    createdThisMonth,
    pendingOrders,
    completedOrders: completedOrders.length,
    warrantyActive,
    avgCompletionDays,
    newCustomersThisMonth,
    returningCustomers,
    repeatRate,
    totalRevenue,
    revenueThisMonth,
    avgOrderValue,
    highestValueOrder,
    pendingPaymentsCount,
    pendingPaymentsValue,
    topStates,
    serviceBreakdown,
    topKeyboardModels,
    recentOrders,
    recentlyUpdated,
    recentlyCompleted,
  };
}
