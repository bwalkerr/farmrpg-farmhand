import { CachedState, StorageKey } from "~/utils/state";
import { getHTML } from "../utils/requests";
import { Page } from "~/utils/page";

export interface MasteryEntry {
  // in-game item id, so the row can link to the item
  id?: number;
  name: string;
  // units still needed to reach the next tier
  remaining: number;
  // units required for the current tier
  required: number;
  // tier key as the page marks it, t0 (10) through t5 (1,000,000)
  tier: string;
  // units accumulated so far
  value: number;
}

export interface MasterySnapshot {
  entries: MasteryEntry[];
  updatedAt: number;
}

// Pull the in-progress mastery rows out of the mastery page.
//
// Every row lives in one list under "Mastery In-Progress", grouped by collapsed
// tier headings — the collapsed tiers carry `style="display:none"`, so matching
// on the class alone (rather than anything about visibility) is what gets all
// of them rather than only the expanded ones.
export const parseMasteryPage = (root: HTMLElement): MasteryEntry[] => {
  const entries: MasteryEntry[] = [];
  for (const row of root.querySelectorAll<HTMLLIElement>(
    "li[class*='tier-t']"
  )) {
    const name = row.querySelector(".item-title strong")?.textContent?.trim();
    if (!name) {
      continue;
    }
    const progress = /([\d,]+)\s*\/\s*([\d,]+)\s*progress/i.exec(
      row.querySelector(".item-title")?.textContent ?? ""
    );
    if (!progress) {
      continue;
    }
    const value = Number(progress[1].replaceAll(",", ""));
    const required = Number(progress[2].replaceAll(",", ""));
    if (Number.isNaN(value) || Number.isNaN(required) || required <= 0) {
      continue;
    }
    const id = /id=(\d+)/.exec(
      row.querySelector("a")?.getAttribute("href") ?? ""
    )?.[1];
    entries.push({
      id: id ? Number(id) : undefined,
      name,
      remaining: Math.max(0, required - value),
      required,
      tier:
        [...row.classList]
          .find((token) => token.startsWith("tier-"))
          ?.slice(5) ?? "",
      value,
    });
  }
  return entries;
};

// No `defaultState`, matching the other snapshots: a fresh read must replace
// the previous list outright rather than merge over it, and a parse that finds
// nothing keeps the last good read instead of asserting an empty one.
export const masteryState = new CachedState<MasterySnapshot>(
  StorageKey.MASTERY,
  async () => {
    const response = await getHTML(Page.MASTERY, new URLSearchParams());
    const entries = parseMasteryPage(response.body);
    if (entries.length === 0) {
      return;
    }
    return { entries, updatedAt: Date.now() };
  },
  {
    timeout: 30 * 60, // 30 minutes
  }
);
