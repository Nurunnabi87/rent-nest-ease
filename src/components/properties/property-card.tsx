import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatMoney } from "@/lib/format";
import type { Property } from "@/types/models";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e5e5'/%3E%3C/svg%3E";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="group overflow-hidden pt-0 transition-shadow hover:shadow-lg">
      <Link href={`/properties/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={property.images[0] || PLACEHOLDER}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <StatusBadge status={property.availability} />
          </div>
        </div>
      </Link>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <Link href={`/properties/${property.id}`} className="min-w-0">
            <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
              {property.title}
            </h3>
          </Link>
          {property.category && (
            <Badge variant="outline" className="shrink-0">
              {property.category.name}
            </Badge>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          {property.location}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {formatMoney(property.rentAmount)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </p>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="size-4" />
              {property.bathrooms}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden pt-0">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <CardContent className="space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
