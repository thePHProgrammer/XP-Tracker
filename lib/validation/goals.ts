import { z } from "zod";

export const goalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().max(500).optional(),
  icon: z
    .string()
    .trim()
    .max(8)
    .optional()
    .transform((v) => v || undefined),
});
