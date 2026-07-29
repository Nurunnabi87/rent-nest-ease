import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Building2, Check, Mail, MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/properties/image-gallery";
import { RatingStars } from "@/components/properties/rating-stars";
import { RequestToRentButton } from "@/components/properties/request-to-rent-button";
import { ReviewList } from "@/components/properties/review-list";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ApiError } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { serverFetch } from "@/lib/server-api";
import type { PropertyDetails } from "@/types/models";

async function getProperty(id: string): Promise<PropertyDetails> {
  try {
    const res = await serverFetch<PropertyDetails>(`/api/properties/${id}`, {
      revalidate: 0,
    });
    return res.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const property = await getProperty(id);
    return {
      title: property.title,
      description: property.description.slice(0, 160),
    };
  } catch {
    return { title: "Property" };
  }
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/properties" className="hover:text-primary">
          Properties
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{property.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <ImageGallery images={property.images} title={property.title} />

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
              <StatusBadge status={property.availability} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" />
              {property.location}
            </p>
            {property.totalReviews > 0 && property.averageRating !== null && (
              <p className="mt-2 flex items-center gap-2 text-sm">
                <RatingStars rating={property.averageRating} />
                <span className="font-medium">{property.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({property.totalReviews} review{property.totalReviews > 1 ? "s" : ""})
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-6 rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <BedDouble className="size-5 text-primary" />
              <span className="text-sm">
                <span className="font-semibold">{property.bedrooms}</span> bedrooms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="size-5 text-primary" />
              <span className="text-sm">
                <span className="font-semibold">{property.bathrooms}</span> bathrooms
              </span>
            </div>
            {property.category && (
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <span className="text-sm font-semibold">{property.category.name}</span>
              </div>
            )}
          </div>

          <section>
            <h2 className="text-xl font-semibold">About this property</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">
              {property.description}
            </p>
          </section>

          {property.amenities.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="gap-1 capitalize">
                    <Check className="size-3" />
                    {amenity}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <Separator />

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Reviews {property.totalReviews > 0 && `(${property.totalReviews})`}
            </h2>
            <ReviewList reviews={property.reviews} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {formatMoney(property.rentAmount)}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RequestToRentButton
                propertyId={property.id}
                propertyTitle={property.title}
                rentAmount={property.rentAmount}
                availability={property.availability}
                landlordId={property.landlordId}
              />

              <Separator />

              <div>
                <h3 className="text-sm font-semibold">Listed by</h3>
                <p className="mt-2 font-medium">{property.landlord.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  {property.landlord.email}
                </p>
                {property.landlord.phone && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5" />
                    {property.landlord.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
