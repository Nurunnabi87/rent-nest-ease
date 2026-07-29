"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminUser,
  Property,
  RentalRequest,
  UserStatus,
} from "@/types/models";

function toQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}

export function useAdminUsers(params: Record<string, string | undefined>) {
  const query = toQuery(params);
  return useQuery({
    queryKey: queryKeys.adminUsers(params as Record<string, string>),
    queryFn: () => apiFetch<AdminUser[]>(`/api/admin/users?${query}`),
  });
}

export function useAdminProperties(params: Record<string, string | undefined>) {
  const query = toQuery(params);
  return useQuery({
    queryKey: queryKeys.adminProperties(params as Record<string, string>),
    queryFn: () => apiFetch<Property[]>(`/api/admin/properties?${query}`),
  });
}

export function useAdminRentals(params: Record<string, string | undefined>) {
  const query = toQuery(params);
  return useQuery({
    queryKey: queryKeys.adminRentals(params as Record<string, string>),
    queryFn: () => apiFetch<RentalRequest[]>(`/api/admin/rentals?${query}`),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      apiFetch<AdminUser>(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_data, { status }) => {
      toast.success(status === "BANNED" ? "User banned" : "User reinstated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
