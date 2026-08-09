import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  timezone: z.string().trim().min(1, "Timezone is required").max(100),
});
