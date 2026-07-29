"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PropertyForm } from "@/components/forms/property-form";
import { getErrorMessage } from "@/lib/api-client";
import { useProperty } from "@/hooks/use-properties";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: property, isLoading, error } = useProperty(id);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/landlord/properties">
          <ArrowLeft className="size-4" />
          Back to my properties
        </Link>
      </Button>
      <PageHeader
        title="Edit property"
        description="Update the listing details or change its availability."
      />

      {isLoading ? (
        <Skeleton className="h-[600px] rounded-xl" />
      ) : error || !property ? (
        <EmptyState
          title="Couldn't load this property"
          description={error ? getErrorMessage(error) : "The listing was not found."}
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/landlord/properties">Back to my properties</Link>
            </Button>
          }
        />
      ) : (
        <PropertyForm property={property} />
      )}
    </div>
  );
}
