import {
  CachedState,
  StateQueryOptions,
  StorageKey,
} from "../../../utils/state";
import { getDocument } from "../../../utils/requests";
import { getHTML, parseUrl } from "../utils/requests";
import { getListByTitle, Page, WorkerGo } from "../../../utils/page";

export enum PerkActivity {
  DEFAULT = "Default",
  COOKING = "Cooking",
  CRAFTING = "Crafting",
  FISHING = "Fishing",
  EXPLORING = "Exploring",
  FARMING = "Farming",
  SELLING = "Selling",
  FRIENDSHIP = "Friendship",
  TEMPLE = "Temple",
  LOCKSMITH = "Locksmith",
  MINING = "Mining",
  WHEEL = "Wheel",
  VAULT = "Vault",
  // optional shared set for the town-cluster activities (temple / wheel /
  // locksmith / vault); when present it is used in place of their own sets
  TOWN = "Town",
  UNKNOWN = "Unknown",
}

export interface PerkSet {
  name: string;
  id: number;
}

export interface PerksState {
  currentPerkSetId?: number;
  perkSets: PerkSet[];
}

const processPerks = (root: Document): PerksState => {
  const perkSets: PerkSet[] = [];
  const setList = getListByTitle("My Perk Sets", root.body);
  const setWrappers = setList?.querySelectorAll(".item-title") ?? [];
  let currentPerkSetId: number | undefined;
  for (const setWrapper of setWrappers) {
    const link = setWrapper.querySelector<HTMLAnchorElement>("a");
    const name = link?.textContent?.trim() ?? "";
    const id = Number(link?.dataset.id);
    const isActive = setWrapper.querySelector(".fa-check");
    if (isActive) {
      currentPerkSetId = id;
    }
    perkSets.push({ name, id });
  }
  return { perkSets, currentPerkSetId };
};

// The id of the set we last drove the game to via a completed activateperkset
// switch, cleared whenever resetPerks() wipes the slate or the perks page is
// (re)loaded. Unlike the optimistic currentPerkSetId cache (set from the request
// URL the instant a switch is SENT, so it drifts from what's really equipped),
// this is written only AFTER a switch finishes — including its settle wait — so
// it's a trustworthy "these perks are genuinely equipped right now" signal. It
// lets a repeated switch to the already-equipped set skip the whole
// reset+activate+settle round-trip: the common case of quick-selling a stack of
// items one after another, where the reconciler leaves the perks alone between
// item pages, so the set the first sell equipped is still on for the rest. The
// first sell pays the ~1s; the rest are instant, until you navigate to a normal
// page and the reconciler reverts.
let confirmedEquippedSet: PerkSet | undefined;

// The set a switch is currently in flight to, if any — drives the indicator's
// "switching…" state so a switch is visible while it happens (including the
// settle wait) rather than only after it lands.
let pendingPerkSet: PerkSet | undefined;

const perkStatusListeners: (() => void)[] = [];

// Live view of what's equipped, for the stats-bar indicator. `isConfirmed`
// distinguishes a set we drove the game to and watched land from one merely
// read out of the (optimistic, drift-prone) cache — see confirmedEquippedSet.
export interface PerkStatus {
  name?: string;
  isPending: boolean;
  isConfirmed: boolean;
  // A few words about what the perk manager last decided or attempted, shown by
  // the indicator when its debug setting is on. On a phone there is no console
  // to read, so this is the only way to see which page was recognised, which set
  // it called for, and whether the switch actually went through.
  note?: string;
}

let statusNote: string | undefined;

export const setPerkStatusNote = (note: string): void => {
  if (statusNote === note) {
    return;
  }
  statusNote = note;
  notifyPerkStatus();
};

export const onPerkStatusChange = (listener: () => void): void => {
  perkStatusListeners.push(listener);
};

const notifyPerkStatus = (): void => {
  for (const listener of perkStatusListeners) {
    listener();
  }
};

const setConfirmedEquipped = (set: PerkSet | undefined): void => {
  confirmedEquippedSet = set;
  notifyPerkStatus();
};

