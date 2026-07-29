import { Suspense } from "react";
import type { Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";
import { PaymentSuccessContent } from "@/components/payment/payment-success-content";

export const metadata: Metadata = { title: "Payment successful" };

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
