import "server-only";
import { Resend } from "resend";

let client: Resend | undefined;

/** Server-only Resend client. Never import from client components. */
export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  return (client ??= new Resend(key));
}
