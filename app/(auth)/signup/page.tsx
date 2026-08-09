"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { inputClass } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Creating account..." : "Sign up"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-neutral-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-neutral-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-neutral-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="text-xs text-neutral-500">At least 8 characters.</p>
      </div>
      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
      <SubmitButton />
      <p className="text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
