import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function syncTrackingRecord(orderId: string) {
  const { error } = await supabaseAdmin.rpc("sync_order_tracking", {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
