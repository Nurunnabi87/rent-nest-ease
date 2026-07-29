"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PropertyForm } from "@/components/forms/property-form";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/landlord/properties">
          <ArrowLeft className="size-4" />
          Back to my properties
        </Link>
      </Button>
      <PageHeader
        title="List a new property"
        description="Fill in the details below. Your listing goes live immediately."
      />
      <PropertyForm />
    </div>
  );
}
