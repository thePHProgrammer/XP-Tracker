"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { inputClass } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateGoalAction, type FormState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function EditGoalForm({
  goalId,
  title,
  description,
  icon,
}: {
  goalId: string;
  title: string;
  description: string;
  icon: string;
}) {
  const boundAction = updateGoalAction.bind(null, goalId);
  const [state, formAction] = useActionState<FormState, FormData>(
    boundAction,
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
            defaultValue={icon}
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
            defaultValue={title}
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
          rows={3}
          maxLength={500}
          defaultValue={description}
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
