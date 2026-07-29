import { PropertyGridSkeleton } from "@/components/properties/property-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-[600px] w-full rounded-xl" />
        <PropertyGridSkeleton count={9} />
      </div>
    </div>
  );
}
