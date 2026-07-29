import { Suspense } from "react";
import type { Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";
import { PaymentCancelContent } from "@/components/payment/payment-cancel-content";

export const metadata: Metadata = { title: "Payment cancelled" };

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
        <PaymentCancelContent />
      </Suspense>
    </div>
  );
}
