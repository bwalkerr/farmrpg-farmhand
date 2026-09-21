import {
  CachedState,
  StateQueryOptions,
  StorageKey,
} from "../../../utils/state";
import { getDocument } from "../../../utils/requests";
import {
  getHashPage,
  getListByTitle,
  getPage,
  Page,
  WorkerGo,
} from "../../../utils/page";
import { getHTML, parseUrl } from "../utils/requests";

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

// ---------------------------------------------------------------------------
// What we believe is equipped
// ---------------------------------------------------------------------------

// The set we last drove the game to with a switch that finished AND was
// acknowledged, cleared whenever the slate is wiped (every switch starts with
// resetperks) or a real visit to the perks page could have changed things
// behind our back.
//
// This is the only "what is equipped" signal anything switches on. The other
// one -- `currentPerkSetId` in the state below -- is written optimistically
// from the request URL the instant a switch is SENT, so it drifts from reality
// and every caller had to remember to pass `force` to get past it. Forgetting
// that flag was its own bug twice (1.1.54). It is display-only now.
let confirmedEquippedSet: PerkSet | undefined;

// The set a switch is currently in flight to, if any -- drives the indicator's
// "switching…" state so a switch is visible while it happens (including the
// settle wait) rather than only after it lands.
let pendingPerkSet: PerkSet | undefined;

const perkStatusListeners: (() => void)[] = [];

// Live view of what's equipped, for the stats-bar indicator. `isConfirmed`
// distinguishes a set we drove the game to and watched land from one merely
// read out of the (optimistic, drift-prone) cache -- see confirmedEquippedSet.
export interface PerkStatus {
  name?: string;
  isPending: boolean;
  isConfirmed: boolean;
  // A few words about what the perk manager last decided or attempted, shown by
  // the indicator and by the panel's perk chip. On a phone there is no console
  // to read, so this is the only way to see which page was recognised, which set
  // it called for, and whether the switch actually went through.
  note?: string;
}

let statusNote: string | undefined;

// Every decision and every round-trip, newest last, so the panel can show what
// actually happened instead of only the last line of it. The perk bugs in this
// fork have all been ORDERING bugs -- who switched, when, and what ran in
// between -- and a single note can't show an order. Timestamps make a race
// visible: a reconcile landing between a harvest's switch and the harvest is
// two entries a second apart.
export interface PerkLogEntry {
  at: number;
  text: string;
}

const PERK_LOG_LIMIT = 24;
const perkLog: PerkLogEntry[] = [];

export const getPerkLog = (): readonly PerkLogEntry[] => perkLog;

const logPerk = (text: string): void => {
  perkLog.push({ at: Date.now(), text });
  if (perkLog.length > PERK_LOG_LIMIT) {
    perkLog.shift();
  }
  console.debug(`[PERKS] ${text}`);
  notifyPerkStatus();
};

