"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PropertyDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <h1 className="mt-4 text-2xl font-bold">Couldn&apos;t load this property</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "Something went wrong while fetching the listing."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/properties">Back to browse</Link>
        </Button>
      </div>
    </div>
  );
}
