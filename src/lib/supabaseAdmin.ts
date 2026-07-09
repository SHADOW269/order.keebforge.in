import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

if (!env.supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey
);
