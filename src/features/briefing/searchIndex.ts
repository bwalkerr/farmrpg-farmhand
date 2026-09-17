// The search vocabulary and ranking, with no dependencies, so it can be
// tested outside the game.

export type SearchKind =
  | "item"
  | "quest"
  | "questline"
  | "townsfolk"
  | "location"
  | "page";

export interface SearchEntry {
  // buddy.farm's href, e.g. /i/iron/ -- the slug in it is what the lookups
  // fetch by
  href: string;
  image: string;
  kind: SearchKind;
  name: string;
  searchText: string;
}

export const KIND_LABEL: Record<SearchKind, string> = {
  item: "item",
  location: "location",
  page: "page",
  quest: "quest",
  questline: "questline",
  townsfolk: "townsfolk",
};

// what a typed prefix filters to: "q:iron" for quests only
const KIND_PREFIX: Record<string, SearchKind> = {
  i: "item",
  l: "location",
  q: "quest",
  t: "townsfolk",
};

const MAX_RESULTS = 10;

export const kindOfHref = (href: string): SearchKind | undefined => {
  if (href.startsWith("/i/")) {
    return "item";
  }
  if (href.startsWith("/q/")) {
    return "quest";
  }
  if (href.startsWith("/ql/")) {
    return "questline";
  }
  if (href.startsWith("/t/")) {
    return "townsfolk";
  }
  if (href.startsWith("/l/")) {
    return "location";
  }
  return undefined;
};

// Ranked: exact name, then name prefix, then word prefix, then substring.
// Items before quests at equal rank, since that is what is searched for most.
const KIND_ORDER: Record<SearchKind, number> = {
  item: 0,
  location: 1,
  townsfolk: 2,
  quest: 3,
  questline: 4,
  page: 5,
};

export const searchEntries = (
  entries: readonly SearchEntry[],
  rawQuery: string
): SearchEntry[] => {
  let query = rawQuery.trim().toLowerCase();
  let onlyKind: SearchKind | undefined;
  const prefix = /^([a-z]):\s*(.*)$/.exec(query);
  if (prefix && KIND_PREFIX[prefix[1]]) {
    onlyKind = KIND_PREFIX[prefix[1]];
    query = prefix[2];
  }
  if (query.length === 0) {
    return [];
  }
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    if (onlyKind && entry.kind !== onlyKind) {
      continue;
    }
    const name = entry.name.toLowerCase();
    let score: number | undefined;
    if (name === query) {
      score = 0;
    } else if (name.startsWith(query)) {
      score = 1;
    } else if (name.includes(` ${query}`)) {
      score = 2;
    } else if (name.includes(query)) {
      score = 3;
    } else if (entry.searchText.includes(query)) {
      score = 4;
    }
    if (score !== undefined) {
      // within a tier the shortest name wins -- "Beatrix" over "Beach Ball"
      // for "bea" -- and the kind only breaks the remaining ties
      scored.push({
        entry,
        score: score * 1000 + name.length * 10 + KIND_ORDER[entry.kind],
      });
    }
  }
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => entry);
};

export const slugOf = (entry: SearchEntry): string =>
  entry.href.split("/").filter(Boolean).pop() ?? "";
