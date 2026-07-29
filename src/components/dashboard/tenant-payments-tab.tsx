"use client";

import { CreditCard } from "lucide-react";

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
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import { useMyPayments } from "@/hooks/use-payments";

export function TenantPaymentsTab() {
  const { data: payments, isLoading, error } = useMyPayments();

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  if (error) {
    return (
      <EmptyState title="Couldn't load payments" description={getErrorMessage(error)} />
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No payments yet"
        description="Once a landlord approves your request, your payment will appear here."
      />
    );
  }

  return (
    <Card>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid on</TableHead>
                <TableHead className="text-right">Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <span className="font-medium">
                      {payment.rentalRequest?.property?.title ?? "Property"}
                    </span>
                    {payment.rentalRequest?.property?.location && (
                      <span className="block text-xs text-muted-foreground">
                        {payment.rentalRequest.property.location}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(payment.amount, payment.currency?.toUpperCase() || "USD")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-right font-mono text-xs text-muted-foreground">
                    {payment.transactionId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
