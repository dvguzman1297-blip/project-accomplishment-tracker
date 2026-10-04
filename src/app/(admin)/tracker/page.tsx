import { createClient } from "@/lib/supabase/server";
import type { Accomplishment, Contract } from "@/lib/types";
import { todayManila } from "@/lib/format";
import { TrackerView } from "@/components/tracker/tracker-view";

export const dynamic = "force-dynamic";

export default async function TrackerPage({ searchParams }: { searchParams: { tab?: string; status?: string; q?: string; range?: string; open?: string; n?: string } }) {
  const supabase = createClient();
  const [c, a] = await Promise.all([
    supabase.from("contracts").select("*").order("item_no", { ascending: true, nullsFirst: false }),
    supabase.from("accomplishments").select("*").order("date_completed", { ascending: false, nullsFirst: false }),
  ]);

  if (c.error || a.error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
        <p className="font-medium">Couldn&apos;t load data.</p>
        <p className="mt-1 text-muted-foreground">{(c.error ?? a.error)?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-semibold tracking-tight">Tracker</h1>
        <p className="text-sm text-muted-foreground">Contracts and the accomplishments logged against them.</p>
      </div>
      <TrackerView key={`${searchParams.open ?? ""}-${searchParams.n ?? ""}`} contracts={(c.data ?? []) as Contract[]} accomplishments={(a.data ?? []) as Accomplishment[]} today={todayManila()}
        initialTab={searchParams.tab === "accomplishments" ? "accomplishments" : "contracts"}
        initialStatus={searchParams.status}
        initialQuery={searchParams.q}
        initialRange={searchParams.range}
        initialOpenId={searchParams.open}
      />
    </div>
  );
}
