import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/api-auth";
import { syncTrackingRecord } from "@/lib/tracking-sync";
import { jsonSuccess, jsonError, jsonServerError, parseJsonBody } from "@/lib/api-response";
import { rateLimitMiddleware } from "@/lib/rate-limit";
import { sendOrderCreatedEmail } from "@/lib/email";
import { validateOrderPayload } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimitMiddleware(request, { max: 30, windowMs: 60_000 }, "orders:create");
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = parseJsonBody(await request.text());
  if (!body) {
    return jsonError("Invalid JSON body");
  }

  const validationErrors = validateOrderPayload(body);
  if (validationErrors.length > 0) {
    return jsonError(validationErrors.map((e) => `${e.field}: ${e.message}`).join("; "));
  }

  if (!body.customer_name || !body.customer_email) {
    return jsonError("customer_name and customer_email are required");
  }

  const { data: orderNumber, error: orderNumberError } = await supabaseAdmin.rpc("generate_order_number");
  if (orderNumberError || !orderNumber) {
    return jsonServerError(orderNumberError?.message || "Failed to generate order number");
  }

  const email = (body.customer_email as string).trim().toLowerCase();

  // Idempotency: reject if same customer email created an order within the last 30 seconds
  const thirtySecsAgo = new Date(Date.now() - 30_000).toISOString();
  const { data: customerRow } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (customerRow) {
    const { data: recentOrder } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("customer_id", customerRow.id)
      .gte("created_at", thirtySecsAgo)
      .limit(1)
      .maybeSingle();

    if (recentOrder) {
      return jsonError("Duplicate order detected. Please wait a moment before creating another order.", 409);
    }
  }

  const { data: existingCustomer } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let customerId: string;
  if (existingCustomer) {
    customerId = existingCustomer.id;
    const custPatch: Record<string, unknown> = {};
    const name = (body.customer_name as string).trim();
    const phone = (body.customer_phone as string) || null;
    const discord = (body.discord_username as string) || null;
    if (name) custPatch.name = name;
    if (phone !== undefined) custPatch.phone = phone;
    if (discord !== undefined) custPatch.discord_username = discord;
    if (Object.keys(custPatch).length > 0) {
      await supabaseAdmin.from("customers").update(custPatch).eq("id", customerId);
    }
  } else {
    const { data: newCustomer, error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        name: (body.customer_name as string).trim(),
        email,
        phone: (body.customer_phone as string) || null,
        discord_username: (body.discord_username as string) || null,
      })
      .select("id")
      .single();

    if (customerError || !newCustomer) {
      return jsonServerError(customerError?.message || "Failed to create customer");
    }
    customerId = newCustomer.id;
  }

  await supabaseAdmin
    .from("addresses")
    .update({ is_default: false })
    .eq("customer_id", customerId)
    .eq("is_default", true);

  const { data: address, error: addressError } = await supabaseAdmin
    .from("addresses")
    .insert({
      customer_id: customerId,
      street_address: (body.street_address as string) || null,
      city: (body.city as string) || null,
      state: (body.state as string) || null,
      pincode: (body.pincode as string) || null,
      is_default: true,
    })
    .select("id")
    .single();

  if (addressError || !address) {
    return jsonServerError(addressError?.message || "Failed to create address");
  }

  const billing = (body.billing as Record<string, unknown>) || {};
  const billingDetails: Record<string, unknown> = {};
  if (billing.extraCharges) billingDetails.extraCharges = billing.extraCharges;
  if (billing.flatDiscount) billingDetails.flatDiscount = billing.flatDiscount;
  if (billing.percentageDiscount) billingDetails.percentageDiscount = billing.percentageDiscount;
  if (billing.taxPercentage) billingDetails.taxPercentage = billing.taxPercentage;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      address_id: address.id,
      service_type: (body.service_type as string) || null,
      current_status: (body.current_status as string) || "Order Received",
      order_summary: (body.order_summary as string) || null,
      estimated_total: (body.estimated_total as number) || null,
      billing_details: billingDetails,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return jsonServerError(orderError?.message || "Failed to create order");
  }

  const orderId = order.id;

  const products = (body.products as Array<{ id: string; type: string; name: string }>) || [];
  if (products.length > 0) {
    const { error: productsError } = await supabaseAdmin.from("order_products").insert(
      products.map((p, i) => ({
        order_id: orderId,
        type: p.type,
        name: p.name,
        sort_order: i,
      }))
    );
    if (productsError) {
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return jsonServerError(productsError.message);
    }
  }

  const selectedServices = (body.selected_services as Record<string, number>) || {};
  const serviceEntries = Object.entries(selectedServices);
  if (serviceEntries.length > 0) {
    const { error: servicesError } = await supabaseAdmin.from("order_services").insert(
      serviceEntries.map(([serviceId, qty]) => ({
        order_id: orderId,
        service_id: serviceId,
        quantity: qty,
      }))
    );
    if (servicesError) {
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return jsonServerError(servicesError.message);
    }
  }

  const customWork = (body.custom_work as Array<Record<string, unknown>>) || [];
  if (customWork.length > 0) {
    const { error: cwError } = await supabaseAdmin.from("order_custom_work").insert(
      customWork.map((item, i) => ({
        order_id: orderId,
        category: (item.category as string) || "keyboard",
        title: item.title as string,
        description: (item.description as string) || null,
        price: (item.price as number) || 0,
        quantity: (item.quantity as number) || 1,
        notes: (item.notes as string) || null,
        sort_order: i,
      }))
    );
    if (cwError) {
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return jsonServerError(cwError.message);
    }
  }

  const shippingCost = (billing.shippingCost as number) || 0;
  const packagingCost = (billing.packagingCost as number) || 0;
  const { error: shippingError } = await supabaseAdmin.from("shipping_info").insert({
    order_id: orderId,
    courier: (body.courier as string) || null,
    tracking_number: (body.tracking_number as string) || null,
    tracking_url: (body.tracking_url as string) || null,
    shipping_status: (body.shipping_status as string) || "Not Dispatched",
    shipping_cost: shippingCost,
    packaging_cost: packagingCost,
    estimated_dispatch_date: (body.estimated_dispatch_date as string) || null,
    estimated_delivery_date: (body.estimated_delivery as string) || null,
  });

  if (shippingError) {
    await supabaseAdmin.from("orders").delete().eq("id", orderId);
    return jsonServerError(shippingError.message);
  }

  const amountPaid = (billing.amountPaid as number) || 0;
  const paymentStatus = (billing.paymentStatus as string) || "Payment Pending";
  const { error: paymentError } = await supabaseAdmin.from("payments").insert({
    order_id: orderId,
    amount_paid: amountPaid,
    payment_status: paymentStatus,
    paid_at: amountPaid > 0 ? new Date().toISOString() : null,
  });

  if (paymentError) {
    await supabaseAdmin.from("orders").delete().eq("id", orderId);
    return jsonServerError(paymentError.message);
  }

  const customerMsg = (body.notes as string) || null;
  if (customerMsg) {
    const { error: msgError } = await supabaseAdmin.from("customer_messages").insert({
      order_id: orderId,
      message: customerMsg,
    });
    if (msgError) {
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return jsonServerError(msgError.message);
    }
  }

  const customerNotes = (body.customer_notes as Array<Record<string, unknown>>) || [];
  if (customerNotes.length > 0) {
    const { error: cnError } = await supabaseAdmin.from("admin_customer_notes").insert(
      customerNotes.map((n) => ({
        order_id: orderId,
        text: n.text as string,
      }))
    );
    if (cnError) {
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return jsonServerError(cnError.message);
    }
  }

  const internalNotes = (body.internal_notes as Array<Record<string, unknown>>) || [];
  if (internalNotes.length > 0) {
    const { error: inError } = await supabaseAdmin.from("admin_internal_notes").insert(
      internalNotes.map((n) => ({
        order_id: orderId,
        text: n.text as string,
      }))
    );
    if (inError) {
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return jsonServerError(inError.message);
    }
  }

  try {
    await syncTrackingRecord(orderId);
  } catch {
    await supabaseAdmin.from("orders").delete().eq("id", orderId);
    return jsonServerError("Failed to sync tracking record. Order was not created.");
  }

  try {
    await sendOrderCreatedEmail({
      customerName: (body.customer_name as string).trim(),
      customerEmail: email,
      orderNumber,
      status: (body.current_status as string) || "Order Received",
      products: products.map((p) => ({ type: p.type, name: p.name })),
      createdAt: new Date().toISOString(),
      serviceType: (body.service_type as string) || "Build Service",
    });
  } catch (emailErr) {
    console.error("[OrderCreate] Failed to send order-created email:", emailErr);
  }

  return jsonSuccess({ order }, 201);
}
