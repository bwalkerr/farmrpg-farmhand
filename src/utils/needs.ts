import {
  getMaxCraftable,
  MissingItem,
  planCraft,
  RecipeGraph,
} from "./craftPlanner";
import { isUnlimited, NO_UNLIMITED, UnlimitedItems } from "./unlimited";
import { MasteryEntry } from "~/api/farmrpg/apis/mastery";

// One demand, whatever raised it.
//
// `focus.ts` and `goals.ts` arrived at this idea twice — derived goals off the
// quest page and Craftworks queue in one, player-declared goals in the other —
// and every consumer since has had to handle both shapes and reconcile two
// progress functions that could disagree about the same item on the same
// screen. This is that one shape.
//
// The part neither model had is `parent`. A need that names another need as its
// parent is part of the same undertaking, not a competing one, and that single
// axis is what lets small goals compose into large ones.

export type NeedSource = "declared" | "quest" | "craftworks" | "mastery";

// `hold` asks whether N are on the shelf. `acquire` asks whether N have ever
// been made, which is what mastery counts — the distinction `goals.ts` learned
// the hard way when 99 Cave Paste read as a finished mastery tier that still
// wanted one more made. It survives here as a field rather than as a second
// code path.
export type NeedMeasure = "hold" | "acquire";

interface NeedBase {
  href?: string;
  id: string;
  label: string;
  // the need this one feeds. Undefined means it stands alone and is the root of
  // its own scope.
  parent?: string;
  source: NeedSource;
}

export interface ItemNeed extends NeedBase {
  item: string;
  kind: "item";
  measure: NeedMeasure;
  quantity: number;
}

// A need with no demand of its own that exists to hold others together: a quest
// wants four items and is not itself an item. Its children share one pool, so
// two of its items that use the same material no longer both claim it.
export interface GroupNeed extends NeedBase {
  kind: "group";
}

export type Need = GroupNeed | ItemNeed;

// Deep enough for any real chain of goals, and a stop for a malformed one.
// Mirrors craftPlanner's MAX_DEPTH for the same reason: a cycle should degrade,
// not hang the page.
export const MAX_NEED_DEPTH = 12;

export interface NeedStatus {
  // more that could be made right now out of what the scope has left
  canMakeNow: number;
  // true when an ancestor's plan already covers this item, so it is a milestone
  // inside that plan rather than another thing to go and get
  coveredByParent: boolean;
  // units already secured toward it
  have: number;
  isReady: boolean;
  missing: MissingItem[];
  need: Need;
  // how many more this need still wants: what a queue or a trip has to produce
  outstanding: number;
  // the undertaking this belongs to, so a surface can filter to one of them
  scopeId: string;
  // 0..1
  ratio: number;
}

export interface ScopeStatus {
  isReady: boolean;
  label: string;
  // what this whole undertaking is still short of, counted once
  missing: MissingItem[];
  needs: NeedStatus[];
  ratio: number;
  rootId: string;
}

export interface ResolvedNeeds {
  // merged across scopes, taking the largest ask rather than the sum
  missing: MissingItem[];
  scopes: ScopeStatus[];
  // flat, one per input need, in input order
  statuses: NeedStatus[];
}

// Walk each need up to the root of its tree. A parent that isn't in the list,
// or a cycle, leaves the need standing as its own root rather than throwing:
// bad data should cost you composition, not the panel.
export const getScopeRoots = (needs: Need[]): Map<string, string> => {
  const byId = new Map(needs.map((need) => [need.id, need]));
  const roots = new Map<string, string>();
  for (const need of needs) {
    let current = need;
    let depth = 0;
    while (current.parent && depth < MAX_NEED_DEPTH) {
      const parent = byId.get(current.parent);
      if (!parent || parent.id === current.id) {
        break;
      }
      current = parent;
      depth += 1;
    }
    roots.set(need.id, current.id);
  }
  return roots;
};

// Depth of a need in its tree, used only to order resolution parents-first.
const getDepth = (need: Need, byId: Map<string, Need>): number => {
  let current = need;
  let depth = 0;
  while (current.parent && depth < MAX_NEED_DEPTH) {
    const parent = byId.get(current.parent);
    if (!parent || parent.id === current.id) {
      break;
    }
    current = parent;
    depth += 1;
  }
  return depth;
};

