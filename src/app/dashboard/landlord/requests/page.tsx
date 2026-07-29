"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { LandlordRequestRow } from "@/components/dashboard/landlord-request-row";
import { getErrorMessage } from "@/lib/api-client";
import { useLandlordRequests } from "@/hooks/use-landlord";

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
];

export default function LandlordRequestsPage() {
  const [filter, setFilter] = useState("ALL");
  const {
    data: requests,
    isLoading,
    error,
  } = useLandlordRequests(filter === "ALL" ? undefined : filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rental requests"
        description="Approve or reject incoming requests. Approved tenants can pay right away."
      />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap">
          {FILTERS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Couldn't load requests"
          description={getErrorMessage(error)}
        />
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={
            filter === "ALL"
              ? "No rental requests yet"
              : `No ${filter.toLowerCase()} requests`
          }
          description={
            filter === "ALL"
              ? "When tenants request one of your properties, it will show up here."
              : "Try a different status filter."
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <LandlordRequestRow key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
