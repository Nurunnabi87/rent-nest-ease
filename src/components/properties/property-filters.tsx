"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/models";

const AMENITY_OPTIONS = [
  "wifi",
  "parking",
  "ac",
  "furnished",
  "elevator",
  "balcony",
  "gym",
  "pool",
  "security",
];

const ANY = "any";

export function PropertyFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const selectedAmenities = useMemo(
    () => (searchParams.get("amenities") ?? "").split(",").filter(Boolean),
    [searchParams]
  );

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === ANY) params.delete(key);
        else params.set(key, value);
      }
      params.delete("page"); // any filter change resets pagination
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Debounce free-text inputs so we don't push a route per keystroke.
  useEffect(() => {
    const current = searchParams.get("searchTerm") ?? "";
    if (searchTerm === current) return;
    const timer = setTimeout(() => setParam({ searchTerm: searchTerm || null }), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setParam]);

  useEffect(() => {
    const current = searchParams.get("location") ?? "";
    if (location === current) return;
    const timer = setTimeout(() => setParam({ location: location || null }), 400);
    return () => clearTimeout(timer);
  }, [location, searchParams, setParam]);

  const applyPrice = () => setParam({ minPrice: minPrice || null, maxPrice: maxPrice || null });

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setParam({ amenities: next.length ? next.join(",") : null });
  };

  const clearAll = () => {
    setSearchTerm("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname, { scroll: false });
  };

  const activeCount = ["searchTerm", "location", "categoryId", "minPrice", "maxPrice", "bedrooms", "amenities", "availability"].filter(
    (key) => searchParams.get(key)
  ).length;

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
          </h2>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="size-3.5" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? "Hide" : "Show"}
            </Button>
          </div>
        </div>

        <div className={cn("space-y-5", !open && "hidden lg:block")}>
          <div className="space-y-2">
            <Label htmlFor="filter-search">Search</Label>
            <Input
              id="filter-search"
              placeholder="Title, description, location…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-location">Location</Label>
            <Input
              id="filter-location"
              placeholder="e.g. Dhaka"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={searchParams.get("categoryId") ?? ANY}
              onValueChange={(value) => setParam({ categoryId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Monthly rent (USD)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Min"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                onBlur={applyPrice}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                onBlur={applyPrice}
              />
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={applyPrice}>
              Apply price
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Select
              value={searchParams.get("bedrooms") ?? ANY}
              onValueChange={(value) => setParam({ bedrooms: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any</SelectItem>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} bedroom{n > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <Select
              value={searchParams.get("availability") ?? ANY}
              onValueChange={(value) => setParam({ availability: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RENTED">Rented</SelectItem>
                <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const active = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Listings must include every selected amenity.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
