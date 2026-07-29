"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AmenitiesField } from "@/components/forms/amenities-field";
import { ImageUrlListField } from "@/components/forms/image-url-list-field";
import { applyFieldErrors, getErrorMessage } from "@/lib/api-client";
import { useCategories } from "@/hooks/use-properties";
import { useCreateProperty, useUpdateProperty } from "@/hooks/use-landlord";
import {
  propertySchema,
  type PropertyFormInput,
  type PropertyFormValues,
} from "@/schemas/property.schema";
import type { Property } from "@/types/models";

const FIELD_NAMES = [
  "title",
  "description",
  "location",
  "rentAmount",
  "bedrooms",
  "bathrooms",
  "amenities",
  "images",
  "categoryId",
  "availability",
];

export function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter();
  const isEdit = !!property;
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty(property?.id ?? "");
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PropertyFormInput, unknown, PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property?.title ?? "",
      description: property?.description ?? "",
      location: property?.location ?? "",
      rentAmount: property?.rentAmount ?? ("" as unknown as number),
      bedrooms: property?.bedrooms ?? ("" as unknown as number),
      bathrooms: property?.bathrooms ?? ("" as unknown as number),
      amenities: property?.amenities ?? [],
      images: property?.images.length
        ? property.images.map((url) => ({ url }))
        : [{ url: "" }],
      categoryId: property?.categoryId ?? "",
      ...(isEdit ? { availability: property.availability } : {}),
    },
  });

  const imageValues = useWatch({ control, name: "images" });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      description: values.description,
      location: values.location,
      rentAmount: values.rentAmount,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      amenities: values.amenities,
      images: values.images.map((image) => image.url),
      categoryId: values.categoryId,
      ...(isEdit && values.availability ? { availability: values.availability } : {}),
    };

    try {
      await mutation.mutateAsync(payload);
      router.push("/dashboard/landlord/properties");
      router.refresh();
    } catch (error) {
      if (!applyFieldErrors(error, setError, FIELD_NAMES)) {
        toast.error(getErrorMessage(error));
      }
    }
  });

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="Cozy 2-bedroom apartment near downtown"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe the property, the neighbourhood and what's included…"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={!!errors.location}>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  placeholder="Dhanmondi, Dhaka"
                  aria-invalid={!!errors.location}
                  {...register("location")}
                />
                <FieldError errors={[errors.location]} />
              </Field>

              <Field data-invalid={!!errors.categoryId}>
                <FieldLabel htmlFor="categoryId">Category</FieldLabel>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger id="categoryId" className="w-full">
                        <SelectValue
                          placeholder={
                            categoriesLoading ? "Loading…" : "Select a category"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories ?? []).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.categoryId]} />
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <Field data-invalid={!!errors.rentAmount}>
                <FieldLabel htmlFor="rentAmount">Monthly rent (USD)</FieldLabel>
                <Input
                  id="rentAmount"
                  type="number"
                  min={1}
                  placeholder="1200"
                  aria-invalid={!!errors.rentAmount}
                  {...register("rentAmount")}
                />
                <FieldError errors={[errors.rentAmount]} />
              </Field>

              <Field data-invalid={!!errors.bedrooms}>
                <FieldLabel htmlFor="bedrooms">Bedrooms</FieldLabel>
                <Input
                  id="bedrooms"
                  type="number"
                  min={0}
                  placeholder="2"
                  aria-invalid={!!errors.bedrooms}
                  {...register("bedrooms")}
                />
                <FieldError errors={[errors.bedrooms]} />
              </Field>

              <Field data-invalid={!!errors.bathrooms}>
                <FieldLabel htmlFor="bathrooms">Bathrooms</FieldLabel>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  placeholder="1"
                  aria-invalid={!!errors.bathrooms}
                  {...register("bathrooms")}
                />
                <FieldError errors={[errors.bathrooms]} />
              </Field>
            </div>

            <Controller
              control={control}
              name="amenities"
              render={({ field }) => (
                <AmenitiesField
                  value={field.value ?? []}
                  onChange={field.onChange}
                  error={errors.amenities?.root ?? errors.amenities}
                />
              )}
            />

            <ImageUrlListField
              control={control}
              register={register}
              errors={errors}
              values={imageValues ?? []}
            />

            {isEdit && (
              <Field data-invalid={!!errors.availability}>
                <FieldLabel htmlFor="availability">Availability</FieldLabel>
                <Controller
                  control={control}
                  name="availability"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="availability" className="w-full sm:w-64">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="RENTED">Rented</SelectItem>
                        <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.availability]} />
              </Field>
            )}
          </FieldGroup>

          <div className="mt-8 flex gap-3">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Publish listing"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
