import { getData, setData } from "~/utils/settings";
import {
  getMaxCraftable,
  MissingItem,
  planCraft,
  RecipeGraph,
} from "./craftPlanner";
import { NO_UNLIMITED, UnlimitedItems } from "./unlimited";

// Goals live under their own storage key rather than a feature's, because two
// features read them: the panel lists them and the item page adds to them.
const GOALS_KEY = "farmhandGoals";

export interface TrackedGoal {
  addedAt: number;
  // "mastery" goals are measured against mastery progress rather than the
  // inventory: mastery counts everything ever acquired, so holding 99 of
  // something says nothing about how much of its tier is left.
  kind?: "mastery";
  name: string;
  quantity: number;
}

interface GoalsData {
  goals: TrackedGoal[];
}

export const getGoals = async (): Promise<TrackedGoal[]> => {
  const { goals } = await getData<GoalsData>(GOALS_KEY, { goals: [] });
  return Array.isArray(goals) ? goals : [];
};

export const setGoals = async (goals: TrackedGoal[]): Promise<void> => {
  await setData<GoalsData>(GOALS_KEY, { goals });
};

// Adding a goal that is already tracked replaces its quantity rather than
// stacking a second entry, so the item page's button is idempotent.
export const addGoal = async (
  name: string,
  quantity: number,
  kind?: TrackedGoal["kind"]
): Promise<TrackedGoal[]> => {
  const goals = await getGoals();
  const existing = goals.find((goal) => goal.name === name);
  const next = existing
    ? goals.map((goal) =>
        goal.name === name ? { ...goal, kind, quantity } : goal
      )
    : [...goals, { addedAt: Date.now(), kind, name, quantity }];
  await setGoals(next);
  return next;
};

export const removeGoal = async (name: string): Promise<TrackedGoal[]> => {
  const goals = await getGoals();
  const next = goals.filter((goal) => goal.name !== name);
  await setGoals(next);
  return next;
};

export interface GoalProgress {
  // how many more could be crafted from what is on hand
  canMakeNow: number;
  goal: TrackedGoal;
  // finished ones already in the inventory
  have: number;
  missing: MissingItem[];
  // 0..1, counting both finished stock and what the materials would cover
  ratio: number;
}

// Progress toward a tracked goal.
//
// `have` and `canMakeNow` are added together because both represent goal units
// the player effectively already has — one sitting in the inventory, one a
// button press away. Counting only finished stock would show no movement at all
// while a long materials grind was actually being won.
export const getGoalProgress = (
  graph: RecipeGraph,
  goal: TrackedGoal,
  inventory: Record<string, number>,
  unlimited: UnlimitedItems = NO_UNLIMITED,
  mastery: {
    name: string;
    remaining: number;
    required: number;
    value: number;
  }[] = []
): GoalProgress => {
  // A mastery goal is "acquire N more", not "hold N". Measuring it against the
  // inventory reported it finished the moment the shelf held more than the
  // remainder -- 99 Cave Paste read as done when the tier still wanted one more
  // to be made. Mastery progress is the only thing that answers it, and reading
  // it live means the figure keeps up as the tier fills.
  if (goal.kind === "mastery") {
    const entry = mastery.find((item) => item.name === goal.name);
    if (entry) {
      const plan = planCraft(
        graph,
        goal.name,
        entry.remaining,
        inventory,
        unlimited
      );
      return {
        canMakeNow: Math.min(
          entry.remaining,
          getMaxCraftable(graph, goal.name, inventory, unlimited)
        ),
        goal,
        have: entry.value,
        missing: entry.remaining > 0 ? plan.missing : [],
        ratio: Math.min(1, entry.value / entry.required),
      };
    }
  }
  const have = inventory[goal.name] ?? 0;
  const outstanding = Math.max(0, goal.quantity - have);
  if (outstanding === 0) {
    return { canMakeNow: 0, goal, have, missing: [], ratio: 1 };
  }
  // the finished ones on hand are not raw material for the rest, so they are
  // taken off the shelf before costing what is left
  const pool = { ...inventory, [goal.name]: 0 };
  const canMakeNow = Math.min(
    outstanding,
    getMaxCraftable(graph, goal.name, pool, unlimited)
  );
  const plan = planCraft(graph, goal.name, outstanding, pool, unlimited);
  return {
    canMakeNow,
    goal,
    have,
    missing: plan.missing,
    ratio: Math.min(1, (have + canMakeNow) / goal.quantity),
  };
};

// The sub-crafts every tracked goal needs, deepest-first across all of them.
//
// An item wanted by two goals keeps the deeper of its two positions, so the
// merged order is still one every goal can be built from top to bottom.
export const getDesiredQueue = (
  graph: RecipeGraph,
  goals: TrackedGoal[],
  inventory: Record<string, number>,
  unlimited: UnlimitedItems = NO_UNLIMITED
): { name: string; quantity: number }[] => {
  const byName = new Map<string, { depth: number; quantity: number }>();
  for (const goal of goals) {
    // a mastery goal always wants more made, whatever is on the shelf
    const have = goal.kind === "mastery" ? 0 : inventory[goal.name] ?? 0;
    const outstanding = Math.max(0, goal.quantity - have);
    if (outstanding === 0) {
      continue;
    }
    const plan = planCraft(
      graph,
      goal.name,
      outstanding,
      { ...inventory, [goal.name]: 0 },
      unlimited
    );
    for (const step of plan.steps) {
      const existing = byName.get(step.name);
      byName.set(step.name, {
        depth: Math.max(existing?.depth ?? 0, step.depth),
        quantity: (existing?.quantity ?? 0) + step.quantity,
      });
    }
  }
  return [...byName.entries()]
    .sort((a, b) => b[1].depth - a[1].depth)
    .map(([name, entry]) => ({ name, quantity: entry.quantity }));
};
