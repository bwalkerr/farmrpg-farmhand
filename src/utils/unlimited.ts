// Items the player can always get on demand — the Farm Supply perks auto-buy
// Iron and Nails, so being "short" of them is not a real shortfall and no
// amount of exploring is the answer. Treating them as satisfied keeps them out
// of missing lists, out of location roll-ups, and out of queue suggestions.
export type UnlimitedItems = ReadonlySet<string>;

export const NO_UNLIMITED: UnlimitedItems = new Set<string>();

// Names are compared case-insensitively so a typed setting like "iron, nails"
// still matches the game's "Iron" and "Nails".
export const parseUnlimitedItems = (value: string): UnlimitedItems =>
  new Set(
    value
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );

export const isUnlimited = (unlimited: UnlimitedItems, name: string): boolean =>
  unlimited.has(name.trim().toLowerCase());
