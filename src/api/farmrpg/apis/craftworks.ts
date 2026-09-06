import { CachedState, StorageKey } from "~/utils/state";
import { getHTML } from "../utils/requests";
import {
  getMaxSlots,
  parseSavedSets,
  parseSlots,
  SavedSet,
  Slot,
} from "~/utils/craftworks";
import { Page } from "~/utils/page";

export interface CraftworksSnapshot {
  maxSlots?: number;
  // saved sets, by name only — see parseSavedSets for why contents are absent
  sets: SavedSet[];
  slots: Slot[];
  updatedAt: number;
}

// The Craftworks queue, fetched rather than read off the page in view, so the
// home panel can report on it from anywhere.
//
// No `defaultState`, for the same reason as the inventory snapshot: `set()`
// merges over an object default, and a queue whose slots were removed must
// replace the old list outright rather than keep asserting stale slots. A
// parse that finds no slots returns undefined and keeps the last good read.
export const craftworksState = new CachedState<CraftworksSnapshot>(
  StorageKey.CRAFTWORKS,
  async () => {
    const response = await getHTML(Page.CRAFTWORKS, new URLSearchParams());
    const slots = parseSlots(response.body);
    if (slots.length === 0) {
      return;
    }
    return {
      maxSlots: getMaxSlots(response.body),
      sets: parseSavedSets(response.body),
      slots,
      updatedAt: Date.now(),
    };
  },
  {
    timeout: 5 * 60, // 5 minutes
  }
);
