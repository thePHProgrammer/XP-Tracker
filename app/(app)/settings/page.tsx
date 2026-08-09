import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCharacter } from "@/lib/domain/character";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Read the name fresh from the DB rather than the session - the JWT
  // session caches user fields at login time and won't reflect a change
  // made on this very page until the next login.
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  const character = await getOrCreateCharacter(session.user.id);
  const timezones = Intl.supportedValuesOf("timeZone");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <SettingsForm
        name={user.name ?? ""}
        timezone={character.timezone}
        timezones={timezones}
      />
    </div>
  );
}
