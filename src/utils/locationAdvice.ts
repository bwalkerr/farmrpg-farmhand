import { LocationDrop } from "~/api/buddyfarm/api";
import { MasteryEntry } from "~/api/farmrpg/apis/mastery";
import { MissingItem } from "./craftPlanner";

export interface NeededHere {
  id: number;
  name: string;
  // expected attempts for one unit
  rate: number;
  // how many the plans call for
  quantity: number;
  // expected attempts to cover the whole shortfall
  attempts: number;
  // what is waiting on it, for display
  reasons: string[];
}

export interface WastedHere {
  count: number;
  id: number;
  // mastery still owed on it, when mastery is in progress and therefore frozen
  masteryRemaining?: number;
  masteryRequired?: number;
  masteryValue?: number;
  name: string;
}

export interface LocationAdvice {
  needed: NeededHere[];
  wasted: WastedHere[];
}

// What this location is worth to you right now.
//
// Two halves that the game never puts together. `needed` is the intersection of
// what drops here with what your plans are short of, so a location is judged by
// your backlog rather than by its raw table. `wasted` is the opposite and the
// more useful half: items you are already at the cap on that drop here, whose
// every drop is discarded — and where mastery is still in progress, that is
// also mastery progress being thrown away, since mastery counts acquisition.
export const getLocationAdvice = (
  drops: LocationDrop[],
  missing: MissingItem[],
  reasonsByItem: Map<string, string[]>,
  inventory: Record<string, number>,
  cap: number | undefined,
  mastery: MasteryEntry[]
): LocationAdvice => {
  const dropByName = new Map(drops.map((drop) => [drop.name, drop]));
  const needed: NeededHere[] = [];
  for (const entry of missing) {
    const drop = dropByName.get(entry.name);
    if (!drop) {
      continue;
    }
    needed.push({
      attempts: entry.quantity * drop.rate,
      id: drop.id,
      name: entry.name,
      quantity: entry.quantity,
      rate: drop.rate,
      reasons: reasonsByItem.get(entry.name) ?? [],
    });
  }
  // cheapest to finish first: this is a list of what to do while standing here
  needed.sort((a, b) => a.attempts - b.attempts);

  const wasted: WastedHere[] = [];
  if (cap !== undefined) {
    const masteryByName = new Map(
      mastery.map((entry) => [entry.name, entry] as const)
    );
    for (const drop of drops) {
      const count = inventory[drop.name] ?? 0;
      if (count < cap) {
        continue;
      }
      const progress = masteryByName.get(drop.name);
      wasted.push({
        count,
        id: drop.id,
        masteryRemaining:
          progress && progress.remaining > 0 ? progress.remaining : undefined,
        masteryRequired: progress?.required,
        masteryValue: progress?.value,
        name: drop.name,
      });
    }
    // the ones with mastery still owed are the expensive mistakes
    wasted.sort(
      (a, b) =>
        Number(b.masteryRemaining !== undefined) -
          Number(a.masteryRemaining !== undefined) ||
        (a.masteryRemaining ?? 0) - (b.masteryRemaining ?? 0)
    );
  }
  return { needed, wasted };
};

// Find the saved set that belongs to this location.
//
// Players name these loosely — "Explore - Mount Banon", "Misty Forest",
// "explore - highland hills" — so the location name appearing anywhere in the
// set name is the signal.
//
// Containment alone is not enough, though: "Misty Forest" contains "Forest", so
// standing in Forest would claim the Misty Forest set, and a word-boundary test
// does not help because it genuinely contains that word. A set therefore belongs
// to the *most specific* location it names — the longest of every known location
// name found in it — which gives "Misty Forest" to Misty Forest and leaves
// Forest with nothing.
export const findLocationSet = <T extends { isActive: boolean; name: string }>(
  locationName: string,
  sets: T[],
  allLocationNames: Iterable<string>
): T | undefined => {
  const needle = locationName.trim().toLowerCase();
  if (!needle) {
    return undefined;
  }
  const names = [...allLocationNames].map((name) => name.toLowerCase());
  const matches = sets.filter((set) => {
    const label = set.name.trim().toLowerCase();
    if (!label.includes(needle)) {
      return false;
    }
    const mostSpecific = names
      .filter((name) => label.includes(name))
      .sort((a, b) => b.length - a.length)[0];
    return mostSpecific === needle;
  });
  if (matches.length === 0) {
    return undefined;
  }
  // an already-loaded match is the answer regardless of length: there is
  // nothing to suggest changing
  return (
    matches.find((set) => set.isActive) ??
    matches.sort((a, b) => b.name.length - a.name.length)[0]
  );
};

// Match a page title against the known location names. Exact first, then a
// containment test, because the navbar sometimes decorates the name.
export const matchLocationName = (
  title: string,
  locationNames: Iterable<string>
): string | undefined => {
  const cleaned = title.trim().toLowerCase();
  if (!cleaned) {
    return undefined;
  }
  const names = [...locationNames];
  const exact = names.find((name) => name.toLowerCase() === cleaned);
  if (exact) {
    return exact;
  }
  // longest wins, so "Gary's Crushroom Expanded" is not shadowed by "Gary's
  // Crushroom"
  return names
    .filter((name) => cleaned.includes(name.toLowerCase()))
    .sort((a, b) => b.length - a.length)[0];
};

export const imageBasename = (source: string): string =>
  source.split("/").pop()?.split("?")[0].toLowerCase() ?? "";

// Identify a location from the picture at the top of its page.
//
// The explore page prints no name anywhere in its body — the header image is
// the only identifier — and buddy.farm's search index already carries an image
// per location, so this costs nothing extra. A basename shared by more than one
// location (pond.png belongs to both Small Pond and Farm Pond) is treated as
// unknown rather than guessed at.
export const matchLocationByImage = (
  source: string,
  locations: { image: string; name: string }[]
): string | undefined => {
  const needle = imageBasename(source);
  if (!needle) {
    return undefined;
  }
  const matches = locations.filter(
    (location) => imageBasename(location.image) === needle
  );
  return matches.length === 1 ? matches[0].name : undefined;
};

// "23,034 / 85 Stamina" -> 23034.
//
// The left figure is the stamina actually banked, which runs far above the
// right one because consumables stack past it; the right is only the natural
// maximum. So the left is the number that says how much exploring is affordable
// right now, and the right is ignored.
export const parseStamina = (text: string): number | undefined => {
  const match = /([\d,]+)\s*\/\s*[\d,]+\s*stamina/i.exec(text);
  if (!match) {
    return undefined;
  }
  const value = Number(match[1].replaceAll(",", ""));
  return Number.isNaN(value) ? undefined : value;
};
