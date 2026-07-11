import { getResend } from "@/lib/resend";
import { render } from "@react-email/components";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OrderCreatedEmail from "@/emails/OrderCreatedEmail";
import OrderTimelineUpdateEmail from "@/emails/OrderTimelineUpdateEmail";
import OrderStatusChangedEmail from "@/emails/OrderStatusChangedEmail";
import { SERVICE_BY_ID } from "@/constants/services";
import { formatDateTime, formatDate } from "@/lib/types";

interface CustomerRelation {
  name: string;
  email: string;
}

function getTrackingUrl(orderNumber: string): string {
  let base = env.appUrl || "https://order.keebforge.in";
  if (base.includes("localhost") && process.env.NODE_ENV === "production") {
    base = "https://order.keebforge.in";
  }
  return `${base}/track/${orderNumber}`;
}

function getLogoUrl(): string {
  let base = env.appUrl || "https://order.keebforge.in";
  if (base.includes("localhost") && process.env.NODE_ENV === "production") {
    base = "https://order.keebforge.in";
  }
  return `${base}/logo.png`;
}

export function getRelativeTime(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const now = new Date();
  
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return "just now";
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  }
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return "Today";
    }
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }
  
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  return `${day} ${month}`;
}

export function getHumanStatusMessage(status: string): { intro: string; description: string } {
  const s = status.toLowerCase();
  
  if (s.includes("received") && s.includes("order")) {
    return {
      intro: "We've Received Your Order",
      description: "Thank you for choosing KeebForge. We've successfully received your order and our team will review it shortly. You'll receive another update once your order has been confirmed."
    };
  }
  if (s.includes("confirmed")) {
    return {
      intro: "Your Order Has Been Confirmed",
      description: "Your order has been confirmed and is now in our system. We'll begin preparing everything required for your build and keep you updated as it progresses."
    };
  }
  if (s.includes("pending") && s.includes("payment")) {
    return {
      intro: "Payment Pending",
      description: "We're waiting for payment confirmation before work can begin. Once payment has been received, we'll immediately move your order to the next stage."
    };
  }
  if (s.includes("received") && s.includes("payment")) {
    return {
      intro: "Payment Received",
      description: "We've successfully received your payment. Your order is now ready to enter our production workflow, and we'll notify you when work begins."
    };
  }
  if (s.includes("booked") && s.includes("part")) {
    return {
      intro: "Parts Booked",
      description: "We've started sourcing the parts and components needed for your order. We'll update you once everything has been dispatched from our suppliers."
    };
  }
  if (s.includes("shipped") && s.includes("part")) {
    return {
      intro: "Parts Shipped",
      description: "The components for your order have been dispatched from our suppliers and are on their way to our workshop."
    };
  }
  if (s.includes("received") && s.includes("part")) {
    return {
      intro: "Parts Received",
      description: "All required parts for your order have arrived safely. Our technicians will begin preparing your order for assembly."
    };
  }
  if (s.includes("queue")) {
    return {
      intro: "Your Order Is In the Queue",
      description: "Your order has been added to the build queue. We'll begin work as soon as your turn comes up and will notify you once work starts."
    };
  }
  if (s.includes("work started") || s.includes("started")) {
    return {
      intro: "Work Has Started on Your Order",
      description: "Work on your order has officially begun. Our technicians are carefully assembling and preparing your product."
    };
  }
  if (s.includes("testing") && !s.includes("warranty")) {
    return {
      intro: "Your Order Is Undergoing Quality Testing",
      description: "Your order is currently undergoing quality assurance and functional testing. We're verifying that everything meets our quality standards before moving to the next stage."
    };
  }
  if (s.includes("completed") && !s.includes("order")) {
    return {
      intro: "Your Order Has Completed Testing",
      description: "Your order has successfully passed all quality checks and is complete. We'll begin packing your product for shipment shortly."
    };
  }
  if (s.includes("packing")) {
    return {
      intro: "Your Order Is Being Packed",
      description: "Your order has successfully completed testing. We're carefully packing your product to ensure it arrives safely during shipping."
    };
  }
  if (s.includes("booked") && s.includes("ship")) {
    return {
      intro: "Shipment Booked",
      description: "Your shipment has been booked with our courier partner. We'll notify you again once the package has been picked up and begins its journey."
    };
  }
  if (s.includes("picked up") || (s.includes("shipped") && !s.includes("part"))) {
    return {
      intro: "Shipment Picked Up",
      description: "Your package has been collected by our courier partner and is now on its way. You can track its delivery using the tracking link provided."
    };
  }
  if (s.includes("transit")) {
    return {
      intro: "Your Package Is In Transit",
      description: "Your shipment is currently in transit and making its way to you. Keep an eye on the tracking for delivery updates."
    };
  }
  if (s.includes("delivered")) {
    return {
      intro: "Your Order Has Been Delivered",
      description: "Your order has been delivered. We hope everything arrived safely and that you're happy with your purchase. If you need any assistance, our support team is always here to help."
    };
  }
  if (s.includes("warranty")) {
    return {
      intro: "Your Product Warranty Is Now Active",
      description: "Your product has been delivered and your warranty is now active. We recommend thoroughly testing it to ensure everything is working as expected. If you notice any issues or suspect a fault, please contact our support team immediately. We'll be happy to assist you and resolve the problem as quickly as possible."
    };
  }
  if (s.includes("completed") && s.includes("order")) {
    return {
      intro: "Order Completed — Thank You!",
      description: "This order has been fully completed. Thank you for choosing KeebForge. We appreciate your trust and hope you enjoy your product. We'd love to build for you again!"
    };
  }
  
  return {
    intro: `Order Update: ${status}`,
    description: `Your order has progressed to the "${status}" stage. We will keep you updated on further milestones.`
  };
}

