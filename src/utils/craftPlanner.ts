import { isUnlimited, NO_UNLIMITED, UnlimitedItems } from "~/utils/unlimited";
import { Item } from "~/api/buddyfarm/types";

// A recipe tree deep enough to reach raw drops from anything in the game, with
// room to spare. The limit exists to stop a malformed or cyclic recipe graph
// from hanging the page, not because real recipes come close to it.
export const MAX_DEPTH = 12;

export interface RecipeNode {
  canCraft: boolean;
  craftingLevel: number;
  id: number;
  image: string;
  ingredients: { name: string; quantity: number }[];
  item: Item;
  name: string;
}

export interface RecipeGraph {
  nodes: Map<string, RecipeNode>;
  // items buddy.farm had no page for; treated as raws with no known source
  unknown: Set<string>;
  truncated: boolean;
}

export interface PlanStep {
  depth: number;
  name: string;
  quantity: number;
}

export interface MissingItem {
  name: string;
  quantity: number;
}

export interface CraftPlan {
  // items short of what the plan needs, after spending everything on hand
  missing: MissingItem[];
  // what the plan would take out of the inventory
  spend: Record<string, number>;
  // sub-crafts to run, deepest first: crafting in this order never needs
  // something a later step produces
  steps: PlanStep[];
  target: string;
  quantity: number;
  truncated: boolean;
  unknown: string[];
}

// Expand `quantity` of `target` into the sub-crafts and raw materials it needs,
// spending `inventory` as it goes.
//
// The inventory is a single shared pool consumed depth-first, so an ingredient
// needed by two different branches is never counted twice — the first branch to
// ask for it gets it. The target itself is always crafted in full: holding 3
// already does not reduce a request to craft 5 more.
export const planCraft = (
  graph: RecipeGraph,
  target: string,
  quantity: number,
  inventory: Record<string, number>,
  unlimited: UnlimitedItems = NO_UNLIMITED
): CraftPlan => {
  const pool: Record<string, number> = { ...inventory };
  const spend: Record<string, number> = {};
  const missing: Record<string, number> = {};
  const stepsByName = new Map<string, PlanStep>();
  const unknown = new Set<string>();
  const { nodes } = graph;
  let { truncated } = graph;

  const addMissing = (name: string, amount: number): void => {
    missing[name] = (missing[name] ?? 0) + amount;
  };

  const addStep = (name: string, amount: number, depth: number): void => {
    const existing = stepsByName.get(name);
    if (existing) {
      existing.quantity += amount;
      // an item needed at two depths has to be crafted before the deeper of
      // its consumers, so the larger depth is the one that orders it
      existing.depth = Math.max(existing.depth, depth);
      return;
    }
    stepsByName.set(name, { depth, name, quantity: amount });
  };

  const expand = (
    name: string,
    want: number,
    depth: number,
    chain: Set<string>
  ): void => {
    if (want <= 0) {
      return;
    }
    // spend what's on hand before making more
    const onHand = Math.min(pool[name] ?? 0, want);
    if (onHand > 0) {
      pool[name] -= onHand;
      spend[name] = (spend[name] ?? 0) + onHand;
    }
    const remaining = want - onHand;
    if (remaining <= 0) {
      return;
    }
    // a perk buys this on demand, so the shortfall is not one the player has
    // to go and solve
    if (isUnlimited(unlimited, name)) {
      return;
    }
    const node = nodes.get(name);
    if (!node) {
      unknown.add(name);
      addMissing(name, remaining);
      return;
    }
    // a recipe that reaches itself would recurse forever; stop and report the
    // rest as raw rather than guessing which way round the cycle goes
    if (chain.has(name)) {
      truncated = true;
      addMissing(name, remaining);
      return;
    }
    if (!node.canCraft || node.ingredients.length === 0 || depth >= MAX_DEPTH) {
      if (depth >= MAX_DEPTH) {
        truncated = true;
      }
      addMissing(name, remaining);
      return;
    }
    addStep(name, remaining, depth);
    const nextChain = new Set(chain).add(name);
    for (const ingredient of node.ingredients) {
      expand(
        ingredient.name,
        ingredient.quantity * remaining,
        depth + 1,
        nextChain
      );
    }
  };

  const root = nodes.get(target);
  if (root && root.canCraft && root.ingredients.length > 0) {
    addStep(root.name, quantity, 0);
    const chain = new Set([target, root.name]);
    for (const ingredient of root.ingredients) {
      expand(ingredient.name, ingredient.quantity * quantity, 1, chain);
    }
  } else if (root) {
    addMissing(root.name, quantity);
  } else {
    unknown.add(target);
    addMissing(target, quantity);
  }

  return {
    missing: Object.entries(missing)
      .map(([name, amount]) => ({ name, quantity: amount }))
      .sort((a, b) => b.quantity - a.quantity),
    spend,
    // deepest first is a valid crafting order: nothing at depth N needs
    // anything produced at a depth shallower than N
    steps: [...stepsByName.values()].sort((a, b) => b.depth - a.depth),
    target,
    quantity,
    truncated,
    unknown: [...unknown],
  };
};

