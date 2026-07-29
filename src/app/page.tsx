import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  CreditCard,
  Search as SearchIcon,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { HeroSearch } from "@/components/properties/hero-search";
import { PropertyGrid } from "@/components/properties/property-grid";
import { serverFetch } from "@/lib/server-api";
import type { Category, Property } from "@/types/models";

const STEPS = [
  {
    icon: SearchIcon,
    title: "Browse listings",
    description: "Filter by location, price, bedrooms and amenities to shortlist homes.",
  },
  {
    icon: CalendarCheck,
    title: "Request to rent",
    description: "Send a request with your move-in date and wait for landlord approval.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    description: "Once approved, pay the first month's rent through Stripe Checkout.",
  },
];

async function getHomeData() {
  const [properties, categories] = await Promise.allSettled([
    serverFetch<Property[]>(
      "/api/properties?limit=6&sortBy=createdAt&sortOrder=desc&availability=AVAILABLE"
    ),
    serverFetch<Category[]>("/api/categories"),
  ]);

  return {
    properties: properties.status === "fulfilled" ? properties.value.data : [],
    categories: categories.status === "fulfilled" ? categories.value.data : [],
    failed: properties.status === "rejected",
  };
}

export default async function HomePage() {
  const { properties, categories, failed } = await getHomeData();

  return (
    <>
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Find &amp; list rental properties{" "}
            <span className="text-primary">with ease</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            RentNest connects tenants with verified landlords. Browse homes, request a
            rental and pay securely — all in one place.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/properties">Browse properties</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register">List your property</Link>
            </Button>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick the type of home that fits you best.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link key={category.id} href={`/properties?categoryId=${category.id}`}>
                <Card className="h-full transition-colors hover:border-primary hover:bg-primary/5">
                  <CardContent className="flex flex-col items-center gap-2 py-2 text-center">
                    <Building2 className="size-6 text-primary" />
                    <span className="font-medium">{category.name}</span>
                    {category._count && (
                      <span className="text-xs text-muted-foreground">
                        {category._count.properties} listings
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured properties</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Freshly listed homes ready to move in.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/properties">View all</Link>
          </Button>
        </div>
        {failed ? (
          <EmptyState
            title="Couldn't load properties"
            description="The listing service is unavailable right now. Please try again in a moment."
            action={
              <Button variant="outline" asChild>
                <Link href="/properties">Go to browse page</Link>
              </Button>
            }
          />
        ) : properties.length === 0 ? (
          <EmptyState
            title="No properties listed yet"
            description="Check back soon — new homes are added regularly."
          />
        ) : (
          <PropertyGrid properties={properties} />
        )}
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Card key={step.title}>
                <CardContent className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <step.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
            <ShieldCheck className="size-8 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to find your next home?
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Create a free account as a tenant to send rental requests, or as a landlord
              to start listing properties today.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/register">Get started — it&apos;s free</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
