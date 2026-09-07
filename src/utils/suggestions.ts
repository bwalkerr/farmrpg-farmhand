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
  source: "mastery" | "quest" | "set";
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

// Words players append to a set name that is otherwise just the thing they are
// building — "Lantern prereqs" is a Lantern goal.
const SET_NAME_SUFFIXES = [
  "prereqs",
  "prereq",
  "prereqs.",
  "parts",
  "mats",
  "materials",
  "chain",
  "line",
];

// Work out which item a saved Craftworks set is aiming at, from its name alone.
//
// Set contents are unreadable without activating the set, so the name is all
// there is. Matching is case-insensitive because players are casual about it
// ("Fancy table"), and a trailing qualifier is stripped so "Lantern prereqs"
// still resolves. Anything that does not resolve to a real item — a location
// loadout like "Explore - Mount Banon" — simply returns undefined.
export const matchSetNameToItem = (
  setName: string,
  itemNames: Iterable<string>
): string | undefined => {
  const byLower = new Map<string, string>();
  for (const name of itemNames) {
    byLower.set(name.toLowerCase(), name);
  }
  const cleaned = setName.trim().toLowerCase();
  const direct = byLower.get(cleaned);
  if (direct) {
    return direct;
  }
  for (const suffix of SET_NAME_SUFFIXES) {
    if (cleaned.endsWith(` ${suffix}`)) {
      const trimmed = cleaned.slice(0, -suffix.length - 1).trim();
      const match = byLower.get(trimmed);
      if (match) {
        return match;
      }
    }
  }
  return undefined;
};

// Saved sets named after an item are goals the player has already been keeping
// by hand; surface them as suggestions so the tool can see what they are
// building. Inference from a name, so it is offered rather than adopted.
export const getSetSuggestions = (
  sets: { isActive: boolean; name: string }[],
  itemNames: Iterable<string>,
  tracked: TrackedGoal[],
  inventory: Record<string, number>,
  limit = 4
): GoalSuggestion[] => {
  const already = new Set(tracked.map((goal) => goal.name));
  const names = [...itemNames];
  const seen = new Set<string>();
  const suggestions: GoalSuggestion[] = [];
  for (const set of sets) {
    const item = matchSetNameToItem(set.name, names);
    if (!item || already.has(item) || seen.has(item)) {
      continue;
    }
    seen.add(item);
    suggestions.push({
      name: item,
      quantity: Math.max(1, 1 - (inventory[item] ?? 0)),
      reason: set.isActive
        ? `your active set “${set.name}”`
        : `your saved set “${set.name}”`,
      source: "set",
    });
  }
  // the set currently loaded is the one being worked on right now
  return suggestions
    .sort(
      (a, b) =>
        Number(b.reason.includes("active")) -
        Number(a.reason.includes("active"))
    )
    .slice(0, limit);
};

export interface SetRecommendation {
  goalName: string;
  id: string;
  name: string;
}

// The saved set that matches a tracked goal and is not already loaded.
//
// Matching runs the same name inference as getSetSuggestions, in reverse: the
// player named a set after the thing it builds, so a goal for that thing means
// that set is the one to load. The active set is excluded because recommending
// it would be advice to re-run a destructive activation for no change.
// Takes the item names the backlog wants rather than the tracked goals, so a
// set that makes something a QUEST needs -- or an intermediate two
// undertakings both need -- is recommendable too. Matching only literal
// tracked-goal names meant the loader stayed silent on almost everything.
export const getRecommendedSet = (
  wantedNames: Iterable<string>,
  sets: { id: string; isActive: boolean; name: string }[],
  itemNames: Iterable<string>
): SetRecommendation | undefined => {
  const names = [...itemNames];
  const wanted = new Set([...wantedNames].map((name) => name.toLowerCase()));
  for (const set of sets) {
    if (set.isActive) {
      continue;
    }
    const item = matchSetNameToItem(set.name, names);
    if (item && wanted.has(item.toLowerCase())) {
      return { goalName: item, id: set.id, name: set.name };
    }
  }
  return undefined;
};
