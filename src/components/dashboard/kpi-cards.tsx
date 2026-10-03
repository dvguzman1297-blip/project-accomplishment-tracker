import Link from "next/link";
import { CircleCheckBig, FileStack, Trophy, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: "contracts" | "accomplishments" | "rate" | "delayed";
  alert?: boolean;
  href: string;
}

const icons = { contracts: FileStack, accomplishments: Trophy, rate: CircleCheckBig, delayed: TriangleAlert };

export function KpiCards({ items }: { items: Kpi[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((k) => {
        const Icon = icons[k.icon];
        return (
          <Link
            key={k.label}
            href={k.href}
            aria-label={`${k.label}: ${k.value}. View in tracker`}
            className="group block rounded-lg transition-shadow hover:shadow-md"
          >
          <Card className="transition-colors group-hover:border-primary/50">
            <CardContent className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className={cn("mt-1 text-3xl font-semibold tracking-tight tabular-nums", k.alert && "text-destructive")}>{k.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
              </div>
              <Icon className={cn("h-5 w-5 shrink-0 text-muted-foreground", k.alert && "text-destructive")} />
            </CardContent>
          </Card>
          </Link>
        );
      })}
    </div>
  );
}
