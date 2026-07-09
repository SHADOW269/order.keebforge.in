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