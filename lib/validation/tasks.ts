import { z } from "zod";

export const difficultySchema = z.enum(["TRIVIAL", "EASY", "MEDIUM", "HARD"]);

const checkbox = z
  .union([z.literal("on"), z.literal(null)])
  .optional()
  .transform((v) => v === "on");

export const createTaskSchema = z.object({
  type: z.enum(["HABIT", "TODO", "DAILY"]),
  title: z.string().trim().min(1, "Title is required").max(100),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || undefined),
  difficulty: difficultySchema,
  habitAllowNegative: checkbox,
  repeatDays: z
    .array(z.coerce.number().int().min(0).max(6))
    .optional()
    .transform((v) => v ?? []),
});
