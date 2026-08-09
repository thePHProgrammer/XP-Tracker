"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { signupSchema } from "@/lib/validation/auth";
import { isRateLimited, recordAttempt } from "@/lib/domain/rateLimit";

export type FormState = { error: string } | undefined;

export async function signupAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please check your details and try again." };
  }

  const { name, email, password } = parsed.data;

  if (await isRateLimited(email)) {
    return { error: "Too many attempts. Please try again later." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await recordAttempt(email);
    // Generic message - never reveal that the account already exists.
    return {
      error: "Could not create account. Try a different email or log in.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}
