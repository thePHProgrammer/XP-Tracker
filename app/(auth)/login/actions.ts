"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type FormState = { error: string } | undefined;

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // Re-throw redirect signals and anything else unexpected.
    throw error;
  }
}
