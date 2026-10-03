import { NextResponse, type NextRequest } from "next/server";
import { todayManila } from "@/lib/format";
import { sendMail } from "@/lib/mailer";
import { buildNotices } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Contract } from "@/lib/types";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Emails As-Built Plan reminders (each contract + trigger once). Call daily from a scheduler:
 *   GET /api/cron/notifications   with header  Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const [contracts, log] = await Promise.all([
    db.from("contracts").select("*"),
    db.from("notification_log").select("contract_id, kind"),
  ]);
  if (contracts.error || log.error) {
    return NextResponse.json({ error: (contracts.error ?? log.error)!.message }, { status: 500 });
  }

  const sent = new Set((log.data ?? []).map((r) => `${r.contract_id}:${r.kind}`));
  const fresh = buildNotices((contracts.data ?? []) as Contract[], todayManila()).filter((n) => !sent.has(`${n.contractId}:${n.kind}`));
  if (fresh.length === 0) return NextResponse.json({ sent: 0 });

  const to = (process.env.NOTIFY_EMAILS || process.env.GMAIL_USER || "").trim();
  if (!to) return NextResponse.json({ error: "NOTIFY_EMAILS is not set." }, { status: 500 });

  try {
    await sendMail({
      to,
      subject: `As-Built Plan: ${fresh.length} contract${fresh.length === 1 ? "" : "s"} need a request`,
      text: fresh.map((n) => `- ${n.title}\n  ${n.detail}`).join("\n\n"),
      html: `<p>Please request a copy of the As-Built Plan for:</p><ul>${fresh
        .map((n) => `<li><strong>${esc(n.title)}</strong><br>${esc(n.detail)}</li>`)
        .join("")}</ul>`,
    });
  } catch (e) {
    console.error("notification email failed", e);
    return NextResponse.json({ error: "Email failed" }, { status: 502 });
  }

  // Record only after a successful send so a failed run retries
  const { error } = await db.from("notification_log").insert(fresh.map((n) => ({ contract_id: n.contractId, kind: n.kind })));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sent: fresh.length });
}
