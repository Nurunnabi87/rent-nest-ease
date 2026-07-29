"use client";

import Image from "next/image";
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { ImageOff, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { PropertyFormInput } from "@/schemas/property.schema";

export function ImageUrlListField({
  control,
  register,
  errors,
  values,
}: {
  control: Control<PropertyFormInput>;
  register: UseFormRegister<PropertyFormInput>;
  errors: FieldErrors<PropertyFormInput>;
  values: { url: string }[];
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  return (
    <Field data-invalid={!!errors.images}>
      <FieldLabel>Image URLs</FieldLabel>
      <div className="space-y-3">
        {fields.map((field, index) => {
          const url = values?.[index]?.url ?? "";
          const isValid = /^https?:\/\/.+/.test(url);
          return (
            <div key={field.id} className="flex items-start gap-2">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                {isValid ? (
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex size-full items-center justify-center">
                    <ImageOff className="size-5 text-muted-foreground" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  placeholder="https://example.com/photo.jpg"
                  aria-invalid={!!errors.images?.[index]?.url}
                  {...register(`images.${index}.url`)}
                />
                <FieldError errors={[errors.images?.[index]?.url]} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove image ${index + 1}`}
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => append({ url: "" })}
      >
        <Plus className="size-3.5" />
        Add image URL
      </Button>
      <FieldError errors={[errors.images?.root ?? errors.images]} />
    </Field>
  );
}
