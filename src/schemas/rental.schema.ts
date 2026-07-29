import { z } from "zod";

export const rentalRequestSchema = z.object({
  moveInDate: z
    .string()
    .min(1, "Move-in date is required")
    .refine((d) => new Date(d).getTime() > Date.now(), {
      message: "Move-in date must be in the future",
    }),
  durationMonths: z.coerce
    .number({ message: "Duration must be a number" })
    .int()
    .min(1, "Minimum duration is 1 month")
    .max(60, "Maximum duration is 60 months"),
  message: z.string().max(500, "Message can be at most 500 characters").optional(),
});

// `coerce` makes the raw form values (strings) differ from the parsed output,
// so react-hook-form needs both shapes.
export type RentalRequestInput = z.input<typeof rentalRequestSchema>;
export type RentalRequestValues = z.output<typeof rentalRequestSchema>;

export const landlordDecisionSchema = z.object({
  landlordNote: z
    .string()
    .max(500, "Note can be at most 500 characters")
    .optional(),
});

export type LandlordDecisionValues = z.infer<typeof landlordDecisionSchema>;
