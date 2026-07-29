"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { applyFieldErrors } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useCreateReview } from "@/hooks/use-reviews";
import { reviewSchema, type ReviewValues } from "@/schemas/review.schema";

export function ReviewDialog({
  propertyId,
  propertyTitle,
  open,
  onOpenChange,
}: {
  propertyId: string;
  propertyTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const mutation = useCreateReview(propertyId);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      reset();
      onOpenChange(false);
    } catch (error) {
      applyFieldErrors(error, setError, ["rating", "comment"]);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <FieldGroup>
            <Field data-invalid={!!errors.rating}>
              <FieldLabel>Your rating</FieldLabel>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        onMouseEnter={() => setHovered(value)}
                        onClick={() => field.onChange(value)}
                      >
                        <Star
                          className={cn(
                            "size-8 transition-colors",
                            value <= (hovered || field.value)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}
              />
              <FieldError errors={[errors.rating]} />
            </Field>

            <Field data-invalid={!!errors.comment}>
              <FieldLabel htmlFor="comment">Your review</FieldLabel>
              <Textarea
                id="comment"
                rows={4}
                placeholder="How was your stay at this property?"
                aria-invalid={!!errors.comment}
                {...register("comment")}
              />
              <FieldError errors={[errors.comment]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Submit review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewDialogTrigger({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Star className="size-3.5" />
        Leave review
      </Button>
      <ReviewDialog
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
