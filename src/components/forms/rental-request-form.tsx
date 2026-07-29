"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, applyFieldErrors, getErrorMessage } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import {
  rentalRequestSchema,
  type RentalRequestInput,
  type RentalRequestValues,
} from "@/schemas/rental.schema";
import type { RentalRequest } from "@/types/models";

export function RentalRequestDialog({
  propertyId,
  propertyTitle,
  rentAmount,
  open,
  onOpenChange,
}: {
  propertyId: string;
  propertyTitle: string;
  rentAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(12);

  // Lazy initialiser: reading the clock during render would be impure, and
  // this only needs to be resolved once per mount.
  const [minMoveInDate] = useState(() =>
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RentalRequestInput, unknown, RentalRequestValues>({
    resolver: zodResolver(rentalRequestSchema),
    defaultValues: { durationMonths: 12, message: "" },
  });

  const watchedDuration = useWatch({ control, name: "durationMonths" });

  const mutation = useMutation({
    mutationFn: (values: RentalRequestValues) =>
      apiFetch<RentalRequest>("/api/rentals", {
        method: "POST",
        body: JSON.stringify({
          propertyId,
          moveInDate: new Date(values.moveInDate).toISOString(),
          durationMonths: values.durationMonths,
          ...(values.message ? { message: values.message } : {}),
        }),
      }),
    onSuccess: () => {
      toast.success("Rental request sent! The landlord will review it shortly.");
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantRentals });
      queryClient.invalidateQueries({ queryKey: queryKeys.property(propertyId) });
      reset();
      onOpenChange(false);
      router.push("/dashboard/tenant");
    },
    onError: (error) => {
      if (!applyFieldErrors(error, setError, ["moveInDate", "durationMonths", "message"])) {
        toast.error(getErrorMessage(error));
      }
    },
  });

  const months = Number.isFinite(watchedDuration) ? Number(watchedDuration) : duration;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request to rent</DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          noValidate
          className="space-y-6"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.moveInDate}>
              <FieldLabel htmlFor="moveInDate">Move-in date</FieldLabel>
              <Input
                id="moveInDate"
                type="date"
                min={minMoveInDate}
                aria-invalid={!!errors.moveInDate}
                {...register("moveInDate")}
              />
              <FieldError errors={[errors.moveInDate]} />
            </Field>

            <Field data-invalid={!!errors.durationMonths}>
              <FieldLabel htmlFor="durationMonths">Duration (months)</FieldLabel>
              <Input
                id="durationMonths"
                type="number"
                min={1}
                max={60}
                aria-invalid={!!errors.durationMonths}
                {...register("durationMonths", {
                  onChange: (event) => setDuration(Number(event.target.value)),
                })}
              />
              <FieldError errors={[errors.durationMonths]} />
            </Field>

            <Field data-invalid={!!errors.message}>
              <FieldLabel htmlFor="message">Message to landlord (optional)</FieldLabel>
              <Textarea
                id="message"
                rows={3}
                placeholder="Tell the landlord a bit about yourself…"
                aria-invalid={!!errors.message}
                {...register("message")}
              />
              <FieldError errors={[errors.message]} />
            </Field>
          </FieldGroup>

          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly rent</span>
              <span className="font-medium">{formatMoney(rentAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Estimated total ({months || 0} mo)</span>
              <span className="font-medium">{formatMoney(rentAmount * (months || 0))}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              You&apos;ll only be charged the first month&apos;s rent after the landlord
              approves your request.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Send request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
