import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateCharacter } from "@/lib/domain/character";
import { listRewards } from "@/lib/domain/shop";
import { RewardList } from "./reward-list";
import { NewRewardForm } from "./new-reward-form";

export default async function ShopPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [character, rewards] = await Promise.all([
    getOrCreateCharacter(session.user.id),
    listRewards(session.user.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Shop</h1>
        <p className="text-sm text-neutral-400">
          Spend the gold you earn from goals on rewards you define for
          yourself.
        </p>
      </div>

      <RewardList gold={character.gold} rewards={rewards} />

      <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
        <h2 className="text-lg font-semibold">New reward</h2>
        <NewRewardForm />
      </div>
    </div>
  );
}
