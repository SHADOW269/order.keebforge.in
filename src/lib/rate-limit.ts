import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

function getWindowStart(windowMs: number): Date {
  const now = Date.now();
  const windowStart = new Date(now - (now % windowMs));
  return windowStart;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const windowStart = getWindowStart(config.windowMs);
  const windowKey = `${key}:${windowStart.getTime()}`;
  const now = Date.now();
  const resetIn = config.windowMs - (now % config.windowMs);

  const { data, error } = await supabaseAdmin
    .from("rate_limits")
    .select("count")
    .eq("key", windowKey)
    .maybeSingle();

  if (error) {
    // If the table doesn't exist or query fails, allow the request
    // (fail open for availability)
    return { allowed: true, remaining: config.max - 1, resetIn };
  }

  const currentCount = data?.count ?? 0;

  if (currentCount >= config.max) {
    return { allowed: false, remaining: 0, resetIn };
  }

  // Upsert the counter
  const { error: upsertError } = await supabaseAdmin
    .from("rate_limits")
    .upsert(
      { key: windowKey, count: currentCount + 1, window_start: windowStart.toISOString() },
      { onConflict: "key", ignoreDuplicates: false }
    );

  if (upsertError) {
    // Upsert failed — allow the request (fail open)
    return { allowed: true, remaining: config.max - currentCount - 1, resetIn };
  }

  return {
    allowed: true,
    remaining: config.max - currentCount - 1,
    resetIn,
  };
}

export function getClientIp(request: Request): string {
  // On Vercel, x-forwarded-for is set by the platform and is trusted.
  // For other platforms, fall back to a safe default.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP (the original client) and validate format
    const ip = forwarded.split(",")[0]?.trim();
    if (ip && /^[\d.:a-fA-F]+$/.test(ip)) return ip;
  }
  return "unknown";
}

export async function rateLimitMiddleware(
  request: Request,
  config: RateLimitConfig,
  label?: string
): Promise<Response | null> {
  const ip = getClientIp(request);
  const key = label ? `${label}:${ip}` : ip;
  const result = await checkRateLimit(key, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(result.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetIn) / 1000)),
        },
      }
    );
  }

  return null;
}
