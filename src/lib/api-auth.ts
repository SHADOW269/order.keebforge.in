import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { jsonUnauthorized, jsonForbidden } from "@/lib/api-response";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null as null, error: jsonUnauthorized() };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "Admin",
        email: user.email!,
        role: "admin",
      });

    if (insertError) {
      return { user: null as null, error: jsonForbidden() };
    }

    return { user, error: null as null };
  }

  if (!["admin", "staff"].includes(profile.role)) {
    return { user: null as null, error: jsonForbidden() };
  }

  return { user, error: null as null };
}
