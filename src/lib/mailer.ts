import "server-only";
import { getResend } from "@/lib/resend";

/** Verified sender addresses on deckspace.site. */
export const SENDERS = {
  notifications: "Deckspace <notifications@deckspace.site>",
  invites: "Deckspace <invites@deckspace.site>",
} as const;

export type MailResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
}): Promise<MailResult> {
  try {
    const { from = SENDERS.notifications, to, ...rest } = opts;
    const { data, error } = await getResend().emails.send({
      from,
      to: Array.isArray(to) ? to : to.split(",").map((a) => a.trim()).filter(Boolean),
      ...rest,
    });
    if (error || !data) {
      console.error("resend send failed", error);
      return { ok: false, error: error?.message ?? "Unknown Resend error" };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    console.error("resend send threw", e);
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
