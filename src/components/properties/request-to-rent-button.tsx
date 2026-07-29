"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RentalRequestDialog } from "@/components/forms/rental-request-form";
import { useAuth } from "@/providers/auth-provider";
import type { Availability } from "@/types/models";

export function RequestToRentButton({
  propertyId,
  propertyTitle,
  rentAmount,
  availability,
  landlordId,
}: {
  propertyId: string;
  propertyTitle: string;
  rentAmount: number;
  availability: Availability;
  landlordId: string;
}) {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-10 w-full" />;

  if (!user) {
    return (
      <Button className="w-full" size="lg" asChild>
        <Link href={`/auth/login?redirect=/properties/${propertyId}`}>
          <LogIn className="size-4" />
          Log in to request this rental
        </Link>
      </Button>
    );
  }

  if (user.role === "LANDLORD") {
    return (
      <p className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
        {user.id === landlordId
          ? "This is your own listing."
          : "Landlord accounts can't submit rental requests."}
      </p>
    );
  }

  if (user.role === "ADMIN") {
    return (
      <p className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
        Admins moderate listings and can&apos;t submit rental requests.
      </p>
    );
  }

  if (availability !== "AVAILABLE") {
    return (
      <Button className="w-full" size="lg" disabled>
        Currently {availability.toLowerCase()}
      </Button>
    );
  }

  return (
    <>
      <Button className="w-full" size="lg" onClick={() => setOpen(true)}>
        <CalendarPlus className="size-4" />
        Request to rent
      </Button>
      <RentalRequestDialog
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        rentAmount={rentAmount}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
