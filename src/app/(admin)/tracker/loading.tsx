import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function TrackerLoading() {
  return (
    <LoadingRegion label="Loading tracker…" className="space-y-6">
      <PageHeaderSkeleton />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-56 max-w-full" />
      </div>
      <TableSkeleton />
    </LoadingRegion>
  );
}
