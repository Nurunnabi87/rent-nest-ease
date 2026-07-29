"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SearchPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Show a compact window of pages around the current one.
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      {pages.map((p, index) => (
        <span key={p} className="flex items-center gap-1">
          {index > 0 && p - pages[index - 1] > 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <Button
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => goTo(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        </span>
      ))}
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
