"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Category, PropertyDetails } from "@/types/models";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => (await apiFetch<Category[]>("/api/categories")).data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.property(id ?? ""),
    queryFn: async () =>
      (await apiFetch<PropertyDetails>(`/api/properties/${id}`)).data,
    enabled: !!id,
  });
}
