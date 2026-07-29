"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearch() {
  const router = useRouter();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const term = new FormData(event.currentTarget).get("searchTerm");
        const query = typeof term === "string" && term.trim()
          ? `?searchTerm=${encodeURIComponent(term.trim())}`
          : "";
        router.push(`/properties${query}`);
      }}
      className="mx-auto flex w-full max-w-xl gap-2"
    >
      <Input
        name="searchTerm"
        placeholder="Search by city, area or property name…"
        aria-label="Search properties"
        className="h-12 bg-background"
      />
      <Button type="submit" size="lg" className="h-12">
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
