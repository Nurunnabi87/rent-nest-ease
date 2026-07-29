"use client";

import Link from "next/link";
import { Building2, ClipboardList, ListChecks, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAdminProperties, useAdminRentals, useAdminUsers } from "@/hooks/use-admin";
import { useAuth } from "@/providers/auth-provider";

// Only `meta.total` is needed for the overview, so ask for the smallest page.
const COUNT_ONLY = { limit: "1" };

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const users = useAdminUsers(COUNT_ONLY);
  const properties = useAdminProperties(COUNT_ONLY);
  const rentals = useAdminRentals(COUNT_ONLY);
  const pendingRentals = useAdminRentals({ limit: "1", status: "PENDING" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description={`Signed in as ${user?.email ?? "admin"} — moderate users, listings and rentals.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.data?.meta?.total ?? 0}
          icon={Users}
          loading={users.isLoading}
        />
        <StatCard
          label="Total properties"
          value={properties.data?.meta?.total ?? 0}
          icon={Building2}
          loading={properties.isLoading}
          hint="Includes removed listings"
        />
        <StatCard
          label="Total rentals"
          value={rentals.data?.meta?.total ?? 0}
          icon={ListChecks}
          loading={rentals.isLoading}
        />
        <StatCard
          label="Pending requests"
          value={pendingRentals.data?.meta?.total ?? 0}
          icon={ClipboardList}
          loading={pendingRentals.isLoading}
          hint="Awaiting landlord decision"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            href: "/dashboard/admin/users",
            title: "User management",
            description: "Search users, review roles and ban or reinstate accounts.",
            icon: Users,
          },
          {
            href: "/dashboard/admin/properties",
            title: "All properties",
            description: "Inspect every listing on the platform, including removed ones.",
            icon: Building2,
          },
          {
            href: "/dashboard/admin/rentals",
            title: "All rentals",
            description: "Monitor rental requests and their status across the platform.",
            icon: ListChecks,
          },
        ].map((item) => (
          <Card key={item.href}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <item.icon className="size-5 text-primary" />
                <CardTitle className="text-base">{item.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={item.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
