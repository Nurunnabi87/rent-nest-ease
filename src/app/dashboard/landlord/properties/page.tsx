"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink, Pencil, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getErrorMessage } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { useDeleteProperty, useLandlordProperties } from "@/hooks/use-landlord";

export default function LandlordPropertiesPage() {
  const { data: properties, isLoading, error } = useLandlordProperties();
  const deleteMutation = useDeleteProperty();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My properties"
        description="Manage your listings, update details or change availability."
        action={
          <Button asChild>
            <Link href="/dashboard/landlord/properties/new">
              <PlusCircle className="size-4" />
              Add property
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : error ? (
        <EmptyState
          title="Couldn't load your properties"
          description={getErrorMessage(error)}
        />
      ) : !properties || properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="You haven't listed any properties yet"
          description="Create your first listing to start receiving rental requests."
          action={
            <Button asChild>
              <Link href="/dashboard/landlord/properties/new">
                <PlusCircle className="size-4" />
                Add your first property
              </Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                            {property.images[0] && (
                              <Image
                                src={property.images[0]}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{property.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {property.location}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatMoney(property.rentAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={property.availability} />
                      </TableCell>
                      <TableCell>{property._count?.rentalRequests ?? 0}</TableCell>
                      <TableCell>{property._count?.reviews ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild title="View listing">
                            <Link href={`/properties/${property.id}`}>
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Edit">
                            <Link
                              href={`/dashboard/landlord/properties/${property.id}/edit`}
                            >
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <ConfirmDialog
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            }
                            title="Remove this property?"
                            description={`"${property.title}" will be removed from public listings. Existing rental requests are kept for your records.`}
                            confirmLabel="Remove listing"
                            destructive
                            onConfirm={() => deleteMutation.mutate(property.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