export const perksState = new CachedState<PerksState>(
  StorageKey.PERKS_SETS,
  async () => {
    const response = await getHTML(Page.PERKS);
    return processPerks(response);
  },
  {
    timeout: 60 * 60 * 24, // 1 day
    defaultState: {
      perkSets: [],
      currentPerkSetId: undefined,
    },
    interceptors: [
      {
        match: [Page.PERKS, new URLSearchParams()],
        callback: async (state, previous, response) => {
          // the perks page is where a set can be manually re-equipped/edited,
          // which our fast-path flag can't see — drop it so the next switch
          // re-verifies instead of trusting a possibly-stale assumption
          setConfirmedEquipped(undefined);
          await state.set(processPerks(await getDocument(response)));
        },
      },
      {
        match: [
          Page.WORKER,
          new URLSearchParams({ go: WorkerGo.ACTIVATE_PERK_SET }),
        ],
        callback: async (state, previous, response) => {
          const [_, query] = parseUrl(response.url);
          await state.set({
            ...previous,
            currentPerkSetId: Number(query.get("id")),
          });
        },
      },
    ],
  }
);

export const getActivityPerksSet = async (
  activity: PerkActivity,
  options?: StateQueryOptions
): Promise<PerkSet | undefined> => {
  const state = await perksState.get(options);
  return state?.perkSets.find(
    ({ name }) => name.toLowerCase() === activity.toLowerCase()
  );
};

export const getCurrentPerkSet = async (
  options?: StateQueryOptions
): Promise<PerkSet | undefined> => {
  const state = await perksState.get(options);
  return state?.perkSets.find(({ id }) => id === state?.currentPerkSetId);
};

// The set we last confirmed genuinely equipped (see confirmedEquippedSet), or
// undefined when unknown. Trustworthy where the currentPerkSetId cache isn't,
// because it's only written after a switch fully completes.
export const getConfirmedEquippedSetId = (): number | undefined =>
  confirmedEquippedSet?.id;

// What to display as the currently equipped set. Prefers the set we confirmed
// ourselves; falls back to the game's own selected-set cache (unconfirmed —
// it's the optimistic one) so the indicator still says something useful before
// this session has driven a switch.
// Read the game's perk sets once if nothing has needed them yet. Until something
// does, there is no set name to show and the indicator can't draw itself — which
// is why it used to appear only after the first switch of a session (a harvest,
// or arriving on an activity page) rather than on the first page load. The state
// is cached for a day and persisted, so this costs one read.
let statusPrimed = false;

export const primePerkStatus = async (): Promise<void> => {
  if (statusPrimed) {
    return;
  }
  statusPrimed = true;
  await perksState.get();
  notifyPerkStatus();
};

export const getPerkStatus = (): PerkStatus => {
  if (pendingPerkSet) {
    return {
      name: pendingPerkSet.name,
      isPending: true,
      isConfirmed: false,
      note: statusNote,
    };
  }
  if (confirmedEquippedSet) {
    return {
      name: confirmedEquippedSet.name,
      isPending: false,
      isConfirmed: true,
      note: statusNote,
    };
  }
  const state = perksState.read();
  const current = state?.perkSets.find(
    ({ id }) => id === state?.currentPerkSetId
  );
  return {
    name: current?.name,
    isPending: false,
    isConfirmed: false,
    note: statusNote,
  };
};

export const isActivePerkSet = async (
  set: PerkSet,
  options?: StateQueryOptions
): Promise<boolean> => {
  const current = await getCurrentPerkSet(options);
  return Boolean(current && current.id === set.id);
};

// Perk switches are serialized through this chain. Activating a set is an
// async server round-trip, and two switches overlapping — e.g. a quick-sell
// and a quick-craft fired on the same page within a few hundred ms — would
// race and leave a set selected but only partially applied. Chaining runs them
// one at a time, in call order, so each finishes before the next begins.
let perkSwitchChain: Promise<unknown> = Promise.resolve();

