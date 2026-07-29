"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { RentalRequest } from "@/types/models";

export function useMyRentals() {
  return useQuery({
    queryKey: queryKeys.tenantRentals,
    queryFn: async () => (await apiFetch<RentalRequest[]>("/api/rentals")).data,
  });
}

export function useRental(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tenantRental(id ?? ""),
    queryFn: async () => (await apiFetch<RentalRequest>(`/api/rentals/${id}`)).data,
    enabled: !!id,
  });
}
