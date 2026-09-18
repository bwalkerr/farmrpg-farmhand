import {
  CachedState,
  QueryInterceptor,
  StorageKey,
} from "../../../utils/state";
import { getDocument } from "../../../utils/requests";
import { getHTML, parseUrl } from "../utils/requests";
import { getPage, Page, WorkerGo } from "~/utils/page";
import { logDiagnostic } from "~/utils/diagnostics";
import { showPopup } from "~/utils/popup";
import { timestampToDate } from "../utils/time";

export enum OvenStatus {
  EMPTY = "empty",
  COOKING = "cooking",
  ATTENTION = "attention",
  READY = "complete",
}

export interface KitchenStatus {
  status: OvenStatus;
  // oven count; only the kitchen page can provide it
  count?: number;
  allReady: boolean;
  checkAt: number;
}

const processKitchenStatus = (root: HTMLElement | undefined): KitchenStatus => {
  const statusText = root?.textContent;
  if (!statusText) {
    // leave count untouched; only the kitchen page knows how many ovens exist
    return {
      status: OvenStatus.EMPTY,
      allReady: false,
      checkAt: Number.POSITIVE_INFINITY,
    };
  }
  let status = OvenStatus.EMPTY;
  let checkAt = Number.POSITIVE_INFINITY;
  let allReady = false;
  if (statusText.toLowerCase().includes("cooking")) {
    status = OvenStatus.COOKING;
    checkAt = Date.now() + 60 * 1000;
  } else if (statusText.toLowerCase().includes("attention")) {
    status = OvenStatus.ATTENTION;
    checkAt = Date.now() + 60 * 1000;
    // something needs attention, figure out what
    kitchenStatusState.get();
  } else if (statusText.toLowerCase().includes("ready")) {
    status = OvenStatus.READY;
    checkAt = Number.POSITIVE_INFINITY;
    allReady = true;
  }
  return { status, checkAt, allReady };
};

const processKitchenPage = (root: HTMLElement): KitchenStatus | undefined => {
  const ovens = root.querySelectorAll<HTMLAnchorElement>("a[href^='oven.php']");
  const count = ovens.length;
  let status = OvenStatus.EMPTY;
  let checkAt = Number.POSITIVE_INFINITY;
  let allReady = true;
  for (const oven of ovens) {
    const statusText = oven.querySelector<HTMLSpanElement>(".item-after span");
    if (!statusText?.dataset.countdownTo) {
      continue;
    }
    const doneDate = timestampToDate(statusText.dataset.countdownTo);
    const now = new Date();
    if (doneDate < now) {
      status = OvenStatus.READY;
      checkAt = Math.min(checkAt, Number.POSITIVE_INFINITY);
      break;
    }
    const tasks = oven.querySelectorAll<HTMLImageElement>("img:not(.itemimg)");
    if (
      tasks.length > 0 &&
      [OvenStatus.EMPTY, OvenStatus.COOKING].includes(status)
    ) {
      status = OvenStatus.ATTENTION;
      if (allReady && tasks.length !== 3) {
        allReady = false;
      }
    } else if (status === OvenStatus.EMPTY) {
      status = OvenStatus.COOKING;
    }
    checkAt = Math.min(checkAt, Date.now() + 60 * 1000);
  }
  return {
    allReady,
    checkAt,
    count,
    status,
  };
};

// Every oven-status update goes through here so the panel's log says which
// feed set it and to what -- the same shape as setFarmStatus in farm.ts, for
// the same reason: the oven banners are nothing but this status, and "the
// banner stayed after I took the meal" is only diagnosable if the log shows
// what was seen (or not seen) after the take.
const describeStatus = (status: KitchenStatus): string => {
  const count = status.count === undefined ? "" : ` x${status.count}`;
  const due =
    status.checkAt === Number.POSITIVE_INFINITY
      ? ""
      : `, check in ${Math.max(
          0,
          Math.round((status.checkAt - Date.now()) / 60_000)
        )}m`;
  return `${status.status}${count}${due}`;
};

const setKitchenStatus = async (
  state: CachedState<KitchenStatus>,
  status: KitchenStatus | undefined,
  source: string
): Promise<void> => {
  if (!status) {
    logDiagnostic(`ovens: ${source} unreadable, keeping status`);
    return;
  }
  logDiagnostic(`ovens: ${source} -> ${describeStatus(status)}`);
  await state.set(status);
};

// Stirring, tasting and seasoning are what clear "Ovens need attention", and
// nothing was watching for them: only `seasonmealsall` had an interceptor at all
// (and the wrong one — a copy of the collect handler, which declared the ovens
// EMPTY and popped a "meals collected" message for a seasoning). So doing the
// actions left the status on ATTENTION and the banner nagged for work already
// done until something else happened to refresh the kitchen.
//
// What each oven still needs afterwards is only knowable from the kitchen page,
// so these re-read it rather than guessing. `ignoreCache` is required: `set()`
// stamps the state as freshly updated, so a plain `get()` inside five seconds of
// an action returns the very value we are trying to replace.
//
// Watching the three names WorkerGo knows only covers the kitchen list's "all"
// buttons. The same work is done one oven at a time from oven.php?num=N, whose
// actions have different names that aren't in WorkerGo at all — so tending or
// collecting an oven from its own page left the status untouched and the banner
// still asking for it. Rather than guess at names, this matches any oven-shaped
// worker action, which also covers whatever the game adds next.
const MEAL_ACTION_PATTERN = /cook|meal|season|stir|taste/;

