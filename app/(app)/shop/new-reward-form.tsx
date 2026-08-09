"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { inputClass } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRewardAction, type FormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add reward"}
    </Button>
  );
}

export function NewRewardForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createRewardAction,
    undefined
  );

  return (
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
            placeholder="🎁"
            className={`${inputClass} text-center`}
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
