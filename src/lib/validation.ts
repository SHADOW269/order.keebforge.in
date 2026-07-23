const ALLOWED_STATUSES = new Set([
  "Order Received", "Order Confirmed", "Payment Pending", "Payment Received",
  "Parts Booked", "Parts Shipped", "Parts Received", "In Queue",
  "Work Started", "Testing", "Completed", "Packing",
  "Shipment Booked", "Shipment Picked Up", "In Transit", "Delivered",
  "Testing Warranty Active", "Order Completed",
]);

const ALLOWED_PRODUCT_TYPES = new Set([
  "keyboard", "switch", "keycap", "mouse", "pcb", "components",
]);

export interface ValidationError {
  field: string;
  message: string;
}

export function validateOrderPayload(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Customer name — required, trimmed, max 200 chars
  const name = body.customer_name;
  if (typeof name !== "string" || !name.trim()) {
    errors.push({ field: "customer_name", message: "Required" });
  } else if (name.trim().length > 200) {
    errors.push({ field: "customer_name", message: "Max 200 characters" });
  }

  // Customer email — required, valid format
  const email = body.customer_email;
  if (typeof email !== "string" || !email.trim()) {
    errors.push({ field: "customer_email", message: "Required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push({ field: "customer_email", message: "Invalid email format" });
  }

  // Customer phone — optional but if present, must be 10 digits (handles +91 prefix)
  if (body.customer_phone !== undefined && body.customer_phone !== null) {
    const phone = String(body.customer_phone).replace(/\D/g, "").replace(/^91/, "");
    if (phone && phone.length !== 10) {
      errors.push({ field: "customer_phone", message: "Must be exactly 10 digits" });
    }
  }

  // Pincode — optional but if present, must be 6 digits
  if (body.pincode !== undefined && body.pincode !== null) {
    const pin = String(body.pincode).trim();
    if (pin && pin.length !== 6) {
      errors.push({ field: "pincode", message: "Must be exactly 6 digits" });
    }
  }

  // Status — must be a valid status if provided
  if (body.current_status !== undefined) {
    if (typeof body.current_status !== "string" || !ALLOWED_STATUSES.has(body.current_status)) {
      errors.push({ field: "current_status", message: "Invalid status" });
    }
  }

  // Products — array if provided
  if (body.products !== undefined) {
    if (!Array.isArray(body.products)) {
      errors.push({ field: "products", message: "Must be an array" });
    } else {
      for (let i = 0; i < body.products.length; i++) {
        const p = body.products[i] as Record<string, unknown>;
        if (!p || typeof p !== "object") {
          errors.push({ field: `products[${i}]`, message: "Invalid product" });
          continue;
        }
        if (typeof p.name !== "string" || !p.name.trim()) {
          errors.push({ field: `products[${i}].name`, message: "Required" });
        }
        if (typeof p.type !== "string" || !ALLOWED_PRODUCT_TYPES.has(p.type)) {
          errors.push({ field: `products[${i}].type`, message: "Invalid product type" });
        }
      }
    }
  }

  // Selected services — record<string, number> if provided
  if (body.selected_services !== undefined) {
    if (typeof body.selected_services !== "object" || body.selected_services === null || Array.isArray(body.selected_services)) {
      errors.push({ field: "selected_services", message: "Must be an object" });
    }
  }

  // Custom work — array if provided
  if (body.custom_work !== undefined) {
    if (!Array.isArray(body.custom_work)) {
      errors.push({ field: "custom_work", message: "Must be an array" });
    } else {
      for (let i = 0; i < body.custom_work.length; i++) {
        const item = body.custom_work[i] as Record<string, unknown>;
        if (!item || typeof item !== "object") {
          errors.push({ field: `custom_work[${i}]`, message: "Invalid custom work item" });
          continue;
        }
        if (typeof item.title !== "string" || !item.title.trim()) {
          errors.push({ field: `custom_work[${i}].title`, message: "Required" });
        }
      }
    }
  }

  // Estimated total — number if provided
  if (body.estimated_total !== undefined && body.estimated_total !== null) {
    if (typeof body.estimated_total !== "number" || !Number.isFinite(body.estimated_total)) {
      errors.push({ field: "estimated_total", message: "Must be a valid number" });
    }
  }

  // Billing — object if provided
  if (body.billing !== undefined && body.billing !== null) {
    if (typeof body.billing !== "object" || Array.isArray(body.billing)) {
      errors.push({ field: "billing", message: "Must be an object" });
    }
  }

  // Notes / strings — max length guards
  const stringFields: Array<[string, number]> = [
    ["order_summary", 5000],
    ["customer_name", 200],
    ["discord_username", 100],
    ["street_address", 500],
    ["city", 100],
    ["state", 100],
    ["courier", 100],
    ["tracking_number", 100],
    ["tracking_url", 500],
  ];
  for (const [field, maxLen] of stringFields) {
    const val = body[field];
    if (val !== undefined && val !== null && typeof val === "string" && val.length > maxLen) {
      errors.push({ field, message: `Max ${maxLen} characters` });
    }
  }

  return errors;
}

export function validateTimelinePayload(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.status || typeof body.status !== "string") {
    errors.push({ field: "status", message: "Required" });
  } else if (!ALLOWED_STATUSES.has(body.status)) {
    errors.push({ field: "status", message: "Invalid status" });
  }

  if (body.note !== undefined && body.note !== null && typeof body.note === "string" && body.note.length > 2000) {
    errors.push({ field: "note", message: "Max 2000 characters" });
  }

  return errors;
}
