import { Resend } from "resend";

const globalForResend = globalThis as unknown as { resend: Resend | undefined };

export function getResend(): Resend {
  if (globalForResend.resend) return globalForResend.resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const instance = new Resend(apiKey);
  globalForResend.resend = instance;
  return instance;
}
