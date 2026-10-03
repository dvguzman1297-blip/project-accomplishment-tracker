import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

export function KpiCardsSkeleton({ count = 4, columns = 4 }: { count?: number; columns?: 3 | 4 }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4")}>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i}>
          <CardContent className="flex items-start justify-between gap-3">
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-40 max-w-full" />
            </div>
            <Skeleton className="h-5 w-5 shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader><Skeleton className="h-4 w-48" /></CardHeader>
      <CardContent><Skeleton className="h-64 w-full" /></CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }, (_, i) => <Skeleton key={i} className="h-4 flex-1" />)}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-4 border-t pt-3">
            {Array.from({ length: cols }, (_, c) => <Skeleton key={c} className={cn("h-4 flex-1", c === 0 && "max-w-[3rem]")} />)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
