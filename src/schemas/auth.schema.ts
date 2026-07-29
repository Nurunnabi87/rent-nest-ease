import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("A valid email address is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("A valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .min(6, "Phone number must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["TENANT", "LANDLORD"], {
    message: "Please choose whether you are a tenant or a landlord",
  }),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
