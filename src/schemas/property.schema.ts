import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  rentAmount: z.coerce
    .number({ message: "Rent must be a number" })
    .int("Rent must be a whole number")
    .positive("Rent must be greater than 0"),
  bedrooms: z.coerce
    .number({ message: "Bedrooms must be a number" })
    .int()
    .min(0, "Bedrooms cannot be negative"),
  bathrooms: z.coerce
    .number({ message: "Bathrooms must be a number" })
    .int()
    .min(0, "Bathrooms cannot be negative"),
  amenities: z
    .array(z.string().min(1))
    .min(1, "Add at least one amenity"),
  images: z
    .array(
      z.object({
        url: z.string().url("Must be a valid image URL"),
      })
    )
    .min(1, "Add at least one image URL"),
  categoryId: z.string().uuid("Please select a category"),
  availability: z.enum(["AVAILABLE", "RENTED", "UNAVAILABLE"]).optional(),
});

// `coerce` makes the raw form values (strings) differ from the parsed output,
// so react-hook-form needs both shapes.
export type PropertyFormInput = z.input<typeof propertySchema>;
export type PropertyFormValues = z.output<typeof propertySchema>;
