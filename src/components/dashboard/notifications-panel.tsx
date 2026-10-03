import Link from "next/link";
import { BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Notice } from "@/lib/notifications";
import type { Contract } from "@/lib/types";

/** As-Built Plan reminders: expiry within N/5 days, or progress at 95%+. */
export function NotificationsPanel({ notices, contracts }: { notices: Notice[]; contracts: Contract[] }) {
  if (notices.length === 0) return null;
  const byId = new Map(contracts.map((c) => [c.id, c]));
  return (
    <Card className="border-accent/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-accent" /> As-Built Plan reminders
          <span className="text-xs font-normal text-muted-foreground">{notices.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y text-sm">
          {notices.map((n) => {
            const c = byId.get(n.contractId);
            return (
              <li key={`${n.contractId}-${n.kind}`} className="py-2">
                <Link href={`/tracker?q=${encodeURIComponent(c?.contract_id ?? c?.contract_name ?? "")}`} className="hover:underline">
                  <p className="font-medium leading-snug">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.detail}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
