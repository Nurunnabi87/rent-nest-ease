"use client";

import { ClipboardList, CreditCard, Home, Star } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TenantPaymentsTab } from "@/components/dashboard/tenant-payments-tab";
import { TenantRequestsTab } from "@/components/dashboard/tenant-requests-tab";
import { TenantReviewsTab } from "@/components/dashboard/tenant-reviews-tab";
import { formatMoney } from "@/lib/format";
import { useMyPayments } from "@/hooks/use-payments";
import { useMyRentals } from "@/hooks/use-rentals";
import { useAuth } from "@/providers/auth-provider";

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const { data: rentals, isLoading: rentalsLoading } = useMyRentals();
  const { data: payments, isLoading: paymentsLoading } = useMyPayments();

  const activeRentals = (rentals ?? []).filter((r) => r.status === "ACTIVE").length;
  const pendingRequests = (rentals ?? []).filter((r) => r.status === "PENDING").length;
  const totalPaid = (payments ?? [])
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name ?? "tenant"}`}
        description="Track your rental requests, payments and reviews."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total requests"
          value={rentals?.length ?? 0}
          icon={ClipboardList}
          loading={rentalsLoading}
        />
        <StatCard
          label="Pending approval"
          value={pendingRequests}
          icon={Star}
          loading={rentalsLoading}
        />
        <StatCard
          label="Active rentals"
          value={activeRentals}
          icon={Home}
          loading={rentalsLoading}
        />
        <StatCard
          label="Total paid"
          value={formatMoney(totalPaid)}
          icon={CreditCard}
          loading={paymentsLoading}
        />
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-6">
          <TenantRequestsTab />
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <TenantPaymentsTab />
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <TenantReviewsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
