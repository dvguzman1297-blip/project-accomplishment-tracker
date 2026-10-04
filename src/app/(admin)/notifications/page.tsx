import Link from "next/link";
import { BellRing, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { todayManila } from "@/lib/format";
import { buildNotices } from "@/lib/notifications";
import type { Contract } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data, error } = await supabase.from("contracts").select("*");

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
        <p className="font-medium">Couldn&apos;t load data.</p>
        <p className="mt-1 text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const notices = buildNotices((data ?? []) as Contract[], todayManila());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Contracts that need a request for the As-Built Plan: 5 days or less before expiry, or progress at 95% or more.
        </p>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          <BellRing className="mx-auto mb-2 h-5 w-5" strokeWidth={1.75} />
          You&apos;re all caught up. No As-Built Plan requests are due.
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {notices.map((n) => (
            <li key={`${n.contractId}-${n.kind}`}>
              <Link
                href={`/tracker?range=all&open=${n.contractId}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <BellRing className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-snug">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.detail}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
