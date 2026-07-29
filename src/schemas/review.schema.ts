import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number({ message: "Please select a rating" })
    .int()
    .min(1, "Please select a rating")
    .max(5),
  comment: z
    .string()
    .min(5, "Comment must be at least 5 characters")
    .max(1000, "Comment can be at most 1000 characters"),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
