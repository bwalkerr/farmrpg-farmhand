import { isUnlimited, NO_UNLIMITED, UnlimitedItems } from "./unlimited";

// Reading the Craftworks queue and reasoning about it, kept free of rendering
// and of any import that needs a browser so it can be unit-tested directly.
//
// The queue crafts top-down and only when every ingredient is in stock, so the
// two things that quietly waste a slot are an item sitting at the inventory cap
// (it can never craft) and a producer placed below the slot that consumes it.

// "You can add up to <strong>8</strong> items total to the Craftworks."
const MAX_SLOTS_PATTERN =
  /add up to\s*(?:<strong>)?\s*(\d+)\s*(?:<\/strong>)?\s*items total/i;

export interface Slot {
  // the game paints the inventory count red when the item has hit the cap
  isCapRed: boolean;
  isPaused: boolean;
  // items the slot is currently short of, as the game reports them
  blockedOn: { id: string; name: string }[];
  id: string;
  inventory: number;
  name: string;
  position: number;
}

export const parseSlots = (root: HTMLElement): Slot[] => {
  const slots: Slot[] = [];
  const rows = root.querySelectorAll<HTMLLIElement>(
    ".cwitems li[data-name], li.close-panel[data-name]"
  );
  for (const [index, row] of [...rows].entries()) {
    const name = row.dataset.name?.trim();
    if (!name) {
      continue;
    }
    const status = row.querySelector<HTMLElement>(
      ".item-title .disable-select"
    );
    const statusText = status?.textContent ?? "";
    const inventoryMatch = /Inventory:\s*([\d,]+)/.exec(statusText);
    const positionText = row
      .querySelector<HTMLElement>(".item-media span")
      ?.textContent?.trim();
    const blockedOn: { id: string; name: string }[] = [];
    // the "Out of:" list is the game telling us exactly what stalled the slot,
    // which is far more reliable than re-deriving it from the recipe
    if (/out of:/i.test(statusText)) {
      for (const link of status?.querySelectorAll<HTMLAnchorElement>("a") ??
        []) {
        const blockerName = link.textContent?.trim();
        if (!blockerName) {
          continue;
        }
        blockedOn.push({
          id: /id=(\d+)/.exec(link.getAttribute("href") ?? "")?.[1] ?? "",
          name: blockerName,
        });
      }
    }
    slots.push({
      blockedOn,
      id: row.dataset.id ?? "",
      inventory: Number(inventoryMatch?.[1]?.replaceAll(",", "") ?? "0"),
      // red is the game's own "you are at the cap" marker on this row
      isCapRed: /color:\s*red/i.test(status?.getAttribute("style") ?? ""),
      isPaused:
        row.querySelector(".playcwbtn") !== null ||
        /\(paused\)/i.test(row.textContent ?? ""),
      name,
      position: Number(positionText) || index + 1,
    });
  }
  return slots;
};

// "items total" is load-bearing: the Upgrade Craftworks card further down the
// same page says "You can add up to 6 items to the Craftworks (Excluding
// Patreon extra slots)", which is the base allowance, not the real cap. Only
// the top card says "items total", and that is the number that matters.
export const parseMaxSlots = (text: string): number | undefined => {
  const match = MAX_SLOTS_PATTERN.exec(text);
  return match ? Number(match[1]) : undefined;
};

export const getMaxSlots = (root: HTMLElement): number | undefined =>
  parseMaxSlots(root.textContent ?? "");

export interface Blocker {
  name: string;
  // the queue slot that makes this, if one does
  producer?: Slot;
  // slots stalled waiting for it
  slots: Slot[];
}

export interface Advice {
  blockers: Map<string, Blocker>;
  dead: Slot[];
  ordering: { blocker: string; producer: Slot; slot: Slot }[];
  paused: Slot[];
  // blockers nothing in the queue produces — the only ones worth going out for
  roots: Blocker[];
  // blockers a perk buys on demand, so they resolve themselves
  supplied: Blocker[];
  // blockers an earlier slot already makes, so they clear on their own
  upstream: Blocker[];
  working: Slot[];
}

// Read the queue and work out which slots are actually producing, which are
// stalled and on what, and which are stalled on something a *lower* slot makes
// (the queue runs top-down, so a producer below its consumer never unblocks it).
//
// Blockers are then split in two, because they call for opposite responses: one
// an earlier slot already produces will clear itself once that slot runs, while
// one nothing in the queue makes is the actual reason the queue is stalled and
// the only kind worth spending explores on.
export const adviseOnSlots = (
  slots: Slot[],
  cap?: number,
  unlimited: UnlimitedItems = NO_UNLIMITED
): Advice => {
  const positionByName = new Map(slots.map((slot) => [slot.name, slot]));
  const advice: Advice = {
    blockers: new Map(),
    dead: [],
    ordering: [],
    paused: [],
    roots: [],
    supplied: [],
    upstream: [],
    working: [],
  };
  for (const slot of slots) {
    const isAtCap = cap ? slot.inventory >= cap : slot.isCapRed;
    if (isAtCap) {
      advice.dead.push(slot);
      continue;
    }
    if (slot.isPaused) {
      advice.paused.push(slot);
      continue;
    }
    if (slot.blockedOn.length === 0) {
      advice.working.push(slot);
      continue;
    }
    for (const blocker of slot.blockedOn) {
      const producer = positionByName.get(blocker.name);
      const existing = advice.blockers.get(blocker.name) ?? {
        name: blocker.name,
        producer,
        slots: [],
      };
      existing.slots.push(slot);
      advice.blockers.set(blocker.name, existing);
      if (producer && producer.position > slot.position) {
        advice.ordering.push({ blocker: blocker.name, producer, slot });
      }
    }
  }
  for (const blocker of advice.blockers.values()) {
    // a producer that is itself dead (at cap) or paused will not actually
    // deliver, so its consumers are still stalled on something real
    const isLive =
      blocker.producer &&
      !advice.dead.includes(blocker.producer) &&
      !advice.paused.includes(blocker.producer);
    if (isLive) {
      advice.upstream.push(blocker);
    } else if (isUnlimited(unlimited, blocker.name)) {
      // a perk buys this on demand, so it is not something to go and get
      advice.supplied.push(blocker);
    } else {
      advice.roots.push(blocker);
    }
  }
  return advice;
};