// Largest quantity of `target` the inventory covers outright. Doubling search
// for an upper bound, then a bisect — `planCraft` is pure and cheap once the
// graph is in hand, so this costs no requests.
export const getMaxCraftable = (
  graph: RecipeGraph,
  target: string,
  inventory: Record<string, number>,
  unlimited: UnlimitedItems = NO_UNLIMITED,
  limit = 10_000
): number => {
  const fits = (quantity: number): boolean =>
    planCraft(graph, target, quantity, inventory, unlimited).missing.length ===
    0;
  if (!fits(1)) {
    return 0;
  }
  let low = 1;
  let high = 2;
  while (high <= limit && fits(high)) {
    low = high;
    high *= 2;
  }
  high = Math.min(high, limit);
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (fits(middle)) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return low;
};

export interface DropSource {
  ironDepot: boolean;
  location: string;
  manualFishing: boolean;
  // expected explores (or casts) for one unit — buddy.farm's rate is literally
  // "1 in N attempts", verified: the reciprocals of a location's rates sum to
  // its baseDropRate
  rate: number;
  runecube: boolean;
  seed: boolean;
  type: "explore" | "fishing";
}

// Every place an item drops, best rate first. Entries whose location is null
// (farm and seed yields, which buddy.farm records without a location) are
// skipped — they are not somewhere you can go.
export const getDropSources = (item: Item | undefined): DropSource[] => {
  if (!item) {
    return [];
  }
  const sources: DropSource[] = [];
  for (const entry of item.dropRatesItems ?? []) {
    const rates = entry.dropRates;
    const location = rates?.location;
    if (!location?.name || !entry.rate) {
      continue;
    }
    sources.push({
      ironDepot: rates.ironDepot === true,
      location: location.name,
      manualFishing: rates.manualFishing === true,
      rate: entry.rate,
      runecube: rates.runecube === true,
      seed: rates.seed === true,
      type: location.type === "fishing" ? "fishing" : "explore",
    });
  }
  return sources.sort((a, b) => a.rate - b.rate);
};

// The best rate available without assuming a perk the player may not have,
// falling back to the overall best when every profile needs one.
export const getBaselineSource = (
  sources: DropSource[]
): DropSource | undefined =>
  sources.find((source) => !source.ironDepot && !source.runecube) ?? sources[0];

export interface LocationPlan {
  // expected explores to cover every item below
  hits: number;
  items: { name: string; quantity: number; rate: number }[];
  location: string;
  type: "explore" | "fishing";
}

export interface SourcingPlan {
  locations: LocationPlan[];
  // items with no drop location at all (buyable, quest-only, or unknown)
  unsourced: string[];
}

// Roll a list of missing items up into the places to go get them, so a plan
// that needs eight different raws turns into two or three explore targets with
// a hit count each.
export const planSourcing = (
  graph: RecipeGraph,
  missing: MissingItem[]
): SourcingPlan => {
  const byLocation = new Map<string, LocationPlan>();
  const unsourced: string[] = [];
  for (const entry of missing) {
    const node = graph.nodes.get(entry.name);
    const source = getBaselineSource(getDropSources(node?.item));
    if (!source) {
      unsourced.push(entry.name);
      continue;
    }
    const existing = byLocation.get(source.location) ?? {
      hits: 0,
      items: [],
      location: source.location,
      type: source.type,
    };
    existing.hits += entry.quantity * source.rate;
    existing.items.push({
      name: entry.name,
      quantity: entry.quantity,
      rate: source.rate,
    });
    byLocation.set(source.location, existing);
  }
  return {
    locations: [...byLocation.values()].sort((a, b) => b.hits - a.hits),
    unsourced,
  };
};
