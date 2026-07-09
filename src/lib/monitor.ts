const SLOW_QUERY_MS = 500;
const SLOW_RESPONSE_MS = 1000;

export function logSlowQuery(label: string, durationMs: number) {
  if (durationMs > SLOW_QUERY_MS) {
    console.warn(`[SlowQuery] ${label} took ${durationMs.toFixed(0)}ms`);
  }
}

export function logSlowResponse(label: string, durationMs: number) {
  if (durationMs > SLOW_RESPONSE_MS) {
    console.warn(`[SlowResponse] ${label} took ${durationMs.toFixed(0)}ms`);
  }
}

export function logFailedRequest(label: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[FailedRequest] ${label}: ${msg}`);
}