// these two have interceptors of their own below, which do more than re-read
const OWN_INTERCEPTORS = new Set<string>([
  WorkerGo.COLLECT_ALL_MEALS,
  WorkerGo.COOK_ALL,
]);

let scheduledMealRefresh: NodeJS.Timeout | undefined;

const mealActionInterceptor: QueryInterceptor<KitchenStatus, void> = {
  // every worker action, filtered in the callback (the match only compares the
  // keys it's given, so an empty query matches them all)
  match: [Page.WORKER, new URLSearchParams()],
  callback: (state, previous, response) => {
    const [, query] = parseUrl(response.url);
    const go = query.get("go") ?? "";
    // Name every worker action fired from the kitchen or an oven, matched or
    // not: the game's own buttons there are the ones this pattern has to
    // know, and the log is where a renamed one shows up.
    const [page] = getPage();
    if (page === Page.KITCHEN || page === Page.OVEN) {
      logDiagnostic(`ovens: worker ${go} on ${page}`);
    }
    if (!MEAL_ACTION_PATTERN.test(go) || OWN_INTERCEPTORS.has(go)) {
      return Promise.resolve();
    }
    // Tending an oven is a burst of clicks, and each one would otherwise cost a
    // kitchen page read; wait for the burst to finish and read once.
    clearTimeout(scheduledMealRefresh);
    scheduledMealRefresh = setTimeout(() => {
      logDiagnostic(`ovens: saw ${go}, re-reading the kitchen page`);
      state.get({ ignoreCache: true });
    }, 600);
    return Promise.resolve();
  },
};

export const kitchenStatusState = new CachedState<KitchenStatus>(
  StorageKey.KITHCEN_STATUS,
  async () => {
    const response = await getHTML(Page.KITCHEN, new URLSearchParams());
    const status = processKitchenPage(response.body);
    logDiagnostic(
      status
        ? `ovens: kitchen page read -> ${describeStatus(status)}`
        : "ovens: kitchen page read unreadable, keeping status"
    );
    return status;
  },
  {
    timeout: 5,
    // live status — see the note on farmStatusState
    persist: false,
    defaultState: {
      status: OvenStatus.EMPTY,
      count: 0,
      allReady: false,
      checkAt: Number.POSITIVE_INFINITY,
    },
    interceptors: [
      {
        match: [Page.HOME_PATH, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          const kitchenStatus = root?.querySelector<HTMLSpanElement>(
            "a[href='kitchen.php'] .item-after span"
          );
          await setKitchenStatus(
            state,
            processKitchenStatus(kitchenStatus || undefined),
            "home page"
          );
        },
      },
      {
        match: [Page.KITCHEN, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          await setKitchenStatus(
            state,
            processKitchenPage(root.body),
            "kitchen page"
          );
        },
      },
      {
        match: [
          Page.WORKER,
          new URLSearchParams({ go: WorkerGo.COLLECT_ALL_MEALS }),
        ],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          const successCount =
            root.body.textContent?.match(/success/g)?.length ?? 0;
          if (successCount) {
            showPopup({
              title: "Success!",
              contentHTML: `${successCount} meal${
                successCount === 1 ? "" : "s"
              } collected`,
            });
          }
          await setKitchenStatus(
            state,
            {
              ...previous,
              allReady: false,
              status: OvenStatus.EMPTY,
              checkAt: Number.POSITIVE_INFINITY,
            },
            "collect all"
          );
          // Clearing the banner immediately is right, but EMPTY is only a guess:
          // collect takes the ready meals and leaves anything still cooking, so
          // confirm against the kitchen page. `ignoreCache` because the `set()`
          // above just stamped this state as fresh.
          await state.get({ ignoreCache: true });
        },
      },
      mealActionInterceptor,
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.COOK_ALL })],
        callback: async (state, previous) => {
          await setKitchenStatus(
            state,
            {
              ...previous,
              allReady: false,
              status: OvenStatus.COOKING,
              checkAt: Date.now() + 60 * 1000,
            },
            "cook all"
          );
        },
      },
    ],
  }
);

const updateStatus = async (): Promise<void> => {
  const state = await kitchenStatusState.get({ doNotFetch: true });
  if (!state) {
    return;
  }
  if (state.checkAt <= Date.now()) {
    await kitchenStatusState.get();
  }
};

// One pending re-check, moved with every update -- see the note on the same
// timer in farm.ts: keyed by checkAt, a moment that had already been scheduled
// once was never scheduled again.
let pendingUpdate: NodeJS.Timeout | undefined;

kitchenStatusState.onUpdate((state) => {
  clearTimeout(pendingUpdate);
  pendingUpdate = undefined;
  if (!state || state.checkAt === Number.POSITIVE_INFINITY) {
    return;
  }
  pendingUpdate = setTimeout(
    updateStatus,
    Math.max(0, state.checkAt - Date.now())
  );
});

export const collectAll = async (): Promise<void> => {
  await getHTML(
    Page.WORKER,
    new URLSearchParams({ go: WorkerGo.COLLECT_ALL_MEALS })
  );
};