const STATUSES_SHOWING_ESTIMATED_COMPLETION = [
  "parts received",
  "in queue",
  "work started",
  "testing",
  "completed",
  "packing",
  "shipment booked",
  "shipment picked up",
  "in transit",
  "delivered",
  "testing warranty active",
  "order completed",
];

function shouldShowEstimatedCompletion(status: string): boolean {
  return STATUSES_SHOWING_ESTIMATED_COMPLETION.includes(status.toLowerCase());
}

function getEstimatedCompletionForStatus(
  status: string,
  shippingInfo?: { estimated_dispatch_date: string | null; estimated_delivery_date: string | null } | null
): string | undefined {
  if (!shouldShowEstimatedCompletion(status)) {
    return undefined;
  }

  const s = status.toLowerCase();

  if (s === "delivered" || s.includes("warranty") || (s.includes("completed") && s.includes("order"))) {
    return undefined;
  }

  if (shippingInfo?.estimated_delivery_date) {
    return formatDate(shippingInfo.estimated_delivery_date);
  }
  if (shippingInfo?.estimated_dispatch_date) {
    return `Shipment by ${formatDate(shippingInfo.estimated_dispatch_date)}`;
  }

  return "2–3 Days";
}

function getOrderDetailsData({
  productsData,
  servicesData,
  customWorkData,
  serviceType,
}: {
  productsData: Array<{ type: string; name: string }>;
  servicesData: Array<{ service_id: string; quantity: number }>;
  customWorkData: Array<{ category: string; name: string; description: string | null }>;
  serviceType: string | null;
}) {
  const keyboard = productsData.find((p) => p.type === "keyboard")?.name || productsData.find((p) => p.type === "mouse")?.name;
  const switches = productsData.find((p) => p.type === "switch")?.name;
  const keycaps = productsData.find((p) => p.type === "keycap")?.name;

  // Resolve services
  const services: string[] = [];
  if (servicesData && servicesData.length > 0) {
    servicesData.forEach((s) => {
      const name = SERVICE_BY_ID[s.service_id]?.name;
      if (name) {
        services.push(name);
      }
    });
  }
  if (services.length === 0 && serviceType && serviceType !== "Custom") {
    services.push(serviceType);
  }

  // Resolve color
  let color: string | undefined;
  const colorItem = customWorkData.find(
    (c) => c.name.toLowerCase().includes("color") || (c.description && c.description.toLowerCase().includes("color"))
  );
  if (colorItem) {
    color = colorItem.description || colorItem.name;
  }

  // Resolve extras
  const extras: string[] = [];
  customWorkData.forEach((c) => {
    if (c === colorItem) return; // skip color
    extras.push(c.name);
  });
  
  // Add other products that are components/pcb as extras
  productsData.forEach((p) => {
    if (p.type === "pcb" || p.type === "components") {
      extras.push(p.name);
    }
  });

  return {
    keyboard,
    service: services.length > 0 ? services : undefined,
    color,
    switches,
    keycaps,
    extras: extras.length > 0 ? extras : undefined,
  };
}