const toList = (byName: Map<string, number>): MissingItem[] =>
  [...byName.entries()]
    .filter(([, quantity]) => quantity > 0)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);

const READY: Omit<NeedStatus, "need" | "scopeId"> = {
  canMakeNow: 0,
  coveredByParent: false,
  have: 0,
  isReady: true,
  missing: [],
  outstanding: 0,
  ratio: 1,
};

// Cost one item need against a pool, spending what it takes out of that pool.
//
// `spend` is deducted so the next need in the same scope sees a shelf that has
// already been drawn down — the thing that makes a parent and its children add
// up to one shopping list instead of two.
const costAgainstPool = (
  need: ItemNeed,
  graph: RecipeGraph,
  pool: Record<string, number>,
  unlimited: UnlimitedItems,
  mastery: MasteryEntry[]
): Omit<NeedStatus, "need" | "scopeId"> => {
  if (isUnlimited(unlimited, need.item)) {
    return { ...READY };
  }

  if (need.measure === "acquire") {
    // Mastery counts what has been made, never what is held, so nothing comes
    // off the shelf as credit — but the materials to make the remainder do.
    const entry = mastery.find((item) => item.name === need.item);
    const remaining = entry ? entry.remaining : need.quantity;
    const have = entry ? entry.value : 0;
    const required = entry ? entry.required : need.quantity;
    if (remaining <= 0) {
      return { ...READY, have };
    }
    const plan = planCraft(graph, need.item, remaining, pool, unlimited);
    for (const [name, quantity] of Object.entries(plan.spend)) {
      pool[name] = Math.max(0, (pool[name] ?? 0) - quantity);
    }
    return {
      canMakeNow: Math.min(
        remaining,
        getMaxCraftable(graph, need.item, pool, unlimited)
      ),
      coveredByParent: false,
      have,
      isReady: false,
      missing: plan.missing,
      outstanding: remaining,
      ratio: required > 0 ? Math.min(1, have / required) : 0,
    };
  }

  const have = Math.min(need.quantity, pool[need.item] ?? 0);
  const outstanding = need.quantity - have;
  // the finished ones just claimed are no longer raw material for the rest
  pool[need.item] = Math.max(0, (pool[need.item] ?? 0) - have);
  if (outstanding <= 0) {
    return { ...READY, have };
  }

  const node = graph.nodes.get(need.item);
  if (!node?.canCraft || node.ingredients.length === 0) {
    // a raw drop: nothing to plan, you go and get it
    return {
      canMakeNow: 0,
      coveredByParent: false,
      have,
      isReady: false,
      missing: [{ name: need.item, quantity: outstanding }],
      outstanding,
      ratio: have / need.quantity,
    };
  }

  const canMakeNow = Math.min(
    outstanding,
    getMaxCraftable(graph, need.item, pool, unlimited)
  );
  const plan = planCraft(graph, need.item, outstanding, pool, unlimited);
  for (const [name, quantity] of Object.entries(plan.spend)) {
    pool[name] = Math.max(0, (pool[name] ?? 0) - quantity);
  }
  return {
    canMakeNow,
    coveredByParent: false,
    have,
    isReady: false,
    missing: plan.missing,
    outstanding,
    ratio: Math.min(1, (have + canMakeNow) / need.quantity),
  };
};

