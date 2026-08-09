import { redirect } from "next/navigation";
import { Coins, Flame, Heart, Sparkles, Swords } from "lucide-react";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Swords,
    title: "Goals become quests",
    body: "Break a real goal into Habits, Dailies, and To-dos - each one worth real XP and gold.",
  },
  {
    icon: Flame,
    title: "Streaks & HP",
    body: "Keep your Dailies up to build a streak. Miss one and it costs you HP - just like a real RPG.",
  },
  {
    icon: Coins,
    title: "Spend what you earn",
    body: "Define your own rewards - a course, a treat, a night off - and redeem them with gold you actually earned.",
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-20 text-center text-neutral-100">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
        <Sparkles className="h-4 w-4" />
        Level up your real life
      </div>
      <h1 className="max-w-2xl bg-gradient-to-br from-white via-white to-neutral-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
        Turn your goals into an RPG
      </h1>
      <p className="mt-6 max-w-lg text-lg text-neutral-400">
        Break goals into habits, dailies, and to-dos. Earn XP and gold, level
        up, and spend what you earn on rewards you define for yourself.
      </p>
      <div className="mt-10 flex gap-4">
        <LinkButton href="/signup" size="lg">
          Get started
        </LinkButton>
        <LinkButton href="/login" variant="secondary" size="lg">
          Log in
        </LinkButton>
      </div>

      <div className="mt-24 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="p-6 text-left">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-100">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-sm text-neutral-400">{feature.body}</p>
          </Card>
        ))}
      </div>

      <div className="mt-16 flex items-center gap-3 text-sm text-neutral-500">
        <Heart className="h-4 w-4 text-rose-400" />
        Free to use - no credit card, ever.
      </div>
    </div>
  );
}