async function fetchOrderDetailsForEmail(orderId: string) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("order_number, created_at, service_type, customer:customer_id(name, email)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return null;
  }

  const customer = order.customer as unknown as CustomerRelation | null;
  if (!customer || !customer.email) {
    return null;
  }

  const { data: productsData } = await supabaseAdmin
    .from("order_products")
    .select("type, name")
    .eq("order_id", orderId)
    .order("sort_order");

  const { data: servicesData } = await supabaseAdmin
    .from("order_services")
    .select("service_id, quantity")
    .eq("order_id", orderId);

  const { data: customWorkData } = await supabaseAdmin
    .from("order_custom_work")
    .select("category, name, description")
    .eq("order_id", orderId)
    .order("sort_order");

  const { data: shippingInfo } = await supabaseAdmin
    .from("shipping_info")
    .select("estimated_dispatch_date, estimated_delivery_date")
    .eq("order_id", orderId)
    .maybeSingle();

  const { data: timelineData } = await supabaseAdmin
    .from("order_timeline")
    .select("status, note, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(5);

  const orderDetails = getOrderDetailsData({
    productsData: productsData || [],
    servicesData: servicesData || [],
    customWorkData: customWorkData || [],
    serviceType: order.service_type,
  });

  return {
    orderNumber: order.order_number as string,
    createdAt: order.created_at as string,
    serviceType: order.service_type as string,
    customer,
    productsData: productsData || [],
    shippingInfo,
    timelineData: timelineData || [],
    orderDetails,
  };
}

function getEmailSubject({
  event,
  orderNumber,
  status,
}: {
  event: "created" | "timeline" | "status_changed";
  orderNumber: string;
  status: string;
}) {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes("shipped") ||
    normalizedStatus.includes("shipment") ||
    normalizedStatus.includes("transit") ||
    normalizedStatus.includes("dispatched")
  ) {
    return "Your KeebForge Order Has Been Shipped";
  }

  if (normalizedStatus.includes("completed") || normalizedStatus === "ready") {
    return "Your KeebForge Order is Ready";
  }

  if (normalizedStatus.includes("warranty")) {
    return "Warranty Update for Your KeebForge Order";
  }

  if (event === "created") {
    return `Your KeebForge Order Has Been Created (#${orderNumber})`;
  }

  return `Update on Your KeebForge Order (#${orderNumber})`;
}

export async function sendOrderCreatedEmail({
  customerName,
  customerEmail,
  orderNumber,
  status,
  products = [],
  createdAt,
  serviceType = "Build Service",
}: {
  customerName: string;
  customerEmail?: string | null;
  orderNumber: string;
  status: string;
  products?: Array<{ type: string; name: string }>;
  createdAt?: string;
  serviceType?: string;
}) {
  if (!customerEmail) {
    console.warn(`[Email] Skipping sendOrderCreatedEmail — No customer email exists for order ${orderNumber}`);
    return;
  }

  if (!env.resendApiKey) {
    console.warn("[Email] Skipping — RESEND_API_KEY not set");
    return;
  }

  const trackingUrl = getTrackingUrl(orderNumber);
  const subject = getEmailSubject({ event: "created", orderNumber, status });
  
  const createdDate = createdAt ? formatDate(createdAt) : formatDate(new Date());
  const lastUpdated = createdAt ? formatDateTime(createdAt) : formatDateTime(new Date());

  let estimatedCompletion: string | undefined = undefined;
  let shippingInfo: { estimated_dispatch_date: string | null; estimated_delivery_date: string | null } | null = null;
  let timeline: Array<{ status: string; note: string | null; created_at: string }> = [];
  let orderDetails = getOrderDetailsData({
    productsData: products,
    servicesData: [],
    customWorkData: [],
    serviceType,
  });

  try {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("order_number", orderNumber)
      .single();

    if (order) {
      const { data: fetchedShippingInfo } = await supabaseAdmin
        .from("shipping_info")
        .select("estimated_dispatch_date, estimated_delivery_date")
        .eq("order_id", order.id)
        .maybeSingle();

      shippingInfo = fetchedShippingInfo;
      estimatedCompletion = getEstimatedCompletionForStatus(status, shippingInfo);

      const { data: timelineData } = await supabaseAdmin
        .from("order_timeline")
        .select("status, note, created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (timelineData && timelineData.length > 0) {
        timeline = timelineData.map((t) => ({
          status: t.status,
          note: t.note,
          created_at: getRelativeTime(t.created_at),
        }));
      }

      const { data: servicesData } = await supabaseAdmin
        .from("order_services")
        .select("service_id, quantity")
        .eq("order_id", order.id);

      const { data: customWorkData } = await supabaseAdmin
        .from("order_custom_work")
        .select("category, name, description")
        .eq("order_id", order.id)
        .order("sort_order");

      orderDetails = getOrderDetailsData({
        productsData: products,
        servicesData: servicesData || [],
        customWorkData: customWorkData || [],
        serviceType,
      });
    }
  } catch (dbErr) {
    console.error("[Email] Failed to fetch additional details for OrderCreatedEmail:", dbErr);
  }

  if (timeline.length === 0) {
    timeline = [{
      status,
      note: null,
      created_at: "Today",
    }];
  }

  const humanMsg = getHumanStatusMessage(status);
  const logoUrl = getLogoUrl();

  try {
    const htmlContent = await render(
      OrderCreatedEmail({
        customerName,
        orderNumber,
        status,
        trackingUrl,
        lastUpdated,
        estimatedCompletion,
        intro: humanMsg.intro,
        description: humanMsg.description,
        timeline,
        logoUrl,
        orderDetails,
      })
    );

    const { error } = await getResend().emails.send({
      from: env.emailFrom,
      to: customerEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error(`Failed to send email\nReason: ${error.message}`);
    } else {
      console.log(`Email sent to ${customerEmail}\nOrder: ${orderNumber}\nEvent: New Order Created`);
    }
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`Failed to send email\nReason: ${reason}`);
  }
}

