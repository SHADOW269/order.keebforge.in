const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.RESEND_FROM ?? process.env.EMAIL_FROM ?? "hardy@keebforge.in";
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

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
  resendApiKey: resendApiKey ?? null,
  emailFrom,
  appUrl: appUrl ?? null,
} as const;

