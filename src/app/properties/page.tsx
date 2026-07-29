import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PropertyFilters } from "@/components/properties/property-filters";
import { PropertyGrid, PropertyGridSkeleton } from "@/components/properties/property-grid";
import { SearchPagination } from "@/components/properties/search-pagination";
import { SortSelect } from "@/components/properties/sort-select";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetch } from "@/lib/server-api";
import type { Category, Property } from "@/types/models";

export const metadata: Metadata = {
  title: "Browse properties",
  description: "Search and filter rental properties by location, price and amenities.",
};

const ALLOWED_PARAMS = [
  "searchTerm",
  "location",
  "categoryId",
  "minPrice",
  "maxPrice",
  "bedrooms",
  "amenities",
  "availability",
  "sortBy",
  "sortOrder",
  "page",
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function buildQuery(searchParams: SearchParams): string {
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = searchParams[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  params.set("limit", "9");
  return params.toString();
}

async function PropertyResults({ searchParams }: { searchParams: SearchParams }) {
  const res = await serverFetch<Property[]>(`/api/properties?${buildQuery(searchParams)}`, {
    revalidate: 0,
  });
  const properties = res.data;
  const meta = res.meta;

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No properties match your filters"
        description="Try widening your price range, clearing amenities, or searching a different location."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Showing {properties.length} of {meta?.total ?? properties.length} properties
      </p>
      <PropertyGrid properties={properties} />
      {meta && <SearchPagination page={meta.page} totalPages={meta.totalPages} />}
    </>
  );
}

async function FiltersPanel() {
  const res = await serverFetch<Category[]>("/api/categories", { revalidate: 300 }).catch(
    () => null
  );
  return (
    <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
      <PropertyFilters categories={res?.data ?? []} />
    </Suspense>
  );
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Browse properties"
        description="Find your next home from verified landlords."
        action={
          <Suspense fallback={<Skeleton className="h-9 w-[190px]" />}>
            <SortSelect />
          </Suspense>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <FiltersPanel />
        </aside>
        <div>
          <Suspense
            key={JSON.stringify(params)}
            fallback={<PropertyGridSkeleton count={9} />}
          >
            <PropertyResults searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
