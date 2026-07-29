"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Review } from "@/types/models";
import type { ReviewValues } from "@/schemas/review.schema";

export function useMyReviews() {
  return useQuery({
    queryKey: queryKeys.tenantReviews,
    queryFn: async () => (await apiFetch<Review[]>("/api/reviews")).data,
  });
}

export function useCreateReview(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ReviewValues) =>
      (
        await apiFetch<Review>("/api/reviews", {
          method: "POST",
          body: JSON.stringify({ propertyId, ...values }),
        })
      ).data,
    onSuccess: () => {
      toast.success("Thanks for your review!");
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantReviews });
      queryClient.invalidateQueries({ queryKey: queryKeys.property(propertyId) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
