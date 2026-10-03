import { LoadingRegion } from "@/components/ui/skeleton";
import { ChartCardSkeleton, KpiCardsSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function DashboardLoading() {
  return (
    <LoadingRegion label="Loading dashboard…" className="space-y-6">
      <PageHeaderSkeleton />
      <KpiCardsSkeleton />
      <KpiCardsSkeleton count={3} columns={3} />
      <ChartCardSkeleton />
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </LoadingRegion>
  );
}
