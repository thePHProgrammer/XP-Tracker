"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { inputClass } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateSettingsAction, type FormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

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
        <p className="flex items-center gap-1 text-sm text-emerald-400">
          <Check className="h-4 w-4" />
          Saved.
        </p>
      ) : null}
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
