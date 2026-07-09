const ipMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

export function rateLimit(
  ip: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, resetIn: config.windowMs };
  }

  entry.count++;

  if (entry.count > config.max) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  return { allowed: true, remaining: config.max - entry.count, resetIn: entry.resetAt - now };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

const CLEANUP_INTERVAL = 600_000;
let lastCleanup = 0;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of ipMap) {
    if (now > entry.resetAt) ipMap.delete(key);
  }
}

export function rateLimitMiddleware(
  request: Request,
  config: RateLimitConfig,
  label?: string
): Response | null {
  cleanup();
  const ip = getClientIp(request);
  const result = rateLimit(ip, config);

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
