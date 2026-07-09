import { NextResponse } from "next/server";

export function jsonSuccess<T>(data: Record<string, T>, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export function jsonUnauthorized(message = "Unauthorized") {
  return jsonError(message, 401);
}

export function jsonForbidden(message = "Forbidden") {
  return jsonError(message, 403);
}

export function jsonNotFound(message = "Resource not found") {
  return jsonError(message, 404);
}

export function jsonServerError(message = "Internal server error") {
  return jsonError(message, 500);
}

export function parseJsonBody(body: string | null): Record<string, unknown> | null {
  if (!body) return null;
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return null;
  }
}
