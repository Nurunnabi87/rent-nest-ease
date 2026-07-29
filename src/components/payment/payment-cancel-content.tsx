"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PaymentCancelContent() {
  const rentalId = useSearchParams().get("rentalId");

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-500/15">
          <XCircle className="size-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold">Payment cancelled</h1>
        <p className="text-sm text-muted-foreground">
          No charge was made. Your rental request is still approved, so you can complete
          the payment whenever you&apos;re ready.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {rentalId && (
            <Button asChild>
              <Link href={`/dashboard/tenant/requests/${rentalId}/pay`}>Try again</Link>
            </Button>
          )}
          <Button variant={rentalId ? "outline" : "default"} asChild>
            <Link href="/dashboard/tenant">Back to dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
