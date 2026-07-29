"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Info, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getErrorMessage } from "@/lib/api-client";
import { STRIPE_TEST_CARD } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import { useCreateCheckout } from "@/hooks/use-payments";
import { useRental } from "@/hooks/use-rentals";

export default function PayRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: rental, isLoading, error } = useRental(id);
  const checkout = useCreateCheckout();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (error || !rental) {
    return (
      <EmptyState
        title="Couldn't load this request"
        description={error ? getErrorMessage(error) : "The rental request was not found."}
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/tenant">Back to dashboard</Link>
          </Button>
        }
      />
    );
  }

  const alreadyPaid = rental.payment?.status === "COMPLETED";
  const payable = rental.status === "APPROVED" && !alreadyPaid;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/tenant">
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </Button>

      <PageHeader
        title="Complete your payment"
        description="Pay the first month's rent to activate your rental."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{rental.property?.title ?? "Property"}</CardTitle>
            <StatusBadge status={rental.status} />
          </div>
          {rental.property && (
            <CardDescription>{rental.property.location}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Move-in date</dt>
              <dd className="font-medium">{formatDate(rental.moveInDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium">{rental.durationMonths} months</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Monthly rent</dt>
              <dd className="font-medium">
                {formatMoney(rental.property?.rentAmount ?? 0)}
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Due now (first month)</span>
            <span className="text-2xl font-bold text-primary">
              {formatMoney(rental.property?.rentAmount ?? 0)}
            </span>
          </div>

          {alreadyPaid ? (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-500/10 dark:text-green-300">
              <p className="font-medium">This rental is already paid.</p>
              <p className="mt-1">
                Paid on{" "}
                {rental.payment?.paidAt ? formatDate(rental.payment.paidAt) : "—"}.
              </p>
            </div>
          ) : !payable ? (
            <div className="flex gap-3 rounded-lg bg-muted p-4 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Payment isn&apos;t available yet</p>
                <p className="mt-1 text-muted-foreground">
                  This request is currently <strong>{rental.status}</strong>. You can only
                  pay once the landlord approves it.
                </p>
              </div>
            </div>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full"
                disabled={checkout.isPending}
                onClick={() => checkout.mutate(rental.id)}
              >
                {checkout.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CreditCard className="size-4" />
                )}
                Pay with Stripe
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                You&apos;ll be redirected to Stripe&apos;s secure checkout page.
              </p>
              <p className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
                Test mode — use card <strong>{STRIPE_TEST_CARD}</strong> with any future
                expiry, any CVC and any postal code.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
