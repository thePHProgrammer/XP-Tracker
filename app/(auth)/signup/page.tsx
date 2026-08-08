"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
    >
      {pending ? "Creating account..." : "Sign up"}
    </button>
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
          className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500"
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
          className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500"
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
          className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500"
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