// The game acknowledges activateperkset (responds "success") BEFORE it has
// finished equipping the set's perks, so an action fired immediately after —
// the quick-sell/craft/give click — can run under the OLD perks: a 50-silver
// item sold for 55 (+10% gold perk only) right after activating the selling
// set, vs the full 80 (+60%) once it settled. On the FORCED paths (the caller
// is about to act on these perks) we wait this long after the switch for the
// game to apply them. Unforced switches (the reconciler's revert to Default,
// withFarmingPerks) don't act on the perks immediately and stay fast.
const PERK_SETTLE_MS = 1000;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Clear every equipped perk before loading a set (upstream behaviour). Loading
// from an EMPTY slate is what makes the game equip a set fully; switching
// set-to-set without it leaves the game diffing off the previous full set and
// dropping/lagging perks. Default ON — see the `reset` option for the one
// exception.
const resetPerks = async (): Promise<void> => {
  const state = await perksState.get();
  await getHTML(Page.WORKER, new URLSearchParams({ go: WorkerGo.RESET_PERKS }));
  // perks are now cleared, so nothing is confirmed-equipped anymore
  setConfirmedEquipped(undefined);
  await perksState.set({
    perkSets: state?.perkSets ?? [],
    currentPerkSetId: undefined,
  });
};

// Options for a perk switch:
// - `force`: skip the no-op guard and always re-issue. The guard trusts a
//   cached active-set id updated optimistically from the request URL, so it can
//   drift from the game's real equipped perks; when it does, the guard skips the
//   switch and the caller proceeds under the WRONG perks. Quick-sell/craft/give
//   force so the switch always reaches the server.
// - `settle`: wait PERK_SETTLE_MS after the switch for the game to actually
//   equip the perks (it acks before the equip finishes). Needed before a caller
//   acts on the perks (quick actions) and on the reconciler's own switches.
// - `reset` (default TRUE): resetPerks() before the switch. Keep it on for
//   everything EXCEPT the quick-actions: they sell/craft/give the instant after
//   the switch, and the reset's clear can still be settling then, leaving perks
//   EMPTY (50-silver item -> 55). Nothing else reads the perks immediately, so
//   the clean-slate reset only helps them equip fully.
export interface ActivatePerkSetOptions {
  force?: boolean;
  settle?: boolean;
  reset?: boolean;
}

// Resolves to whether an actual switch was performed — false when it no-op'd
// because the set was already equipped (fast path or guard). Callers use this
// to only show a "…perks activated" banner when perks really changed, instead
// of on every revisit to e.g. a town building that's already on the Town set.
export const activatePerkSet = (
  set: PerkSet,
  { force = false, settle = false, reset = true }: ActivatePerkSetOptions = {}
): Promise<boolean> => {
  const task = perkSwitchChain.then(async () => {
    // We already drove the game to this exact set and nothing has reset the
    // slate since, so it's genuinely equipped — skip the whole round-trip
    // (reset + activate + settle). This is the trustworthy fast path: unlike
    // the optimistic isActivePerkSet cache below, confirmedEquippedSet is
    // only set after a switch fully completes, so even forced callers (the
    // quick actions, which distrust that cache) can safely short-circuit here.
    // It's what makes back-to-back quick-sells after the first one instant.
    // Returning before the pending flag is raised also keeps the indicator
    // still: a no-op switch shouldn't flicker "switching…".
    if (confirmedEquippedSet?.id === set.id) {
      return false;
    }
    if (!force && (await isActivePerkSet(set))) {
      return false;
    }
    console.debug(`Activating ${set.name} Perks`);
    // eslint-disable-next-line require-atomic-updates
    pendingPerkSet = set;
    notifyPerkStatus();
    try {
      if (reset) {
        await resetPerks();
      }
      await getHTML(
        Page.WORKER,
        new URLSearchParams({
          go: WorkerGo.ACTIVATE_PERK_SET,
          id: set.id.toString(),
        })
      );
      if (settle) {
        await delay(PERK_SETTLE_MS);
      }
    } finally {
      // cleared (and announced) even if the switch throws, so a failed switch
      // can't leave the indicator stuck on "switching…"
      // eslint-disable-next-line require-atomic-updates
      pendingPerkSet = undefined;
      notifyPerkStatus();
    }
    // record that this set is now genuinely equipped so the next switch to it
    // can take the fast path above. Safe despite the awaits: every write runs
    // inside perkSwitchChain, which serializes switches, so there's no
    // concurrent reassignment to race with.
    setConfirmedEquipped(set);
    return true;
  });
  perkSwitchChain = task.catch(() => {
    // swallow: a failed switch must not break the chain for the next one
  });
  return task;
};
