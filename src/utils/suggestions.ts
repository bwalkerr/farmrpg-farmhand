import { Goal } from "./focus";
import { MasteryEntry } from "~/api/farmrpg/apis/mastery";
import { TrackedGoal } from "./goals";

export interface GoalSuggestion {
  // how much of it the suggestion is for
  quantity: number;
  id?: number;
  // true when the inventory cap is stopping this from progressing at all
  isFrozen?: boolean;
  name: string;
  reason: string;
  source: "mastery" | "quest";
}

// Mastery is earned by acquiring an item, and an item sitting at the inventory
// cap cannot be acquired — crafting stalls and drops are discarded. So a capped
// item with mastery in progress is not merely a wasted Craftworks slot, it is
// mastery progress that has stopped dead. That is worth saying out loud, because
// nothing in the game connects the two screens.
export const getFrozenMastery = (
  entries: MasteryEntry[],
  inventory: Record<string, number>,
  cap: number | undefined
): MasteryEntry[] => {
  if (cap === undefined) {
    return [];
  }
  return entries
    .filter(
      (entry) => entry.remaining > 0 && (inventory[entry.name] ?? 0) >= cap
    )
    .sort((a, b) => a.remaining - b.remaining);
};

// Mastery tiers worth chasing, nearest first.
//
// Ranked by units still needed rather than percentage: 1 unit off a 100-unit
// tier is a trip to the shop, while 8% off a 1,000,000-unit tier is a month.
// Percentage would rank those the wrong way round.
export const getMasterySuggestions = (
  entries: MasteryEntry[],
  inventory: Record<string, number>,
  cap: number | undefined,
  tracked: TrackedGoal[],
  limit = 5
): GoalSuggestion[] => {
  const already = new Set(tracked.map((goal) => goal.name));
  return entries
    .filter((entry) => entry.remaining > 0 && !already.has(entry.name))
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, limit)
    .map((entry) => {
      const isFrozen = cap !== undefined && (inventory[entry.name] ?? 0) >= cap;
      return {
        id: entry.id,
        isFrozen,
        name: entry.name,
        quantity: entry.remaining,
        reason: isFrozen
          ? `mastery ${entry.value.toLocaleString()}/${entry.required.toLocaleString()} — frozen at cap`
          : `mastery ${entry.value.toLocaleString()}/${entry.required.toLocaleString()}`,
        source: "mastery" as const,
      };
    });
};

// Quest requirements the inventory does not already cover.
//
// The suggestion is for the shortfall, not the full requirement, so accepting
// one produces a goal that finishes the quest rather than one that overshoots
// by whatever is already on the shelf.
export const getQuestSuggestions = (
  goals: Goal[],
  inventory: Record<string, number>,
  tracked: TrackedGoal[],
  limit = 5
): GoalSuggestion[] => {
  const already = new Set(tracked.map((goal) => goal.name));
  const byName = new Map<string, GoalSuggestion>();
  for (const goal of goals) {
    for (const need of goal.needs) {
      if (already.has(need.name)) {
        continue;
      }
      const shortfall = need.quantity - (inventory[need.name] ?? 0);
      if (shortfall <= 0) {
        continue;
      }
      const existing = byName.get(need.name);
      // one item can serve several requests; keep the largest ask so accepting
      // the suggestion satisfies all of them
      if (!existing || shortfall > existing.quantity) {
        byName.set(need.name, {
          name: need.name,
          quantity: shortfall,
          reason: `for ${goal.label}`,
          source: "quest",
        });
      }
    }
  }
  return [...byName.values()]
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, limit);
};
