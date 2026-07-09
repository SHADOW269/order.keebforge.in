const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );
}

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey: supabaseServiceRoleKey ?? null,
} as const;
