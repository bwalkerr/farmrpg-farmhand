import { CachedState, StorageKey } from "~/utils/state";
import { getHTML, toUrl } from "../utils/requests";
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

// worker.php answers these with a bare word ("success", "cannotadd"), not JSON
// or HTML, so this goes through fetch directly. It still passes through the
// patched window.fetch, so the usual interceptors observe it.
const postWorker = async (query: URLSearchParams): Promise<string> => {
  const response = await fetch(toUrl(Page.WORKER, query), {
    credentials: "include",
    method: "POST",
    mode: "cors",
  });
  const text = await response.text();
  return text.trim();
};

export interface ActivationResult {
  // the queue as it was before, so a failure can be undone
  previous: Slot[];
  message: string;
  ok: boolean;
}

// Load a saved set from anywhere, the way the perk manager loads a perk set.
//
// The game's own button fires `removeallcw` fire-and-forget, waits a fixed
// 500ms, then activates — so a failed activation leaves the queue wiped with
// nothing to restore it. This awaits the wipe, refuses to continue if it did
// not come back, and hands the caller the previous queue either way so a
// failure can be walked back. That is why it is worth reimplementing here
// rather than forwarding a click: the copy is strictly safer than the original.
export const activateSet = async (
  setId: string,
  previous: Slot[]
): Promise<ActivationResult> => {
  try {
    await postWorker(new URLSearchParams({ go: "removeallcw" }));
  } catch {
    // nothing was wiped, so nothing is lost
    return {
      message: "Could not clear the queue; nothing was changed.",
      ok: false,
      previous,
    };
  }
  try {
    const result = await postWorker(
      new URLSearchParams({ go: "activatecwset", id: setId })
    );
    if (result !== "success") {
      return {
        message: `The queue was cleared but the set did not load (${
          result || "no response"
        }).`,
        ok: false,
        previous,
      };
    }
  } catch {
    return {
      message: "The queue was cleared but the set did not load.",
      ok: false,
      previous,
    };
  }
  await craftworksState.get({ ignoreCache: true });
  return { message: "Set loaded.", ok: true, previous };
};

// Put a queue back, in order. Appending each item to the bottom reproduces the
// original order without needing the reorder endpoint.
export const restoreQueue = async (slots: Slot[]): Promise<number> => {
  let restored = 0;
  for (const slot of slots) {
    if (!slot.id) {
      continue;
    }
    try {
      const result = await postWorker(
        new URLSearchParams({ go: "addcwitem", id: slot.id, pos: "bot" })
      );
      if (result === "success") {
        restored += 1;
      }
    } catch {
      break;
    }
  }
  await craftworksState.get({ ignoreCache: true });
  return restored;
};
