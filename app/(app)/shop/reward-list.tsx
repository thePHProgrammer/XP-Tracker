"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Reward } from "@/app/generated/prisma/client";
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
      <div className="rounded-lg border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500">
        No rewards yet. Add one below - e.g. &quot;Level 5 Trading: buy the
        course, 500 gold&quot;.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-400">
        Balance:{" "}
        <span className="font-medium text-neutral-100">
          {optimisticGold} gold
        </span>
      </p>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <ul className="flex flex-col gap-2">
        {rewards.map((reward) => {
          const canAfford = optimisticGold >= reward.goldCost;
          return (
            <li
              key={reward.id}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3"
            >
              <div>
                <p className="flex items-center gap-2 font-medium">
                  {reward.icon ? <span>{reward.icon}</span> : null}
                  {reward.title}
                  {purchasedId === reward.id ? (
                    <span className="text-xs text-green-400">
                      Purchased!
                    </span>
                  ) : null}
                </p>
                {reward.description ? (
                  <p className="text-xs text-neutral-500">
                    {reward.description}
                  </p>
                ) : null}
                <p className="text-xs text-neutral-500">
                  {reward.goldCost} gold
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePurchase(reward)}
                  disabled={isPending || !canAfford}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                >
                  {canAfford ? "Redeem" : "Not enough gold"}
                </button>
                <button
                  type="button"
                  onClick={() => handleArchive(reward.id)}
                  disabled={isPending}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-red-400 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
