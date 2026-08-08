"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createTaskAction, type FormState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
    >
      {pending ? "Adding..." : "Add task"}
    </button>
  );
}

const inputClass =
  "rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500";

export function NewTaskForm({ goalId }: { goalId: string }) {
  const boundAction = createTaskAction.bind(null, goalId);
  const [state, formAction] = useActionState<FormState, FormData>(
    boundAction,
    undefined
  );
  const [type, setType] = useState<"HABIT" | "TODO">("TODO");

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-neutral-300">Type</span>
        <div className="flex gap-2">
          <label className="flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-700 px-3 py-2 has-[:checked]:border-indigo-500 has-[:checked]:bg-neutral-900">
            <input
              type="radio"
              name="type"
              value="TODO"
              checked={type === "TODO"}
              onChange={() => setType("TODO")}
            />
            To-do (one-off)
          </label>
          <label className="flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-700 px-3 py-2 has-[:checked]:border-indigo-500 has-[:checked]:bg-neutral-900">
            <input
              type="radio"
              name="type"
              value="HABIT"
              checked={type === "HABIT"}
              onChange={() => setType("HABIT")}
            />
            Habit (repeatable)
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm text-neutral-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          placeholder="Read a trading book"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm text-neutral-300">
          Notes (optional)
        </label>
        <textarea id="notes" name="notes" rows={2} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="difficulty" className="text-sm text-neutral-300">
          Difficulty
        </label>
        <select
          id="difficulty"
          name="difficulty"
          defaultValue="EASY"
          className={inputClass}
        >
          <option value="TRIVIAL">Trivial (5 XP)</option>
          <option value="EASY">Easy (12 XP)</option>
          <option value="MEDIUM">Medium (25 XP)</option>
          <option value="HARD">Hard (45 XP)</option>
        </select>
      </div>

      {type === "HABIT" ? (
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" name="habitAllowNegative" />
          Also allow a negative click (costs HP)
        </label>
      ) : null}

      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
