"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { CheckoutSession, Payment } from "@/types/models";

export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.tenantPayments,
    queryFn: async () => (await apiFetch<Payment[]>("/api/payments")).data,
  });
}

/**
 * Creates a Stripe Checkout session on the backend and hands the browser off
 * to the hosted payment page.
 */
export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (rentalRequestId: string) =>
      (
        await apiFetch<CheckoutSession>("/api/payments/create", {
          method: "POST",
          body: JSON.stringify({ rentalRequestId }),
        })
      ).data,
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
