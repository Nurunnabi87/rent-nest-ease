"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CircleCheckBig, ExternalLink, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { useUpdateRequestStatus } from "@/hooks/use-landlord";
import type { RentalRequest } from "@/types/models";

export function LandlordRequestRow({ request }: { request: RentalRequest }) {
  const mutation = useUpdateRequestStatus();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  const property = request.property;
  const isPending = request.status === "PENDING";
  const isActive = request.status === "ACTIVE";

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{property?.title ?? "Property"}</h3>
              <StatusBadge status={request.status} />
            </div>
            {property && (
              <p className="mt-1 text-sm text-muted-foreground">
                {property.location ? `${property.location} · ` : ""}
                {formatMoney(property.rentAmount)}/mo
              </p>
            )}
          </div>
          {property && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/properties/${property.id}`}>
                <ExternalLink className="size-3.5" />
                View listing
              </Link>
            </Button>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Tenant</dt>
            <dd className="mt-0.5 font-medium">{request.tenant?.name ?? "—"}</dd>
            {request.tenant?.email && (
              <dd className="truncate text-xs text-muted-foreground">
                {request.tenant.email}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-muted-foreground">Move-in</dt>
            <dd className="mt-0.5 font-medium">{formatDate(request.moveInDate)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="mt-0.5 font-medium">{request.durationMonths} months</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Payment</dt>
            <dd className="mt-0.5">
              {request.payment ? (
                <StatusBadge status={request.payment.status} />
              ) : (
                <span className="font-medium text-muted-foreground">—</span>
              )}
            </dd>
          </div>
        </dl>

        {request.message && (
          <p className="rounded-lg bg-muted/50 p-3 text-sm">
            <span className="font-medium">Tenant&apos;s message: </span>
            {request.message}
          </p>
        )}

        {request.landlordNote && (
          <p className="rounded-lg border-l-4 border-primary bg-muted/50 p-3 text-sm">
            <span className="font-medium">Your note: </span>
            {request.landlordNote}
          </p>
        )}

        {(isPending || isActive) && (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {isPending && (
              <>
                <Button
                  size="sm"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({ id: request.id, status: "APPROVED" })
                  }
                >
                  {mutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => setRejectOpen(true)}
                >
                  <X className="size-3.5" />
                  Reject
                </Button>
              </>
            )}
            {isActive && (
              <Button
                size="sm"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ id: request.id, status: "COMPLETED" })}
              >
                <CircleCheckBig className="size-3.5" />
                Mark as completed
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this request?</DialogTitle>
            <DialogDescription>
              You can leave a short note explaining your decision — the tenant will see
              it on their dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`note-${request.id}`}>Note (optional)</Label>
            <Textarea
              id={`note-${request.id}`}
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. The property is already reserved for those dates."
            />
            <p className="text-xs text-muted-foreground">{note.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                mutation.mutate({
                  id: request.id,
                  status: "REJECTED",
                  landlordNote: note.trim() || undefined,
                });
                setRejectOpen(false);
                setNote("");
              }}
            >
              Reject request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
