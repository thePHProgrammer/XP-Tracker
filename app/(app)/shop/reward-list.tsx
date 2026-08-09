"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Coins } from "lucide-react";
import type { Reward } from "@/app/generated/prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { archiveRewardAction, purchaseRewardAction } from "./actions";

type RewardLite = Pick<
  Reward,
  "id" | "title" | "description" | "goldCost" | "icon"
>;

export function RewardList({
  gold,
  rewards,
}: {
  gold: number;
  rewards: RewardLite[];
}) {
  const [optimisticGold, applyGoldDelta] = useOptimistic(
    gold,
    (current: number, delta: number) => current + delta
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  function handlePurchase(reward: RewardLite) {
    setError(null);
    startTransition(async () => {
      applyGoldDelta(-reward.goldCost);
      const result = await purchaseRewardAction(reward.id);
      if (!result.ok) {
        setError(result.error);
      } else {
        setPurchasedId(reward.id);
        setTimeout(() => setPurchasedId(null), 1500);
      }
    });
  }

  function handleArchive(rewardId: string) {
    startTransition(async () => {
      await archiveRewardAction(rewardId);
    });
  }

  if (rewards.length === 0) {
    return (
      <Card className="border-dashed p-6 text-center text-sm text-neutral-500">
        No rewards yet. Add one below - e.g. &quot;Level 5 Trading: buy the
        course, 500 gold&quot;.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex items-center gap-2 px-4 py-3">
        <Coins className="h-4 w-4 text-amber-400" />
        <span className="text-sm text-neutral-400">Balance:</span>
        <span className="font-semibold text-amber-300">
          {optimisticGold} gold
        </span>
      </Card>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <ul className="flex flex-col gap-2">
        {rewards.map((reward) => {
          const canAfford = optimisticGold >= reward.goldCost;
          return (
            <li key={reward.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    {reward.icon ? (
                      <span className="text-lg">{reward.icon}</span>
                    ) : null}
                    {reward.title}
                    {purchasedId === reward.id ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                        <Check className="h-3 w-3" />
                        Purchased!
                      </span>
                    ) : null}
                  </p>
                  {reward.description ? (
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {reward.description}
                    </p>
                  ) : null}
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-300">
                    <Coins className="h-3 w-3" />
                    {reward.goldCost} gold
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => handlePurchase(reward)}
                    disabled={isPending || !canAfford}
                    variant={canAfford ? "primary" : "secondary"}
                    size="sm"
                  >
                    {canAfford ? "Redeem" : "Not enough gold"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleArchive(reward.id)}
                    disabled={isPending}
                    variant="secondary"
                    size="sm"
                    className="hover:text-red-400"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