// Read a child's progress off an ancestor's plan without adding to the bill.
//
// The child names an item the ancestor is already going to need, so it is a
// checkpoint inside that work — "you have 12 of the 20 Glass the Lanterns
// want". Counting it again would inflate the scope's shopping list for exactly
// the materials that matter most.
const costAsMilestone = (
  need: ItemNeed,
  graph: RecipeGraph,
  inventory: Record<string, number>,
  unlimited: UnlimitedItems
): Omit<NeedStatus, "need" | "scopeId"> => {
  if (isUnlimited(unlimited, need.item)) {
    return { ...READY, coveredByParent: true };
  }
  const have = Math.min(need.quantity, inventory[need.item] ?? 0);
  const outstanding = need.quantity - have;
  if (outstanding <= 0) {
    return { ...READY, coveredByParent: true, have };
  }
  const pool = { ...inventory, [need.item]: 0 };
  const canMakeNow = Math.min(
    outstanding,
    getMaxCraftable(graph, need.item, pool, unlimited)
  );
  return {
    canMakeNow,
    coveredByParent: true,
    have,
    isReady: false,
    missing: [],
    outstanding,
    ratio: Math.min(1, (have + canMakeNow) / need.quantity),
  };
};

// True when one of the need's ancestors already plans for this item, which
// makes the need a checkpoint inside that work rather than another trip.
//
// Deliberately ancestors only: two siblings both wanting Stone are two real
// demands on one shelf and have to sum.
const isClaimedByAncestor = (
  need: Need,
  byId: Map<string, Need>,
  claimsByNeed: Map<string, Set<string>>
): boolean => {
  if (need.kind !== "item") {
    return false;
  }
  let current: Need | undefined = need;
  let depth = 0;
  while (current?.parent && depth < MAX_NEED_DEPTH) {
    const parent: Need | undefined = byId.get(current.parent);
    if (!parent || parent.id === current.id) {
      return false;
    }
    if (claimsByNeed.get(parent.id)?.has(need.item)) {
      return true;
    }
    current = parent;
    depth += 1;
  }
  return false;
};

// Work out what every need is short of, once.
//
// Needs in the same scope draw from one pool in parent-first order: they are
// one undertaking, and a material spent on the parent is not still on the shelf
// for the child. Needs in different scopes are alternatives competing for the
// same shelf, so each scope starts from the full inventory — that is the call
// `focus.ts` made deliberately and it stays right for "which of these should I
// do next".
export const resolveNeeds = (
  graph: RecipeGraph,
  needs: Need[],
  inventory: Record<string, number>,
  unlimited: UnlimitedItems = NO_UNLIMITED,
  mastery: MasteryEntry[] = []
): ResolvedNeeds => {
  const byId = new Map(needs.map((need) => [need.id, need]));
  const roots = getScopeRoots(needs);
  const statusById = new Map<string, NeedStatus>();
  const scopes: ScopeStatus[] = [];

  const grouped = new Map<string, Need[]>();
  for (const need of needs) {
    const root = roots.get(need.id) ?? need.id;
    grouped.set(root, [...(grouped.get(root) ?? []), need]);
  }

  for (const [rootId, members] of grouped) {
    const pool: Record<string, number> = { ...inventory };
    const ordered = [...members].sort(
      (a, b) => getDepth(a, byId) - getDepth(b, byId)
    );
    // what each need's own plan accounts for. A need is a milestone only when
    // one of its ANCESTORS already claimed the item -- two siblings both
    // wanting Stone are two real demands and have to sum, which is exactly the
    // shared-pool case, not a duplicate.
    const claimsByNeed = new Map<string, Set<string>>();
    const scopeMissing = new Map<string, number>();
    const ratios: number[] = [];

    for (const need of ordered) {
      if (need.kind === "group") {
        statusById.set(need.id, { ...READY, need, scopeId: rootId });
        continue;
      }
      const status = isClaimedByAncestor(need, byId, claimsByNeed)
        ? costAsMilestone(need, graph, inventory, unlimited)
        : costAgainstPool(need, graph, pool, unlimited, mastery);
      statusById.set(need.id, { ...status, need, scopeId: rootId });

      if (status.coveredByParent) {
        continue;
      }
      // what this need is going to take, so any descendant naming one of those
      // items reads as a checkpoint inside this work rather than another trip
      claimsByNeed.set(
        need.id,
        new Set([need.item, ...status.missing.map((entry) => entry.name)])
      );
      for (const entry of status.missing) {
        scopeMissing.set(
          entry.name,
          (scopeMissing.get(entry.name) ?? 0) + entry.quantity
        );
      }
      ratios.push(status.ratio);
    }

    const root = byId.get(rootId);
    const scopeNeeds = members.map(
      (need) => statusById.get(need.id) as NeedStatus
    );
    const missing = toList(scopeMissing);
    scopes.push({
      isReady: missing.length === 0,
      label: root?.label ?? rootId,
      missing,
      needs: scopeNeeds,
      ratio:
        ratios.length > 0
          ? ratios.reduce((total, value) => total + value, 0) / ratios.length
          : 1,
      rootId,
    });
  }

  // Across scopes the largest ask wins rather than the sum: a request short of
  // 40 Steel and a Craftworks slot stalled on Steel are the same trip, not two.
  const merged = new Map<string, number>();
  for (const scope of scopes) {
    for (const entry of scope.missing) {
      merged.set(
        entry.name,
        Math.max(merged.get(entry.name) ?? 0, entry.quantity)
      );
    }
  }

  return {
    missing: toList(merged),
    scopes,
    statuses: needs.map((need) => statusById.get(need.id) as NeedStatus),
  };
};

