import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/api-auth";
import { syncTrackingRecord } from "@/lib/tracking-sync";
import { jsonSuccess, jsonError, jsonNotFound, jsonServerError, parseJsonBody } from "@/lib/api-response";
import { rateLimitMiddleware } from "@/lib/rate-limit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = rateLimitMiddleware(request, { max: 60, windowMs: 60_000 }, "orders:update");
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  if (!id) return jsonError("Order ID is required");

  const body = parseJsonBody(await request.text());
  if (!body) return jsonError("Invalid JSON body");

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, customer_id, address_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return jsonNotFound("Order not found.");
  }

  if (body.customer_name !== undefined || body.customer_email !== undefined ||
      body.customer_phone !== undefined || body.discord_username !== undefined) {
    const patch: Record<string, unknown> = {};
    if (body.customer_name !== undefined) patch.name = (body.customer_name as string).trim();
    if (body.customer_email !== undefined) patch.email = (body.customer_email as string).trim().toLowerCase();
    if (body.customer_phone !== undefined) {
      const raw = (body.customer_phone as string) || "";
      const digits = raw.replace(/\D/g, "");
      patch.phone = digits ? `+91${digits}` : null;
    }
    if (body.discord_username !== undefined) patch.discord_username = (body.discord_username as string) || null;

    const { error: custError } = await supabaseAdmin
      .from("customers")
      .update(patch)
      .eq("id", existing.customer_id);

    if (custError) return jsonServerError(custError.message);
  }

  if (body.street_address !== undefined || body.city !== undefined ||
      body.state !== undefined || body.pincode !== undefined) {
    const patch: Record<string, unknown> = {};
    if (body.street_address !== undefined) patch.street_address = body.street_address;
    if (body.city !== undefined) patch.city = body.city;
    if (body.state !== undefined) patch.state = body.state;
    if (body.pincode !== undefined) patch.pincode = body.pincode;

    const { error: addrError } = await supabaseAdmin
      .from("addresses")
      .update(patch)
      .eq("id", existing.address_id);

    if (addrError) return jsonServerError(addrError.message);
  }

  const orderPatch: Record<string, unknown> = {};
  if (body.service_type !== undefined) orderPatch.service_type = body.service_type;
  if (body.current_status !== undefined) orderPatch.current_status = body.current_status;
  if (body.order_summary !== undefined) orderPatch.order_summary = body.order_summary;
  if (body.estimated_total !== undefined) orderPatch.estimated_total = body.estimated_total;

  if (body.billing !== undefined) {
    const billing = body.billing as Record<string, unknown>;
    const bd: Record<string, unknown> = {};
    if (billing.extraCharges !== undefined) bd.extraCharges = billing.extraCharges;
    if (billing.flatDiscount !== undefined) bd.flatDiscount = billing.flatDiscount;
    if (billing.percentageDiscount !== undefined) bd.percentageDiscount = billing.percentageDiscount;
    if (billing.taxPercentage !== undefined) bd.taxPercentage = billing.taxPercentage;
    orderPatch.billing_details = bd;
  }

  if (Object.keys(orderPatch).length > 0) {
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .update(orderPatch)
      .eq("id", id);

    if (orderError) return jsonServerError(orderError.message);
  }

  if (body.products !== undefined) {
    const products = (body.products as Array<{ id: string; type: string; name: string }>) || [];
    await supabaseAdmin.from("order_products").delete().eq("order_id", id);
    if (products.length > 0) {
      const { error: pError } = await supabaseAdmin.from("order_products").insert(
        products.map((p, i) => ({ order_id: id, type: p.type, name: p.name, sort_order: i }))
      );
      if (pError) return jsonServerError(pError.message);
    }
  }

  if (body.selected_services !== undefined) {
    const selectedServices = (body.selected_services as Record<string, number>) || {};
    await supabaseAdmin.from("order_services").delete().eq("order_id", id);
    const entries = Object.entries(selectedServices);
    if (entries.length > 0) {
      const { error: sError } = await supabaseAdmin.from("order_services").insert(
        entries.map(([serviceId, qty]) => ({ order_id: id, service_id: serviceId, quantity: qty }))
      );
      if (sError) return jsonServerError(sError.message);
    }
  }

  if (body.custom_work !== undefined) {
    const customWork = (body.custom_work as Array<Record<string, unknown>>) || [];
    await supabaseAdmin.from("order_custom_work").delete().eq("order_id", id);
    if (customWork.length > 0) {
      const { error: cwError } = await supabaseAdmin.from("order_custom_work").insert(
        customWork.map((item, i) => ({
          order_id: id,
          category: (item.category as string) || "keyboard",
          title: item.title as string,
          description: (item.description as string) || null,
          price: (item.price as number) || 0,
          quantity: (item.quantity as number) || 1,
          notes: (item.notes as string) || null,
          sort_order: i,
        }))
      );
      if (cwError) return jsonServerError(cwError.message);
    }
  }

  if (body.courier !== undefined || body.tracking_number !== undefined ||
      body.tracking_url !== undefined || body.shipping_status !== undefined ||
      body.estimated_dispatch_date !== undefined || body.estimated_delivery !== undefined ||
      body.billing !== undefined) {
    const shipPatch: Record<string, unknown> = {};
    if (body.courier !== undefined) shipPatch.courier = body.courier;
    if (body.tracking_number !== undefined) shipPatch.tracking_number = body.tracking_number;
    if (body.tracking_url !== undefined) shipPatch.tracking_url = body.tracking_url;
    if (body.shipping_status !== undefined) shipPatch.shipping_status = body.shipping_status;
    if (body.estimated_dispatch_date !== undefined) shipPatch.estimated_dispatch_date = body.estimated_dispatch_date;
    if (body.estimated_delivery !== undefined) shipPatch.estimated_delivery_date = body.estimated_delivery;

    if (body.billing !== undefined) {
      const billing = body.billing as Record<string, unknown>;
      if (billing.shippingCost !== undefined) shipPatch.shipping_cost = billing.shippingCost;
      if (billing.packagingCost !== undefined) shipPatch.packaging_cost = billing.packagingCost;
    }

    if (Object.keys(shipPatch).length > 0) {
      const { error: shipError } = await supabaseAdmin
        .from("shipping_info")
        .update(shipPatch)
        .eq("order_id", id);

      if (shipError) return jsonServerError(shipError.message);
    }
  }

  if (body.billing !== undefined) {
    const billing = body.billing as Record<string, unknown>;
    if (billing.amountPaid !== undefined || billing.paymentStatus !== undefined) {
      const payPatch: Record<string, unknown> = {};
      if (billing.amountPaid !== undefined) payPatch.amount_paid = billing.amountPaid;
      if (billing.paymentStatus !== undefined) payPatch.payment_status = billing.paymentStatus;
      if (billing.amountPaid !== undefined && (billing.amountPaid as number) > 0) {
        payPatch.paid_at = new Date().toISOString();
      }

      const { data: existingPayment } = await supabaseAdmin
        .from("payments")
        .select("id")
        .eq("order_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingPayment) {
        const { error: payError } = await supabaseAdmin
          .from("payments")
          .update(payPatch)
          .eq("id", existingPayment.id);
        if (payError) return jsonServerError(payError.message);
      } else {
        const { error: payError } = await supabaseAdmin
          .from("payments")
          .insert({ order_id: id, ...payPatch });
        if (payError) return jsonServerError(payError.message);
      }
    }
  }

  if (body.customer_notes !== undefined) {
    const customerNotes = (body.customer_notes as Array<{ text: string }>) || [];
    await supabaseAdmin.from("admin_customer_notes").delete().eq("order_id", id);
    if (customerNotes.length > 0) {
      const { error: cnError } = await supabaseAdmin.from("admin_customer_notes").insert(
        customerNotes.map((n) => ({ order_id: id, text: n.text }))
      );
      if (cnError) return jsonServerError(cnError.message);
    }
  }

  if (body.internal_notes !== undefined) {
    const internalNotes = (body.internal_notes as Array<{ text: string }>) || [];
    await supabaseAdmin.from("admin_internal_notes").delete().eq("order_id", id);
    if (internalNotes.length > 0) {
      const { error: inError } = await supabaseAdmin.from("admin_internal_notes").insert(
        internalNotes.map((n) => ({ order_id: id, text: n.text }))
      );
      if (inError) return jsonServerError(inError.message);
    }
  }

  try {
    await syncTrackingRecord(id);
  } catch {
    return jsonServerError("Failed to sync tracking record. Changes were not saved.");
  }

  return jsonSuccess({ id });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = rateLimitMiddleware(_request, { max: 30, windowMs: 60_000 }, "orders:delete");
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  if (!id) return jsonError("Order ID is required");

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    return jsonServerError(error.message);
  }

  try {
    await syncTrackingRecord(id);
  } catch {
    await supabaseAdmin.from("orders").update({ is_deleted: false }).eq("id", id);
    return jsonServerError("Failed to remove tracking record. Archive was rolled back.");
  }

  return jsonSuccess({});
}
