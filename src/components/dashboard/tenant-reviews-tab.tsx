"use client";

import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/properties/rating-stars";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { useMyReviews } from "@/hooks/use-reviews";

export function TenantReviewsTab() {
  const { data: reviews, isLoading, error } = useMyReviews();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState title="Couldn't load reviews" description={getErrorMessage(error)} />
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No reviews yet"
        description="You can leave a review once a rental is marked completed by the landlord."
      />
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{review.property?.title ?? "Property"}</h3>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <RatingStars rating={review.rating} className="mt-2" />
            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