export async function sendTimelineUpdateEmail({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: string;
  note?: string | null;
}) {
  if (!env.resendApiKey) {
    console.warn("[Email] Skipping — RESEND_API_KEY not set");
    return;
  }

  try {
    const details = await fetchOrderDetailsForEmail(orderId);
    if (!details) {
      console.error("[Email] sendTimelineUpdateEmail failed: Order not found");
      return;
    }

    const { orderNumber, customer, shippingInfo, timelineData, orderDetails } = details;

    const estimatedCompletion = getEstimatedCompletionForStatus(status, shippingInfo);

    const lastUpdated = timelineData[0] ? formatDateTime(timelineData[0].created_at) : formatDateTime(new Date());

    const formattedTimeline = timelineData.map((t) => ({
      status: t.status,
      note: t.note,
      created_at: getRelativeTime(t.created_at),
    }));

    const trackingUrl = getTrackingUrl(orderNumber);
    const subject = getEmailSubject({ event: "timeline", orderNumber, status });
    const humanMsg = getHumanStatusMessage(status);
    const logoUrl = getLogoUrl();

    const htmlContent = await render(
      OrderTimelineUpdateEmail({
        customerName: customer.name,
        orderNumber,
        status,
        note,
        trackingUrl,
        lastUpdated,
        estimatedCompletion,
        intro: humanMsg.intro,
        description: humanMsg.description,
        timeline: formattedTimeline,
        logoUrl,
        orderDetails,
      })
    );

    const { error } = await getResend().emails.send({
      from: env.emailFrom,
      to: customer.email,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error(`Failed to send email\nReason: ${error.message}`);
    } else {
      console.log(`Email sent to ${customer.email}\nOrder: ${orderNumber}\nEvent: ${status}`);
    }
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`Failed to send email\nReason: ${reason}`);
  }
}

export async function sendStatusChangedEmail({
  orderId,
  previousStatus,
  newStatus,
}: {
  orderId: string;
  previousStatus: string;
  newStatus: string;
}) {
  if (!env.resendApiKey) {
    console.warn("[Email] Skipping — RESEND_API_KEY not set");
    return;
  }

  try {
    const details = await fetchOrderDetailsForEmail(orderId);
    if (!details) {
      console.error("[Email] sendStatusChangedEmail failed: Order not found");
      return;
    }

    const { orderNumber, customer, shippingInfo, timelineData, orderDetails } = details;

    const estimatedCompletion = getEstimatedCompletionForStatus(newStatus, shippingInfo);

    const lastUpdated = timelineData[0] ? formatDateTime(timelineData[0].created_at) : formatDateTime(new Date());

    const formattedTimeline = timelineData.map((t) => ({
      status: t.status,
      note: t.note,
      created_at: getRelativeTime(t.created_at),
    }));

    const trackingUrl = getTrackingUrl(orderNumber);
    const subject = getEmailSubject({ event: "status_changed", orderNumber, status: newStatus });
    const humanMsg = getHumanStatusMessage(newStatus);
    const logoUrl = getLogoUrl();

    const htmlContent = await render(
      OrderStatusChangedEmail({
        customerName: customer.name,
        orderNumber,
        previousStatus,
        newStatus,
        trackingUrl,
        lastUpdated,
        estimatedCompletion,
        intro: humanMsg.intro,
        description: humanMsg.description,
        timeline: formattedTimeline,
        logoUrl,
        orderDetails,
      })
    );

    const { error } = await getResend().emails.send({
      from: env.emailFrom,
      to: customer.email,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error(`Failed to send email\nReason: ${error.message}`);
    } else {
      console.log(`Email sent to ${customer.email}\nOrder: ${orderNumber}\nEvent: Status Changed to ${newStatus}`);
    }
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`Failed to send email\nReason: ${reason}`);
  }
}
