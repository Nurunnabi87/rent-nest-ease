"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import { useAdminProperties } from "@/hooks/use-admin";

export default function AdminPropertiesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminProperties({
    page: String(page),
    limit: "10",
  });

  const properties = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All properties"
        description="Every listing on the platform, including removed ones."
      />

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : error ? (
        <EmptyState
          title="Couldn't load properties"
          description={getErrorMessage(error)}
        />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties on the platform yet"
          description="Listings created by landlords will appear here."
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Listed</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                            {property.images[0] && (
                              <Image
                                src={property.images[0]}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{property.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {property.location}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatMoney(property.rentAmount)}
                      </TableCell>
                      <TableCell>
                        {property.category ? (
                          <Badge variant="outline">{property.category.name}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <StatusBadge status={property.availability} />
                          {property.isDeleted && (
                            <Badge variant="destructive">Removed</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(property.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/properties/${property.id}`}>
                            <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination meta={data?.meta} onPageChange={setPage} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
