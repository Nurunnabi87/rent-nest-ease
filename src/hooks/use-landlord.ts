"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Property, RentalRequest, RentalStatus } from "@/types/models";

export function useLandlordProperties() {
  return useQuery({
    queryKey: queryKeys.landlordProperties,
    queryFn: async () =>
      (await apiFetch<Property[]>("/api/landlord/properties")).data,
  });
}

export function useLandlordRequests(status?: string) {
  return useQuery({
    queryKey: queryKeys.landlordRequests(status),
    queryFn: async () =>
      (
        await apiFetch<RentalRequest[]>(
          `/api/landlord/requests${status ? `?status=${status}` : ""}`
        )
      ).data,
  });
}

interface PropertyPayload {
  title: string;
  description: string;
  location: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  categoryId: string;
  availability?: string;
}

function invalidatePropertyCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.landlordProperties });
  queryClient.invalidateQueries({ queryKey: queryKeys.properties() });
  if (id) queryClient.invalidateQueries({ queryKey: queryKeys.property(id) });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PropertyPayload) =>
      (
        await apiFetch<Property>("/api/landlord/properties", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      ).data,
    onSuccess: () => {
      toast.success("Property listed successfully");
      invalidatePropertyCaches(queryClient);
    },
  });
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<PropertyPayload>) =>
      (
        await apiFetch<Property>(`/api/landlord/properties/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      ).data,
    onSuccess: () => {
      toast.success("Property updated");
      invalidatePropertyCaches(queryClient, id);
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<null>(`/api/landlord/properties/${id}`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      toast.success("Property removed");
      invalidatePropertyCaches(queryClient, id);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/**
 * Approve / reject / complete a rental request with an optimistic flip so the
 * table reacts instantly. Every status-filtered cache is patched at once, and
 * all of them roll back together if the server rejects the transition.
 */
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      landlordNote,
    }: {
      id: string;
      status: Extract<RentalStatus, "APPROVED" | "REJECTED" | "COMPLETED">;
      landlordNote?: string;
    }) =>
      apiFetch<RentalRequest>(`/api/landlord/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(landlordNote ? { landlordNote } : {}) }),
      }),

    onMutate: async ({ id, status, landlordNote }) => {
      await queryClient.cancelQueries({ queryKey: ["landlord", "requests"] });
      const snapshots = queryClient.getQueriesData<RentalRequest[]>({
        queryKey: ["landlord", "requests"],
      });

      queryClient.setQueriesData<RentalRequest[]>(
        { queryKey: ["landlord", "requests"] },
        (old) =>
          old?.map((request) =>
            request.id === id
              ? { ...request, status, landlordNote: landlordNote ?? request.landlordNote }
              : request
          )
      );

      return { snapshots };
    },

    onError: (error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getErrorMessage(error));
    },

    onSuccess: (_data, { status }) => {
      const verb = {
        APPROVED: "approved",
        REJECTED: "rejected",
        COMPLETED: "marked as completed",
      }[status];
      toast.success(`Request ${verb}`);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord", "requests"] });
      // COMPLETED frees the property up again, so its availability changed.
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordProperties });
    },
  });
}
