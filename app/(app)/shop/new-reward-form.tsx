"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createRewardAction, type FormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
    >
      {pending ? "Adding..." : "Add reward"}
    </button>
  );
}

const inputClass =
  "rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500";

export function NewRewardForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createRewardAction,
    undefined
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex w-20 flex-col gap-1">
          <label htmlFor="icon" className="text-sm text-neutral-300">
            Icon
          </label>
          <input
            id="icon"
            name="icon"
            type="text"
            maxLength={8}
            placeholder="🎁"
            className={`${inputClass} text-center`}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="title" className="text-sm text-neutral-300">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={100}
            placeholder="Buy the trading course"
            className={inputClass}
          />
        </div>
        <div className="flex w-28 flex-col gap-1">
          <label htmlFor="goldCost" className="text-sm text-neutral-300">
            Cost
          </label>
          <input
            id="goldCost"
            name="goldCost"
            type="number"
            required
            min={1}
            step={1}
            defaultValue={100}
            className={inputClass}
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
          rows={2}
          maxLength={500}
          className={inputClass}
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