export interface NeedBottleneck {
  // labels of the scopes it holds up, for display
  gates: string[];
  // how many separate undertakings it holds up
  gatesCount: number;
  // the worst single scope's shortfall
  maxNeeded: number;
  name: string;
  // shortfall summed across every scope that wants it
  totalNeeded: number;
}

// Rank raw materials by how much of the backlog they unblock. One item gating
// five undertakings beats one gating a single undertaking even when the single
// one needs far more of it.
export const rankNeedBottlenecks = (
  resolved: ResolvedNeeds
): NeedBottleneck[] => {
  const byName = new Map<string, NeedBottleneck>();
  for (const scope of resolved.scopes) {
    for (const entry of scope.missing) {
      const existing = byName.get(entry.name) ?? {
        gates: [],
        gatesCount: 0,
        maxNeeded: 0,
        name: entry.name,
        totalNeeded: 0,
      };
      existing.gatesCount += 1;
      existing.gates.push(scope.label);
      existing.maxNeeded = Math.max(existing.maxNeeded, entry.quantity);
      existing.totalNeeded += entry.quantity;
      byName.set(entry.name, existing);
    }
  }
  return [...byName.values()].sort(
    (a, b) => b.gatesCount - a.gatesCount || b.maxNeeded - a.maxNeeded
  );
};

// Undertakings one item short. A single trip finishes them outright, which
// makes them the highest-leverage thing on the board.
export const getNearlyDoneScopes = (resolved: ResolvedNeeds): ScopeStatus[] =>
  resolved.scopes.filter(
    (scope) => !scope.isReady && scope.missing.length === 1
  );

// What the Craftworks queue should be making, across the whole backlog.
//
// The old queue advice reasoned from tracked goals alone, so a quest wanting
// forty of something never reached it and the fallback asked for ONE of each
// thing a slot happened to be stalled on -- which is how a queue full of
// single units happens. Every need is in here now, at the quantity it actually
// wants, and an item two undertakings both need keeps the deeper of its two
// positions so the order still builds bottom-up.
export const getDesiredQueueForNeeds = (
  graph: RecipeGraph,
  resolved: ResolvedNeeds,
  inventory: Record<string, number>,
  unlimited: UnlimitedItems = NO_UNLIMITED,
  // when set, only this undertaking's needs are costed -- what "work a whole
  // quest at a time" means for the queue
  scopeId?: string
): { name: string; quantity: number }[] => {
  const byName = new Map<string, { depth: number; quantity: number }>();
  for (const status of resolved.statuses) {
    // a milestone is already inside its parent's plan; costing it again would
    // ask the queue for the same materials twice
    if (
      status.need.kind !== "item" ||
      status.isReady ||
      status.coveredByParent ||
      status.outstanding <= 0 ||
      (scopeId !== undefined && status.scopeId !== scopeId)
    ) {
      continue;
    }
    const node = graph.nodes.get(status.need.item);
    if (!node?.canCraft || node.ingredients.length === 0) {
      continue;
    }
    const plan = planCraft(
      graph,
      status.need.item,
      status.outstanding,
      { ...inventory, [status.need.item]: 0 },
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
