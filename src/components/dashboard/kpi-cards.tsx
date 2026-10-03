import Link from "next/link";
import { CircleCheckBig, CirclePause, FileStack, Hourglass, Trophy, TriangleAlert, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: "contracts" | "accomplishments" | "rate" | "delayed" | "ongoing" | "nys" | "suspended";
  alert?: boolean;
  href: string;
}

const icons = {
  contracts: FileStack,
  accomplishments: Trophy,
  rate: CircleCheckBig,
  delayed: TriangleAlert,
  ongoing: Wrench,
  nys: Hourglass,
  suspended: CirclePause,
};

// Accent per status card: icon colour + a left border
const accents: Partial<Record<Kpi["icon"], { icon: string; border: string }>> = {
  ongoing: { icon: "text-sky-600 dark:text-sky-400", border: "border-l-4 border-l-sky-600" },
  nys: { icon: "text-amber-600 dark:text-amber-400", border: "border-l-4 border-l-amber-500" },
  suspended: { icon: "text-red-600 dark:text-red-400", border: "border-l-4 border-l-red-600" },
};

export function KpiCards({ items, columns = 4 }: { items: Kpi[]; columns?: 3 | 4 }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4")}>
      {items.map((k) => {
        const Icon = icons[k.icon];
        return (
          <Link
            key={k.label}
            href={k.href}
            aria-label={`${k.label}: ${k.value}. View in tracker`}
            className="group block rounded-lg transition-shadow hover:shadow-md"
          >
          <Card className={cn("transition-colors group-hover:border-primary/50", accents[k.icon]?.border)}>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className={cn("mt-1 text-3xl font-semibold tracking-tight tabular-nums", k.alert && "text-destructive")}>{k.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
              </div>
              <Icon className={cn("h-5 w-5 shrink-0 text-muted-foreground", accents[k.icon]?.icon, k.alert && "text-destructive")} />
            </CardContent>
          </Card>
          </Link>
        );
      })}
    </div>
  );
}
