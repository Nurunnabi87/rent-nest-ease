import { MessageSquare } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/properties/rating-stars";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types/models";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Reviews appear once a tenant completes their stay at this property."
      />
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="text-xs">
                {(review.tenant?.name ?? "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium">{review.tenant?.name ?? "Tenant"}</span>
                <RatingStars rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
