"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createGoalAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create goal"}
    </button>
  );
}

export default function NewGoalPage() {
  const [state, formAction] = useActionState(createGoalAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">New goal</h1>
      <form action={formAction} className="flex max-w-lg flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex w-20 flex-col gap-1">
            <label htmlFor="icon" className="text-sm text-neutral-300">
              Icon
            </label>
            <input
              id="icon"
              name="icon"
              type="text"
              maxLength={8}
              placeholder="🎯"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-neutral-100 outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex min-w-40 flex-1 flex-col gap-1">
            <label htmlFor="title" className="text-sm text-neutral-300">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={100}
              placeholder="Become good at trading"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-neutral-300">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500"
          />
        </div>
        {state?.error ? (
          <p className="text-sm text-red-400">{state.error}</p>
        ) : null}
        <div>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
