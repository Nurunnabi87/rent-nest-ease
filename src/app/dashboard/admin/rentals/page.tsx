"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatDate } from "@/lib/format";
import { useAdminRentals } from "@/hooks/use-admin";

const ANY = "any";

export default function AdminRentalsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(ANY);

  const { data, isLoading, error } = useAdminRentals({
    page: String(page),
    limit: "10",
    ...(status !== ANY ? { status } : {}),
  });

  const rentals = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All rental requests"
        description="Monitor every rental request across the platform."
        action={
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any status</SelectItem>
              {["PENDING", "APPROVED", "REJECTED", "ACTIVE", "COMPLETED"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : error ? (
        <EmptyState title="Couldn't load rentals" description={getErrorMessage(error)} />
      ) : rentals.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No rental requests found"
          description={
            status === ANY
              ? "Requests submitted by tenants will appear here."
              : `No requests with status ${status}.`
          }
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Move-in</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell>
                        <p className="font-medium">{rental.property?.title ?? "—"}</p>
                        {rental.property?.location && (
                          <p className="text-xs text-muted-foreground">
                            {rental.property.location}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{rental.tenant?.name ?? "—"}</p>
                        {rental.tenant?.email && (
                          <p className="text-xs text-muted-foreground">
                            {rental.tenant.email}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(rental.moveInDate)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {rental.durationMonths} mo
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={rental.status} />
                      </TableCell>
                      <TableCell>
                        {rental.payment ? (
                          <StatusBadge status={rental.payment.status} />
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
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
