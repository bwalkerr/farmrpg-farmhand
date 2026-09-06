import { isUnlimited, NO_UNLIMITED, UnlimitedItems } from "./unlimited";
import {
  MissingItem,
  planCraft,
  planSourcing,
  RecipeGraph,
} from "./craftPlanner";

// Something Reed is working toward. Quests come off the quest page, craft
// targets off the Craftworks queue; both reduce to "I need N of this item".
export interface Goal {
  kind: "quest" | "craft";
  // for a quest, the quest's own name; for a craft, the item being made
  label: string;
  // the items the goal consumes, already multiplied out
  needs: { name: string; quantity: number }[];
  // deep-link back to the thing, when there is one
  href?: string;
}

export interface GoalStatus {
  goal: Goal;
  // shortfalls after spending inventory and crafting whatever can be crafted
  missing: MissingItem[];
  // true when nothing is missing: it can be done right now
  isReady: boolean;
}

// Work out what each goal is still short of.
//
// Every goal is measured against the *full* inventory rather than a pool shared
// between them. Goals are alternatives competing for the same materials, not a
// batch to be completed at once, so "what would it take to finish this one" is
// the question worth answering; a shared pool would make the second goal in an
// arbitrary order look worse than the first for no real reason.
export const getGoalStatuses = (
  graph: RecipeGraph,
  goals: Goal[],
  inventory: Record<string, number>,
  unlimited: UnlimitedItems = NO_UNLIMITED
): GoalStatus[] => {
  const statuses: GoalStatus[] = [];
  for (const goal of goals) {
    const missing = new Map<string, number>();
    for (const need of goal.needs) {
      // a quest wants the item itself, so spend inventory first and only then
      // fall back to crafting — planCraft always builds its target in full,
      // which is right for "make me N more" and wrong for "hand over N"
      if (isUnlimited(unlimited, need.name)) {
        continue;
      }
      const held = inventory[need.name] ?? 0;
      const shortfall = need.quantity - held;
      if (shortfall <= 0) {
        continue;
      }
      const node = graph.nodes.get(need.name);
      if (node?.canCraft && node.ingredients.length > 0) {
        // craft the shortfall, spending everything except what this need
        // already took off the shelf
        const pool = { ...inventory, [need.name]: 0 };
        const plan = planCraft(graph, need.name, shortfall, pool, unlimited);
        for (const entry of plan.missing) {
          missing.set(
            entry.name,
            (missing.get(entry.name) ?? 0) + entry.quantity
          );
        }
        continue;
      }
      missing.set(need.name, (missing.get(need.name) ?? 0) + shortfall);
    }
    const missingList = [...missing.entries()]
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
    statuses.push({
      goal,
      isReady: missingList.length === 0,
      missing: missingList,
    });
  }
  return statuses;
};

export interface Bottleneck {
  // how many goals are held up by this item
  goalsGated: number;
  // the worst single goal's shortfall
  maxNeeded: number;
  name: string;
  // labels of the goals it gates, for display
  goals: string[];
  // shortfall summed across every goal that wants it
  totalNeeded: number;
}

// Rank raw materials by how much of the backlog they unblock. This is the
// "what should I go get" answer: one item gating five goals beats one gating a
// single goal even when the single goal needs far more of it.
export const rankBottlenecks = (statuses: GoalStatus[]): Bottleneck[] => {
  const byName = new Map<string, Bottleneck>();
  for (const status of statuses) {
    if (status.isReady) {
      continue;
    }
    for (const entry of status.missing) {
      const existing = byName.get(entry.name) ?? {
        goals: [],
        goalsGated: 0,
        maxNeeded: 0,
        name: entry.name,
        totalNeeded: 0,
      };
      existing.goalsGated += 1;
      existing.goals.push(status.goal.label);
      existing.maxNeeded = Math.max(existing.maxNeeded, entry.quantity);
      existing.totalNeeded += entry.quantity;
      byName.set(entry.name, existing);
    }
  }
  return [...byName.values()].sort(
    (a, b) => b.goalsGated - a.goalsGated || b.maxNeeded - a.maxNeeded
  );
};

// Goals that are one item short. These are the highest-leverage thing on the
// board: a single trip finishes them outright.
export const getNearlyDone = (statuses: GoalStatus[]): GoalStatus[] =>
  statuses.filter((status) => !status.isReady && status.missing.length === 1);

// Where to go for the top bottlenecks, reusing the item-page roll-up so both
// surfaces quote the same numbers.
export const getFocusSourcing = (
  graph: RecipeGraph,
  bottlenecks: Bottleneck[],
  limit = 6
): ReturnType<typeof planSourcing> =>
  planSourcing(
    graph,
    bottlenecks.slice(0, limit).map((entry) => ({
      name: entry.name,
      quantity: entry.maxNeeded,
    }))
  );

// Fold several shortfall lists into one, taking the largest ask for any item
// rather than the sum.
//
// The lists come from sources that overlap: a request short of 40 Steel and a
// Craftworks slot stalled on Steel are the same trip, not two. Summing would
// inflate the hit count for exactly the materials that matter most, which is
// the opposite of useful when the point is deciding where to spend an hour.
export const mergeMissing = (...lists: MissingItem[][]): MissingItem[] => {
  const byName = new Map<string, number>();
  for (const list of lists) {
    for (const entry of list) {
      byName.set(
        entry.name,
        Math.max(byName.get(entry.name) ?? 0, entry.quantity)
      );
    }
  }
  return [...byName.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
};
