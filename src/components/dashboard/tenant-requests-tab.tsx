"use client";

import Link from "next/link";
import { ClipboardList, CreditCard, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ReviewDialogTrigger } from "@/components/forms/review-form";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import { useMyRentals } from "@/hooks/use-rentals";
import { useMyReviews } from "@/hooks/use-reviews";

export function TenantRequestsTab() {
  const { data: rentals, isLoading, error } = useMyRentals();
  const { data: reviews } = useMyReviews();

  const reviewedPropertyIds = new Set(
    (reviews ?? []).map((review) => review.propertyId ?? review.property?.id)
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Couldn't load your requests"
        description={getErrorMessage(error)}
      />
    );
  }

  if (!rentals || rentals.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No rental requests yet"
        description="Browse properties and send a request to get started."
        action={
          <Button asChild>
            <Link href="/properties">Browse properties</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {rentals.map((rental) => {
        const property = rental.property;
        const alreadyPaid = rental.payment?.status === "COMPLETED";
        const canPay = rental.status === "APPROVED" && !alreadyPaid;
        const canReview =
          rental.status === "COMPLETED" &&
          property &&
          !reviewedPropertyIds.has(property.id);

        return (
          <Card key={rental.id}>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {property?.title ?? "Property"}
                    </h3>
                    <StatusBadge status={rental.status} />
                  </div>
                  {property && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {property.location ? `${property.location} · ` : ""}
                      {formatMoney(property.rentAmount)}/mo
                    </p>
                  )}
                </div>
                {property && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/properties/${property.id}`}>
                      <ExternalLink className="size-3.5" />
                      View listing
                    </Link>
                  </Button>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Move-in</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(rental.moveInDate)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="mt-0.5 font-medium">{rental.durationMonths} months</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Requested</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(rental.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Payment</dt>
                  <dd className="mt-0.5">
                    {rental.payment ? (
                      <StatusBadge status={rental.payment.status} />
                    ) : (
                      <span className="font-medium text-muted-foreground">—</span>
                    )}
                  </dd>
                </div>
              </dl>

              {rental.message && (
                <p className="rounded-lg bg-muted/50 p-3 text-sm">
                  <span className="font-medium">Your message: </span>
                  {rental.message}
                </p>
              )}

              {rental.landlordNote && (
                <p className="rounded-lg border-l-4 border-primary bg-muted/50 p-3 text-sm">
                  <span className="font-medium">Landlord&apos;s note: </span>
                  {rental.landlordNote}
                </p>
              )}

              {(canPay || canReview) && (
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {canPay && (
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/tenant/requests/${rental.id}/pay`}>
                        <CreditCard className="size-3.5" />
                        Pay now
                      </Link>
                    </Button>
                  )}
                  {canReview && property && (
                    <ReviewDialogTrigger
                      propertyId={property.id}
                      propertyTitle={property.title}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