export const setPerkStatusNote = (note: string): void => {
  if (statusNote === note) {
    return;
  }
  statusNote = note;
  logPerk(note);
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

// A perk change that did not come from this module (the game's own buttons,
// see the worker interceptors below): whatever we had confirmed is no longer
// known to be on.
const noteOutsideChange = (what: string): void => {
  if (confirmedEquippedSet) {
    logPerk(`perks changed outside Farmhand (${what}) — nothing confirmed`);
  }
  setConfirmedEquipped(undefined);
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
          const next = processPerks(await getDocument(response));
          // The perks page is where a set can be re-equipped or edited by hand,
          // which the fast path can't see -- so a real VISIT drops the
          // confirmation and makes the next switch re-verify.
          //
          // Only a visit, though. This fired on any read of perks.php, and the
          // reconciler reads it itself whenever the day-long cache lapses --
          // detached from the fetch, so it could land just after a switch we
          // watched complete and throw that confirmation away. The page
          // contradicting us (a different set shown active) is worth acting on
          // whoever asked for it.
          const isVisit =
            getPage()[0] === Page.PERKS || getHashPage() === Page.PERKS;
          if (isVisit || next.currentPerkSetId !== confirmedEquippedSet?.id) {
            setConfirmedEquipped(undefined);
          }
          await state.set(next);
        },
      },
      // The game's own perk buttons send these same two requests, and a set
      // activated by hand from a RETAINED perks page (back navigation: no
      // fetch, so the visit interceptor above never fires) used to leave our
      // confirmation standing for a set that was no longer on. Every later
      // switch to that set then took the fast path over the wrong perks. A
      // reset or an activate we did not send ourselves drops the confirmation.
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.RESET_PERKS })],
        callback: () => {
          if (!pendingPerkSet) {
            noteOutsideChange("reset");
          }
          return Promise.resolve();
        },
      },
      {
        match: [
          Page.WORKER,
          new URLSearchParams({ go: WorkerGo.ACTIVATE_PERK_SET }),
        ],
        callback: async (state, previous, response) => {
          const [_, query] = parseUrl(response.url);
          const id = Number(query.get("id"));
          if (pendingPerkSet?.id !== id) {
            noteOutsideChange(
              previous?.perkSets.find((set) => set.id === id)?.name ??
                `set ${id}`
            );
          }
          await state.set({
            ...previous,
            currentPerkSetId: id,
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
// undefined when unknown.
export const getConfirmedEquippedSetId = (): number | undefined =>
  confirmedEquippedSet?.id;

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

// ---------------------------------------------------------------------------
// The switch engine
// ---------------------------------------------------------------------------
//
// ONE QUEUE, AND THE ACTION RUNS INSIDE IT.
//
// Every perk decision -- the page reconciler's revert, a harvest, a quick-sell
// -- is a task on `runPerkTask`, which runs them one at a time in call order.
// Two rules fall out of that, and between them they close the whole class of
// bug this feature has produced since it was written:
//
// 1. A task that ACTS on the perks it just equipped holds the queue across the
//    action. Before, only the SWITCHES were serialised; the action ran outside
//    the chain, so any switch queued in between -- a page-transition reconcile,
//    a second quick action -- began with resetperks() and pulled the perks out
//    from under an action already in flight. Perks are EMPTY between resetperks
//    and activateperkset, and an action landing in that window rolls with no
//    perks at all. That is a harvest coming back with exactly one crop per plot.
//
// 2. A task decides WHAT to switch to when it reaches the front of the queue,
//    not when it was scheduled. A reconcile scheduled mid-transition used to
//    capture the page it saw at the time and could apply it after the correct
//    one had landed (the 1.1.41 regression). Resolving in the slot means a
//    stale task re-resolves to the page you are actually on and no-ops.
//
// Nothing outside this file switches perks, and nothing inside it switches
// outside a task.

// The game acks activateperkset ("success") BEFORE it has finished equipping
// the set, so an action fired immediately after can run under the OLD perks: a
// 50-silver item sold for 55 (+10% gold perk only) instead of 80 (+60%). This
// used to be a flat wait after every real switch; now it is the floor for the
// perks-page polling below when the page cannot answer (a set of unknown size,
// or a page with nothing to count), and the polling exits as soon as the page
// shows the whole set on.
const PERK_SETTLE_MS = 1000;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Is the set actually on yet?
// ---------------------------------------------------------------------------

// The settle was a guess at how long the game takes to finish equipping after
// it says "success", and Reed's harvests said it was sometimes short (41 crops
// from a field that gives ~50 under Default and 36 under nothing: PART of the
// set on) and once plain wrong (36: NOTHING on, reset and activate both
// acknowledged, a full second waited). So the perks page is what decides now.
//
// What that page shows (Reed's paste, 2026-09-21): perks.php opens with a
// menu (Farm Supply Perks → supply.php, ...) and the "My Perk Sets" card, then
// one <li> per perk: an icon in .item-media that is the PERK's own (fa-timer
// on Quicker Farming, fa-check-double on Double Prizes -- these were first
// mistaken for state), the name and effect, and in .item-after a button. On a
// perk that is on that button is `button.resetonebtn` (reset this one).
// Counting those is the signal; the button a perk that is OFF carries has
// not been seen yet, so the signal is checked rather than trusted: read once
// right after the reset, when the slate is empty, and if the count did not
// drop the signal does not move with the perks and the settle is all there
// is for the session (logged).
//
// How many a set equips is learned, not known: the page never says what a set
// contains. The count a set was last seen fully on with is remembered per set
// name (ids change when a set is re-made). After a switch the page is polled
// until the count reaches that -- from the first read, so a game that is done
// in 300 ms costs 300 ms, not a flat second -- or, for a set of unknown size
// or one that comes up short (edited smaller), until three reads agree after
// at least the old settle.
const VERIFY_POLL_MS = 250;
const VERIFY_WINDOW_MS = 4000;
// v2: the 1.1.78 count (thematic icons) left sizes of 2 behind under the old key
const SET_SIZES_KEY = "fhPerkSetSizes2";
const ACTIVE_PERK_BUTTON = "li .item-after button.resetonebtn";
const ANY_PERK_BUTTON = "li .item-after button";
let setSizes: Record<string, number> | undefined;
// false once a read after a reset showed the count not moving
let isCountUsable = true;

interface PerksPageReading {
  // which set the page shows as active, if any
  activeId?: number;
  // perks the page shows as on, undefined when it has no perk rows at all
  equipped?: number;
}

const readPerksPage = async (): Promise<PerksPageReading | undefined> => {
  let page: Document;
  try {
    page = await getHTML(Page.PERKS);
  } catch (error) {
    logPerk(
      `could not read the perks page (${
        error instanceof Error ? error.message : String(error)
      })`
    );
    return undefined;
  }
  const { currentPerkSetId } = processPerks(page);
  const buttons = page.body.querySelectorAll(ANY_PERK_BUTTON).length;
  const active = page.body.querySelectorAll(ACTIVE_PERK_BUTTON).length;
  describePerksPage(page);
  return {
    activeId: currentPerkSetId,
    equipped: buttons > 0 ? active : undefined,
  };
};

// Once a session: the kinds of button the perk rows carry, with counts, so
// the button of a perk that is OFF shows up in the log Reed pastes.
let hasDescribedPerksPage = false;
const describePerksPage = (page: Document): void => {
  if (hasDescribedPerksPage) {
    return;
  }
  hasDescribedPerksPage = true;
  const kinds = new Map<string, number>();
  for (const button of page.body.querySelectorAll(ANY_PERK_BUTTON)) {
    const kind = `${[...button.classList]
      .filter((name) => name !== "button")
      .join(".")}:${button.textContent?.trim() ?? ""}`;
    kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
  }
  logPerk(
    `perks page buttons: ${
      [...kinds].map(([kind, count]) => `${kind} ×${count}`).join(" | ") ||
      "none"
    }`
  );
};

const loadSetSizes = async (): Promise<Record<string, number>> => {
  if (!setSizes) {
    const stored = await GM.getValue<Record<string, number>>(SET_SIZES_KEY, {});
    // only ever runs inside the perk queue, so nothing else can have loaded
    // it in the meantime
    // eslint-disable-next-line require-atomic-updates
    setSizes ??= stored ?? {};
  }
  return setSizes;
};

const rememberSetSize = (set: PerkSet, size: number, known?: number): void => {
  setSizes = { ...setSizes, [set.name]: size };
  GM.setValue(SET_SIZES_KEY, setSizes as any);
  logPerk(
    `${set.name} equips ${size} perks${
      known === undefined ? "" : ` (was ${known})`
    }`
  );
};

// Right after the reset: what the page shows with the slate empty. The
// floor every later read has to climb above -- and the check on the signal
// itself: a count that did not drop below what this set is known to equip
// is not counting equipped perks.
const readAfterReset = async (set: PerkSet): Promise<number | undefined> => {
  if (!isCountUsable) {
    return undefined;
  }
  const sizes = await loadSetSizes();
  const known = sizes[set.name];
  const reading = await readPerksPage();
  if (reading?.equipped === undefined) {
    return undefined;
  }
  if (known !== undefined && known > 0 && reading.equipped >= known) {
    // only ever runs inside the perk queue
    // eslint-disable-next-line require-atomic-updates
    isCountUsable = false;
    logPerk(
      `perks page still shows ${reading.equipped} on right after the reset — its count does not follow the perks; verifying by settle only from here`
    );
    return undefined;
  }
  return reading.equipped;
};

// After reset + activate: hold the task until the page shows the set on.
// Resolves to the set that ended up on (a fresh id if the page showed another
// set active and a re-read found this set under a new one). Throws if the
// page still shows nothing above the post-reset floor at the end of the
// window: by then the slate has been cleared for seconds, and Reed's
// town→banner harvest of 2026-09-21 -- reset and activate both "success", a
// full second waited, 36 crops from 36 plots -- is what going on anyway
// looks like.
const waitUntilEquipped = async (
  set: PerkSet,
  floor: number | undefined
): Promise<PerkSet> => {
  const sizes = await loadSetSizes();
  const known = sizes[set.name];
  const startedAt = Date.now();
  const counts: number[] = [];
  let hasReactivated = false;
  for (;;) {
    const reading = isCountUsable ? await readPerksPage() : undefined;
    const elapsed = Date.now() - startedAt;
    if (reading?.equipped === undefined || floor === undefined) {
      // a guard on top of the settle, not a gate: a page that cannot answer
      // must not strand the action behind it
      if (reading && isCountUsable) {
        logPerk(
          `${set.name}: perks page has no perk rows — trusting the settle`
        );
      }
      await delay(Math.max(0, PERK_SETTLE_MS - elapsed));
      return set;
    }
    // The page shows some other set as active: the activate did not take,
    // whatever it replied. A set deleted and re-made keeps its name and
    // changes its id, so look the name up again and activate that once.
    if (
      !hasReactivated &&
      reading.activeId !== undefined &&
      reading.activeId !== set.id
    ) {
      hasReactivated = true;
      logPerk(
        `${set.name} (${set.id}) not active after activate — page shows set ${reading.activeId}; re-reading ids`
      );
      const fresh = (await refreshSet(set)) ?? set;
      pendingPerkSet = fresh;
      await sendActivate(fresh);
      set = fresh;
      await delay(VERIFY_POLL_MS);
      continue;
    }
    const count = reading.equipped;
    counts.push(count);
    const isAboveFloor = count > floor;
    const isStable =
      elapsed >= PERK_SETTLE_MS &&
      counts.length >= 3 &&
      isAboveFloor &&
      counts.at(-2) === count &&
      counts.at(-3) === count;
    if ((known !== undefined && isAboveFloor && count >= known) || isStable) {
      if (count !== known) {
        rememberSetSize(set, count, known);
      }
      if (counts.length > 1) {
        logPerk(
          `${set.name}: ${
            counts[0]
          } of ${count} on at first read (${floor} after the reset), ${count} after ${(
            elapsed / 1000
          ).toFixed(1)}s`
        );
      }
      return set;
    }
    if (elapsed > VERIFY_WINDOW_MS) {
      // only once the count has been seen to work for this set: a count that
      // never moves must not fail every switch for the session
      if (!isAboveFloor && known !== undefined && known > 0) {
        throw new Error(
          `${
            set.name
          } never came on — perks page shows ${count} on, same as right after the reset, after ${
            VERIFY_WINDOW_MS / 1000
          }s`
        );
      }
      logPerk(
        `${set.name}: still ${count} of ${known ?? "?"} on after ${
          VERIFY_WINDOW_MS / 1000
        }s (${floor} after the reset) — going on anyway`
      );
      return set;
    }
    await delay(VERIFY_POLL_MS);
  }
};

// Before a forced switch to a set we already drove the game to: one read of
// the page, and if it shows this set active with everything it equips on,
// the switch is not needed. That read is of a set that has been sitting on
// for a while, so its count is a settled one -- if it is higher than what we
// had learned, the learned size was a partial and goes up. ~100 ms against
// the ~1.3 s of a round trip, which is most banner and farm-page harvests.
const isVerifiedOn = async (set: PerkSet): Promise<boolean> => {
  if (!isCountUsable) {
    return false;
  }
  const sizes = await loadSetSizes();
  const known = sizes[set.name];
  if (known === undefined || known === 0) {
    return false;
  }
  const reading = await readPerksPage();
  if (reading?.equipped === undefined || reading.activeId !== set.id) {
    return false;
  }
  if (reading.equipped > known) {
    rememberSetSize(set, reading.equipped, known);
    return true;
  }
  return reading.equipped >= known;
};

// worker.php answers these two with the bare word "success". Anything else --
// an error page, a logged-out shell, a rate limit -- means we do NOT know what
// the game did, and the one thing we must not do then is record it as
// confirmed: a switch marked confirmed after a reset that landed and an
// activate that didn't leaves perks EMPTY, and every later switch to that set
// takes the fast path and never repairs it. Stuck empty for the session.
const isAcknowledged = (reply: Document, what: string): boolean => {
  const text = reply.body.textContent?.trim() ?? "";
  if (/success/i.test(text)) {
    return true;
  }
  logPerk(`${what} was not acknowledged: "${text.slice(0, 60)}"`);
  return false;
};

// Clear every equipped perk before loading a set (upstream behaviour). Loading
// from an EMPTY slate is what makes the game equip a set fully; switching
// set-to-set without it leaves the game diffing off the previous full set and
// dropping/lagging perks, which showed up as a set selected but only half
// applied (and never self-repairing).
const clearPerks = async (): Promise<boolean> => {
  const reply = await getHTML(
    Page.WORKER,
    new URLSearchParams({ go: WorkerGo.RESET_PERKS })
  );
  // perks are cleared (or in an unknown state) either way, so nothing is
  // confirmed-equipped anymore
  setConfirmedEquipped(undefined);
  const state = perksState.read();
  if (state) {
    await perksState.set({ ...state, currentPerkSetId: undefined });
  }
  return isAcknowledged(reply, "resetperks");
};

const sendActivate = async (set: PerkSet): Promise<boolean> => {
  const reply = await getHTML(
    Page.WORKER,
    new URLSearchParams({
      go: WorkerGo.ACTIVATE_PERK_SET,
      id: set.id.toString(),
    })
  );
  return isAcknowledged(reply, `activate ${set.name}`);
};

export interface ApplyOptions {
  // Don't take the confirmed fast path on memory alone. For an action whose
  // whole yield rides on the perks -- a harvest -- a confirmation, which is
  // only ever what WE last saw, is not enough: the perks page has to agree
  // (one read), or the full round trip is paid.
  force?: boolean;
}

// The set's id is read off the perks page once a day; a set deleted and
// re-made in between keeps its name and changes its id, and the game does not
// say "success" to an id it no longer has. Re-read the page and look the
// name up again before giving up on the switch.
const refreshSet = async (set: PerkSet): Promise<PerkSet | undefined> => {
  const state = await perksState.get({ ignoreCache: true });
  const fresh = state?.perkSets.find(({ name }) => name === set.name);
  if (fresh && fresh.id !== set.id) {
    logPerk(`${set.name} is now set ${fresh.id} (was ${set.id})`);
  }
  return fresh;
};

// Drive the game to `set`. Only callable from inside a task, which is what
// guarantees nothing else is touching the perks while the slate is empty.
// Resolves to whether a real switch happened (false = already confirmed on it),
// so callers can tell a change from a no-op.
//
// Throws if the game never acknowledged the activate. By then the slate has
// already been cleared, so the perks are EMPTY -- and a caller that went on to
// act anyway (a harvest) would roll with nothing equipped, one crop a plot.
// Failing the action keeps the crops in the ground for a harvest that works;
// the reconciler, which has no action behind it, just reports the failure.
const applySet = async (
  set: PerkSet,
  { force = false }: ApplyOptions = {}
): Promise<boolean> => {
  // We drove the game here and watched it land, and nothing has cleared the
  // slate since -- so it is genuinely equipped and the whole round trip
  // (reset + activate + settle) can be skipped. This is what makes back-to-back
  // quick-sells instant after the first one.
  if (
    confirmedEquippedSet?.id === set.id &&
    (!force || (await isVerifiedOn(set)))
  ) {
    return false;
  }
  pendingPerkSet = set;
  notifyPerkStatus();
  try {
    const wasCleared = await clearPerks();
    const floor = await readAfterReset(set);
    // Retried if the game doesn't say "success", because at this point the
    // slate is already EMPTY: an activate that goes missing here is not a switch
    // that didn't happen, it is every perk turned off until something switches
    // again. That is the state a harvest comes back from with one crop a plot.
    // The retry goes to the set's CURRENT id, in case the one we have is stale.
    let wasActivated = await sendActivate(set);
    if (!wasActivated) {
      const fresh = (await refreshSet(set)) ?? set;
      // ours, so the activate interceptor does not read the new id as the
      // game's own button being pressed
      pendingPerkSet = fresh;
      wasActivated = await sendActivate(fresh);
      if (wasActivated) {
        set = fresh;
      }
    }
    if (!wasActivated) {
      throw new Error(
        `the game did not activate the ${set.name} set — perks are currently empty`
      );
    }
    set = await waitUntilEquipped(set, floor);
    if (wasCleared) {
      // eslint-disable-next-line require-atomic-updates
      pendingPerkSet = undefined;
      setConfirmedEquipped(set);
    } else {
      // The activate landed but the reset before it was not acknowledged, so
      // the set may sit on top of leftovers. Don't claim it: the next switch to
      // this set pays the round trip again rather than trusting perks we never
      // saw confirmed.
      logPerk(`${set.name} may not be fully equipped — will re-apply`);
    }
    return true;
  } finally {
    // cleared (and announced) even if the switch throws, so a failed switch
    // can't leave the indicator stuck on "switching…"
    // eslint-disable-next-line require-atomic-updates
    pendingPerkSet = undefined;
    notifyPerkStatus();
  }
};

// The capability handed to a task: the only way to change perks, and it exists
// only while the task holds the queue.
export interface PerkSession {
  readonly apply: (set: PerkSet, options?: ApplyOptions) => Promise<boolean>;
}

const session: PerkSession = { apply: applySet };

let perkQueue: Promise<unknown> = Promise.resolve();
let isTaskRunning = false;

// How long a task waits for its turn before giving up on the queue and running
// anyway. Normal traffic never gets near this: a switch is ~1.3 s (reset +
// activate + settle), a gated action with its restore ~3-4 s, and even a few
// stacked up clear in seconds. Only a HUNG request (a fetch that neither
// resolves nor rejects) holds the queue this long, and without a limit that
// one hang would leave perk switching dead for the rest of the session,
// silently. Giving up is logged, and the abandoned task is dropped from the
// chain so everything after it runs normally.
const QUEUE_WAIT_LIMIT_MS = 30_000;

// Run `task` with exclusive use of the perks: tasks run one at a time, in call
// order, and a task holds the queue until it resolves. Don't call it from
// inside another task -- anything a task needs is on the session it is given,
// and a task waiting on the queue it is itself holding would sit there until
// the wait limit above.
//
// There is deliberately NO shortcut for a task that arrives while another is
// running. 1.1.55 had one -- a "re-entrant" call ran inline -- keyed on a flag
// that only said SOME task was running, not that the caller was inside it. No
// caller is ever inside one (the post-action restore is called directly), so
// the shortcut fired only for the case it must never fire for: an independent
// click or page-transition reconcile landing mid-task, which then ran
// CONCURRENTLY with it, resets and activates interleaving. A banner harvest
// clicked within ~1.5 s of arriving on a page raced that page's own switch.
export const runPerkTask = <T>(
  task: (perks: PerkSession) => Promise<T>,
  label = "a perk task"
): Promise<T> => {
  if (isTaskRunning) {
    // so the log shows the wait, not just the two entries either side of it
    logPerk(`${label} is waiting for the perk queue`);
  }
  const previous = perkQueue;
  const run = (async () => {
    let waitTimeout: number | undefined;
    const gaveUp = await Promise.race([
      previous.then(() => false),
      new Promise<boolean>((resolve) => {
        waitTimeout = setTimeout(
          () => resolve(true),
          QUEUE_WAIT_LIMIT_MS
        ) as unknown as number;
      }),
    ]);
    clearTimeout(waitTimeout);
    if (gaveUp) {
      logPerk(
        `${label} waited ${
          QUEUE_WAIT_LIMIT_MS / 1000
        }s for the perk queue and ran anyway — a request may be hung`
      );
    }
    isTaskRunning = true;
    try {
      return await task(session);
    } finally {
      // eslint-disable-next-line require-atomic-updates
      isTaskRunning = false;
    }
  })();
  // a failed task must not break the queue for the next one
  perkQueue = run.catch(() => {
    // swallowed here only; runPerkTask's own caller still sees the rejection
  });
  return run;
};

// One-shot switch with no action behind it: the panel's manual "equip".
export const equipPerkSet = (set: PerkSet): Promise<boolean> =>
  runPerkTask((perks) => perks.apply(set), `equip ${set.name}`);

// How the perks get put back after a gated action. Registered by
// features/perkManagement.ts, which owns the page-to-set policy; this module
// owns the switching and knows nothing about pages. Called with the live
// session, so the restore happens inside the same task -- it must not enqueue.
type PerkRestore = (perks: PerkSession) => Promise<void>;

let restorePerks: PerkRestore | undefined;

export const onPerkRestore = (restore: PerkRestore): void => {
  restorePerks = restore;
};

export interface GatedActionOptions {
  // what shows up in the note/log, e.g. "harvest"
  label: string;
  // resolved inside the task, so it sees current state
  set: () => Promise<PerkSet | undefined>;
  action: () => Promise<void> | void;
  // Keep holding the queue this long after `action` resolves. For an action we
  // fire and cannot await -- a proxied click, where the game runs its own
  // request -- this is the only thing keeping the next reconcile's resetperks
  // off the perks the game is still spending.
  holdMs?: number;
  // put the page's own set back afterwards (default true)
  restore?: boolean;
  // switch for real even if the set is already confirmed on (see ApplyOptions)
  force?: boolean;
}

// Run an action under a specific perk set, with nothing able to switch perks
// from under it. This is the ONLY way to perform a perk-sensitive action.
export const runGatedAction = ({
  label,
  set,
  action,
  holdMs = 0,
  restore = true,
  force = false,
}: GatedActionOptions): Promise<void> =>
  runPerkTask(async (perks) => {
    const target = await set();
    if (target) {
      // said before the switch as well as after, so the log timestamps the
      // moment the action started waiting on perks, not just the moment it
      // stopped
      setPerkStatusNote(`${label} → ${target.name}`);
      const startedAt = Date.now();
      let switched: boolean;
      try {
        switched = await perks.apply(target, { force });
      } catch (error) {
        // the chip log is the one place Reed reads; say the action was
        // dropped, not just that an activate went unacknowledged
        setPerkStatusNote(
          `${label} → ${target.name} FAILED — ${label} not run: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        throw error;
      }
      let outcome = " (already on)";
      if (switched) {
        outcome = ` (switched, ${((Date.now() - startedAt) / 1000).toFixed(
          1
        )}s)`;
      } else if (force) {
        outcome = " (verified on)";
      }
      setPerkStatusNote(`${label} → ${target.name}${outcome}`);
    } else {
      setPerkStatusNote(`${label}: no set to switch to`);
    }
    try {
      await action();
    } finally {
      if (holdMs > 0) {
        await delay(holdMs);
      }
      if (restore && restorePerks) {
        await restorePerks(perks);
      }
    }
  }, label);
