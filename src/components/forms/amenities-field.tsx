"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
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

export function AmenitiesField({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  error?: { message?: string };
}) {
  const [draft, setDraft] = useState("");

  const add = (amenity: string) => {
    const normalized = amenity.trim().toLowerCase();
    if (!normalized || value.includes(normalized)) return;
    onChange([...value, normalized]);
    setDraft("");
  };

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="amenity-input">Amenities</FieldLabel>
      <div className="flex gap-2">
        <Input
          id="amenity-input"
          value={draft}
          placeholder="Type an amenity and press Enter"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(draft);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => add(draft)}>
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="gap-1 capitalize">
              {amenity}
              <button
                type="button"
                aria-label={`Remove ${amenity}`}
                onClick={() => onChange(value.filter((a) => a !== amenity))}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <FieldDescription>Quick add:</FieldDescription>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.filter((s) => !value.includes(s)).map((amenity) => (
          <button
            key={amenity}
            type="button"
            onClick={() => add(amenity)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize text-muted-foreground transition-colors",
              "hover:border-primary/40 hover:text-foreground"
            )}
          >
            + {amenity}
          </button>
        ))}
      </div>

      <FieldError errors={[error]} />
    </Field>
  );
}
