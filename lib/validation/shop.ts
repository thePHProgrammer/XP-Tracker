import { z } from "zod";

export const rewardSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || undefined),
  goldCost: z.coerce
    .number()
    .int("Gold cost must be a whole number")
    .min(1, "Gold cost must be at least 1")
    .max(1_000_000),
  icon: z
    .string()
    .trim()
    .max(8)
    .optional()
    .transform((v) => v || undefined),
});
