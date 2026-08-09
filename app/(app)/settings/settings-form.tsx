"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSettingsAction, type FormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

const inputClass =
  "rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500";

export function SettingsForm({
  name,
  timezone,
  timezones,
}: {
  name: string;
  timezone: string;
  timezones: string[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateSettingsAction,
    undefined
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-neutral-300">
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={name}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="timezone" className="text-sm text-neutral-300">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={timezone}
          className={inputClass}
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <p className="text-xs text-neutral-500">
          Used to decide when your Dailies reset and when missed ones cost
          HP - set this to where you actually are.
        </p>
      </div>

      {state && "error" in state ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-green-400">Saved.</p>
      ) : null}
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
