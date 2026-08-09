import {
  CachedState,
  QueryInterceptor,
  StorageKey,
} from "../../../utils/state";
import { getDocument } from "../../../utils/requests";
import { getHTML } from "../utils/requests";
import { Page, WorkerGo } from "~/utils/page";
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

const scheduledUpdates: Record<number, NodeJS.Timeout> = {};

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
const MEAL_ACTIONS = [
  WorkerGo.SEASON_MEALS,
  WorkerGo.STIR_MEALS,
  WorkerGo.TASTE_MEALS,
];

const mealActionInterceptors: QueryInterceptor<KitchenStatus, void>[] =
  MEAL_ACTIONS.map((go) => ({
    match: [Page.WORKER, new URLSearchParams({ go })],
    callback: async (state) => {
      await state.get({ ignoreCache: true });
    },
  }));

export const kitchenStatusState = new CachedState<KitchenStatus>(
  StorageKey.KITHCEN_STATUS,
  async () => {
    const response = await getHTML(Page.KITCHEN, new URLSearchParams());
    return processKitchenPage(response.body);
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
          await state.set(processKitchenStatus(kitchenStatus || undefined));
        },
      },
      {
        match: [Page.KITCHEN, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          await state.set(processKitchenPage(root.body));
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
          await state.set({
            ...previous,
            status: OvenStatus.EMPTY,
            checkAt: Number.POSITIVE_INFINITY,
          });
          // Clearing the banner immediately is right, but EMPTY is only a guess:
          // collect takes the ready meals and leaves anything still cooking, so
          // confirm against the kitchen page. `ignoreCache` because the `set()`
          // above just stamped this state as fresh.
          await state.get({ ignoreCache: true });
        },
      },
      ...mealActionInterceptors,
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.COOK_ALL })],
        callback: async (state, previous) => {
          await state.set({
            ...previous,
            status: OvenStatus.COOKING,
            checkAt: Date.now() + 60 * 1000,
          });
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
  if (state.checkAt < Date.now()) {
    await kitchenStatusState.get();
  }
};

// automatically update crops when finished
kitchenStatusState.onUpdate((state) => {
  if (!state) {
    return;
  }
  if (scheduledUpdates[state.checkAt]) {
    return;
  }
  scheduledUpdates[state.checkAt] = setTimeout(
    updateStatus,
    state.checkAt - Date.now()
  );
});

export const collectAll = async (): Promise<void> => {
  await getHTML(
    Page.WORKER,
    new URLSearchParams({ go: WorkerGo.COLLECT_ALL_MEALS })
  );
};
