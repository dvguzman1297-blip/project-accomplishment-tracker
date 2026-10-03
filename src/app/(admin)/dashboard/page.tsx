import { createClient } from "@/lib/supabase/server";
import type { Accomplishment, Contract, ProjectStatus } from "@/lib/types";
import { STATUS_META, formatPeso, isOverdue, todayManila } from "@/lib/format";
import { KpiCards, type Kpi } from "@/components/dashboard/kpi-cards";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { buildNotices } from "@/lib/notifications";
import { DashboardCharts } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function DashboardPage() {
  const supabase = createClient();
  const [c, a] = await Promise.all([
    supabase.from("contracts").select("*"),
    supabase.from("accomplishments").select("*"),
  ]);

  if (c.error || a.error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
        <p className="font-medium">Couldn&apos;t load data.</p>
        <p className="mt-1 text-muted-foreground">
          {(c.error ?? a.error)?.message}. Check that the <code>tracker</code> schema is listed under Project Settings → API → Exposed schemas.
        </p>
      </div>
    );
  }

  const contracts = (c.data ?? []) as Contract[];
  const accomplishments = (a.data ?? []) as Accomplishment[];
  const today = todayManila();

  const total = contracts.length;
  const completed = contracts.filter((x) => x.status === "completed").length;
  const delayed = contracts.filter((x) => isOverdue(x, today)).length;
  
  const totalBid = contracts.reduce((s, x) => s + (x.bid_amount ?? 0), 0);
  const highImpact = accomplishments.filter((x) => x.impact === "high" || x.impact === "critical").length;

  const count = (st: ProjectStatus) => contracts.filter((x) => x.status === st).length;
  const pct = (n: number) => `${total ? Math.round((n / total) * 100) : 0}% of ${total} contracts`;
  const statusKpis: Kpi[] = [
    { label: "Ongoing projects", value: String(count("ongoing")), sub: pct(count("ongoing")), icon: "ongoing", href: "/tracker?status=ongoing&range=all" },
    { label: "Not yet started (NYS)", value: String(count("nys")), sub: pct(count("nys")), icon: "nys", href: "/tracker?status=nys&range=all" },
    { label: "Suspended projects", value: String(count("suspended")), sub: pct(count("suspended")), icon: "suspended", alert: count("suspended") > 0, href: "/tracker?status=suspended&range=all" },
  ];

  const kpis: Kpi[] = [
    { label: "Contracts", value: String(total), sub: totalBid ? `${formatPeso(totalBid)} total bid amount` : "No bid amounts recorded", icon: "contracts", href: "/tracker?range=all" },
    { label: "Accomplishments", value: String(accomplishments.length), sub: `${highImpact} high or critical impact`, icon: "accomplishments", href: "/tracker?tab=accomplishments" },
    { label: "Completion rate", value: `${total ? Math.round((completed / total) * 100) : 0}%`, sub: `${completed} of ${total} contracts completed`, icon: "rate", href: "/tracker?status=completed&range=all" },
    { label: "Delayed", value: String(delayed), sub: "Past expiry date and not completed", icon: "delayed", alert: delayed > 0, href: "/tracker?status=overdue&range=all" },
  ];

  // Trend: accomplishments per month + running total
  const byMonth = new Map<string, number>();
  accomplishments.forEach((x) => {
    if (!x.date_completed) return;
    const k = x.date_completed.slice(0, 7);
    byMonth.set(k, (byMonth.get(k) ?? 0) + 1);
  });
  let running = 0;
  const trend = [...byMonth.entries()]
    .sort(([x], [y]) => x.localeCompare(y))
    .map(([k, n]) => {
      running += n;
      const [y, m] = k.split("-").map(Number);
      return { label: `${MONTHS[m - 1]} ${y}`, monthly: n, cumulative: running };
    });

  const status = (Object.keys(STATUS_META) as ProjectStatus[])
    .map((s) => ({ name: STATUS_META[s].full, value: contracts.filter((x) => x.status === s).length, color: STATUS_META[s].color }))
    .filter((s) => s.value > 0);

  const muni = new Map<string, number>();
  contracts.forEach((x) => {
    const k = x.municipality?.trim() || "Unassigned";
    muni.set(k, (muni.get(k) ?? 0) + 1);
  });
  const municipality = [...muni.entries()].map(([name, value]) => ({ name, value })).sort((x, y) => y.value - x.value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Contract progress and accomplishments to date.</p>
      </div>
      <KpiCards items={kpis} />
      <KpiCards items={statusKpis} columns={3} />
      <NotificationsPanel notices={buildNotices(contracts, today)} contracts={contracts} />
      <DashboardCharts trend={trend} status={status} municipality={municipality} />
    </div>
  );
}
