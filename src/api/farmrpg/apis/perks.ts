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
// 50-silver item sold for 55 (+10% gold perk only) instead of 80 (+60%). We
// wait this long after every real switch. It is empirically enough on Reed's
// connection (verified: Sandstone quick-sells for 80), and it is now paid only
// when a switch actually happened -- the confirmed fast path below skips it.
const PERK_SETTLE_MS = 1000;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
  // how long to wait after the activate is acked before trusting it; the
  // default is tuned for a sale, a roll that cannot be redone gets longer
  settleMs?: number;
  // read the perks page afterwards and check the game agrees the set is on,
  // re-activating once if it doesn't -- one extra request, only worth paying
  // when the next thing is irreversible
  verify?: boolean;
}

// The game's own account of which set is active, read fresh. The checkmark
// on the perks page is written by the same activate we sent, so if it isn't
// there yet the game has not finished with our request, whatever it acked.
const readActiveSetId = async (): Promise<number | undefined> => {
  const state = await perksState.get({ ignoreCache: true });
  return state?.currentPerkSetId;
};

// Drive the game to `set`. Only callable from inside a task, which is what
// guarantees nothing else is touching the perks while the slate is empty.
// Resolves to whether a real switch happened (false = already confirmed on it),
// so callers can tell a change from a no-op.
const applySet = async (
  set: PerkSet,
  { settleMs = PERK_SETTLE_MS, verify = false }: ApplyOptions = {}
): Promise<boolean> => {
  // We drove the game here and watched it land, and nothing has cleared the
  // slate since -- so it is genuinely equipped and the whole round trip
  // (reset + activate + settle) can be skipped. This is what makes back-to-back
  // quick-sells instant after the first one.
  if (confirmedEquippedSet?.id === set.id) {
    return false;
  }
  pendingPerkSet = set;
  notifyPerkStatus();
  try {
    const wasCleared = await clearPerks();
    // Retried once if the game doesn't say "success", because at this point the
    // slate is already EMPTY: an activate that goes missing here is not a switch
    // that didn't happen, it is every perk turned off until something switches
    // again. That is the state a harvest comes back from with one crop a plot.
    let wasActivated = await sendActivate(set);
    if (!wasActivated) {
      wasActivated = await sendActivate(set);
    }
    await delay(settleMs);
    if (verify && wasActivated) {
      // The ack says the request arrived; this says the game acted on it.
      // A mismatch here is the shape of "the set never turned green before
      // the harvest": the activate was still being applied when we moved on.
      let activeId = await readActiveSetId();
      if (activeId !== set.id) {
        logPerk(
          `${set.name} not active yet after ${settleMs}ms (game shows ${
            activeId ?? "none"
          }) — re-activating`
        );
        wasActivated = await sendActivate(set);
        await delay(settleMs);
        activeId = await readActiveSetId();
        if (activeId !== set.id) {
          wasActivated = false;
          logPerk(
            `${set.name} still not active (game shows ${activeId ?? "none"})`
          );
        }
      }
    }
    if (wasCleared && wasActivated) {
      // eslint-disable-next-line require-atomic-updates
      pendingPerkSet = undefined;
      setConfirmedEquipped(set);
    } else {
      // Left in the dark. Don't claim it: the next switch to this set pays the
      // round trip again rather than trusting perks we never saw confirmed.
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
  // longer than the default for a roll that cannot be redone (see ApplyOptions)
  settleMs?: number;
}

// Run an action under a specific perk set, with nothing able to switch perks
// from under it. This is the ONLY way to perform a perk-sensitive action.
export const runGatedAction = ({
  label,
  set,
  action,
  holdMs = 0,
  restore = true,
  settleMs,
}: GatedActionOptions): Promise<void> =>
  runPerkTask(async (perks) => {
    const target = await set();
    if (target) {
      // said before the switch as well as after, so the log timestamps the
      // moment the action started waiting on perks, not just the moment it
      // stopped
      setPerkStatusNote(`${label} → ${target.name}`);
      const startedAt = Date.now();
      // a gated action is the one place a switch is VERIFIED against the perks
      // page: the roll behind it cannot be redone, so one more request to know
      // the game agrees is cheap
      const switched = await perks.apply(target, { settleMs, verify: true });
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      setPerkStatusNote(
        `${label} → ${target.name}${
          switched ? ` (switched, ${elapsed}s)` : " (already on)"
        }`
      );
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
