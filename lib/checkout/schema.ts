import { z } from "zod";
import { isKnownCity } from "./cities";

// Deliberately has no "province" field — province is derived server-side
// from the validated city (lib/checkout/cities.ts), never submitted by the
// client. See CLAUDE.md's Constraints for the reasoning.
export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1, "Full name is required"),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((digits) => /^3\d{9}$/.test(digits), {
      message: "Enter a valid Pakistani mobile number (e.g. 300 1234567)",
    }),
  address: z.string().trim().min(1, "Complete address is required"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .refine(isKnownCity, { message: "Select a city from the list" }),
  landmark: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
