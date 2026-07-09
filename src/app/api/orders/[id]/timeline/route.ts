import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/api-auth";
import { syncTrackingRecord } from "@/lib/tracking-sync";
import { jsonSuccess, jsonError, jsonServerError, parseJsonBody } from "@/lib/api-response";
import { rateLimitMiddleware } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = rateLimitMiddleware(request, { max: 30, windowMs: 60_000 }, "timeline:create");
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  if (!id) return jsonError("Order ID is required");

  const body = parseJsonBody(await request.text());
  if (!body) return jsonError("Invalid JSON body");

  if (!body.status) return jsonError("Status is required");

  const { data: update, error: insertError } = await supabaseAdmin
    .from("order_timeline")
    .insert({ order_id: id, status: body.status as string, note: (body.note as string) || null })
    .select("id, status, note, created_at")
    .single();

  if (insertError) {
    return jsonServerError(insertError.message);
  }

  const { error: statusError } = await supabaseAdmin
    .from("orders")
    .update({ current_status: body.status as string })
    .eq("id", id);

  if (statusError) {
    await supabaseAdmin.from("order_timeline").delete().eq("id", update.id);
    return jsonServerError(statusError.message);
  }

  try {
    await syncTrackingRecord(id);
  } catch {
    await supabaseAdmin.from("order_timeline").delete().eq("id", update.id);
    return jsonServerError("Failed to sync tracking record. Update was not saved.");
  }

  return jsonSuccess({ update });
}