export interface QueueEntry {
  name: string;
  position: number;
  // how many the plan needs, which is why it earns a slot
  quantity: number;
}

export interface QueueProposal {
  dropped: { name: string; reason: string }[];
  entries: QueueEntry[];
  // true when the target itself didn't fit in the slots available
  targetOmitted: boolean;
}

// Turn a craft plan into an ordered Craftworks queue.
//
// `plan.steps` already comes out deepest-first, which is exactly the order the
// queue needs: every producer sits above the slot that consumes it, so one pass
// down the queue carries the chain as far as the materials allow. Anything
// already at the inventory cap is left out — it would occupy a slot and never
// craft — and if there are more steps than slots the shallow end is dropped,
// because the deep items are the ones that unblock everything above them.
export const planCraftworksQueue = (
  plan: { steps: { name: string; quantity: number }[]; target: string },
  inventory: Record<string, number>,
  cap: number | undefined,
  maxSlots: number,
  unlimited: UnlimitedItems = NO_UNLIMITED
): QueueProposal => {
  const dropped: { name: string; reason: string }[] = [];
  const eligible: { name: string; quantity: number }[] = [];
  for (const step of plan.steps) {
    if (isUnlimited(unlimited, step.name)) {
      continue;
    }
    if (cap !== undefined && (inventory[step.name] ?? 0) >= cap) {
      dropped.push({ name: step.name, reason: "already at cap" });
      continue;
    }
    eligible.push({ name: step.name, quantity: step.quantity });
  }
  const kept = eligible.slice(0, Math.max(0, maxSlots));
  for (const step of eligible.slice(Math.max(0, maxSlots))) {
    dropped.push({ name: step.name, reason: "no free slot" });
  }
  return {
    dropped,
    entries: kept.map((step, index) => ({
      name: step.name,
      position: index + 1,
      quantity: step.quantity,
    })),
    targetOmitted: !kept.some((step) => step.name === plan.target),
  };
};

export interface QueueSuggestion {
  action: "add" | "drop";
  name: string;
  // where in the proposed order an addition belongs, 1-based
  position?: number;
  reason: string;
}

// What to change about the queue to serve a set of goals.
//
// `desired` arrives deepest-first, which is the order the queue wants, so
// additions keep that order and land above whatever consumes them. Slots
// sitting at the cap are proposed for removal first, since freeing one is what
// makes room for an addition — a queue that is nominally full is usually not.
export const suggestQueueChanges = (
  desired: { name: string; quantity: number }[],
  slots: Slot[],
  inventory: Record<string, number>,
  cap: number | undefined,
  maxSlots: number,
  unlimited: UnlimitedItems = NO_UNLIMITED
): QueueSuggestion[] => {
  const queued = new Set(slots.map((slot) => slot.name));
  const suggestions: QueueSuggestion[] = [];
  const dead = slots.filter(
    (slot) => cap !== undefined && slot.inventory >= cap
  );
  for (const slot of dead) {
    suggestions.push({
      action: "drop",
      name: slot.name,
      reason: "at cap, so the slot never crafts",
    });
  }
  const room = Math.max(0, maxSlots - slots.length) + dead.length;
  if (room === 0) {
    return suggestions;
  }
  const additions = desired.filter(
    (entry) =>
      !queued.has(entry.name) &&
      !isUnlimited(unlimited, entry.name) &&
      !(cap !== undefined && (inventory[entry.name] ?? 0) >= cap)
  );
  for (const [index, entry] of additions.slice(0, room).entries()) {
    suggestions.push({
      action: "add",
      name: entry.name,
      position: index + 1,
      reason: `${entry.quantity.toLocaleString()} needed`,
    });
  }
  return suggestions;
};

export interface SavedSet {
  id: string;
  isActive: boolean;
  name: string;
}

// The saved Craftworks sets listed under "My Item Sets".
//
// Only names, ids and which one is active are readable. Each row does carry a
// `data-items` attribute, but it holds the *current* queue rather than that
// set's contents — identical across every row — and it sits inside an HTML
// comment. Reading a set's real contents would mean activating it, which
// overwrites the live queue, so everything here works from the name alone.
export const parseSavedSets = (root: HTMLElement): SavedSet[] => {
  const sets: SavedSet[] = [];
  for (const link of root.querySelectorAll<HTMLAnchorElement>(
    "a.activatecwsetbtn[data-id]"
  )) {
    const name = link.textContent?.trim();
    const { id } = link.dataset;
    if (!name || !id || sets.some((set) => set.id === id)) {
      continue;
    }
    const title = link.closest(".item-title");
    sets.push({
      id,
      // the game paints the active set teal and prefixes a check icon
      isActive:
        /color:\s*teal/i.test(title?.getAttribute("style") ?? "") ||
        link.querySelector(".fa-check") !== null,
      name,
    });
  }
  return sets;
};
