"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { Payment } from "@/types/models";

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const sessionId = searchParams.get("session_id");

  // The backend fulfils the payment here (idempotently) and returns the
  // updated Payment record; "already confirmed" is signalled via `message`.
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["payment-confirm", sessionId],
    queryFn: () =>
      apiFetch<Payment>(
        `/api/payments/success?session_id=${encodeURIComponent(sessionId ?? "")}`
      ),
    enabled: !!sessionId,
    retry: 2,
    staleTime: Infinity,
  });

  // Rental + payment caches are stale the moment fulfilment succeeds.
  useEffect(() => {
    if (data) {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantRentals });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantPayments });
    }
  }, [data, queryClient]);

  if (!sessionId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <AlertTriangle className="size-10 text-amber-500" />
          <h1 className="text-xl font-bold">Missing payment session</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find a Stripe session in this link. Check your dashboard to
            confirm whether the payment went through.
          </p>
          <Button asChild>
            <Link href="/dashboard/tenant">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <Loader2 className="size-10 animate-spin text-primary" />
          <h1 className="text-xl font-bold">Confirming your payment…</h1>
          <p className="text-sm text-muted-foreground">
            Hang tight, this only takes a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <AlertTriangle className="size-10 text-amber-500" />
          <h1 className="text-xl font-bold">We couldn&apos;t confirm the payment</h1>
          <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
          <p className="text-sm text-muted-foreground">
            If Stripe charged your card, the payment is still being processed in the
            background — your dashboard will update shortly.
          </p>
          <Button asChild>
            <Link href="/dashboard/tenant">Check my dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-500/15">
          <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold">Payment successful!</h1>
        <p className="text-sm text-muted-foreground">
          {data.message ||
            "Your first month's rent is paid and your rental is now active."}
        </p>
        <div className="w-full rounded-lg bg-muted/50 p-4 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount paid</span>
            <span className="font-medium">
              {formatMoney(
                data.data.amount,
                data.data.currency?.toUpperCase() || "USD"
              )}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted-foreground">Payment status</span>
            <span className="font-medium">{data.data.status}</span>
          </div>
          {data.data.paidAt && (
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Paid at</span>
              <span className="font-medium">{formatDateTime(data.data.paidAt)}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard/tenant">View my rentals</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/properties">Browse more properties</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
