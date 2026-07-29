"use client";

import Link from "next/link";
import { Building2, ClipboardList, DollarSign, Home, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { LandlordRequestRow } from "@/components/dashboard/landlord-request-row";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatMoney } from "@/lib/format";
import { useLandlordProperties, useLandlordRequests } from "@/hooks/use-landlord";
import { useAuth } from "@/providers/auth-provider";

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const { data: properties, isLoading: propertiesLoading } = useLandlordProperties();
  const { data: requests, isLoading: requestsLoading } = useLandlordRequests();

  const allRequests = requests ?? [];
  const pendingRequests = allRequests.filter((r) => r.status === "PENDING");
  const activeRentals = allRequests.filter((r) => r.status === "ACTIVE").length;

  // Earnings = first month's rent collected on every paid rental.
  const earnings = allRequests
    .filter((r) => r.payment?.status === "COMPLETED")
    .reduce((sum, r) => sum + (r.payment?.amount ?? r.property?.rentAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name ?? "landlord"}`}
        description="An overview of your listings, requests and earnings."
        action={
          <Button asChild>
            <Link href="/dashboard/landlord/properties/new">
              <PlusCircle className="size-4" />
              Add property
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total properties"
          value={properties?.length ?? 0}
          icon={Building2}
          loading={propertiesLoading}
        />
        <StatCard
          label="Pending requests"
          value={pendingRequests.length}
          icon={ClipboardList}
          loading={requestsLoading}
          hint={pendingRequests.length > 0 ? "Needs your attention" : undefined}
        />
        <StatCard
          label="Active rentals"
          value={activeRentals}
          icon={Home}
          loading={requestsLoading}
        />
        <StatCard
          label="Total earnings"
          value={formatMoney(earnings)}
          icon={DollarSign}
          loading={requestsLoading}
          hint="First month's rent collected"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Pending requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/landlord/requests">View all requests</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : pendingRequests.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No pending requests"
              description="You're all caught up — new requests will appear here."
            />
          ) : (
            <div className="space-y-4">
              {pendingRequests.slice(0, 3).map((request) => (
                <LandlordRequestRow key={request.id} request={request} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
