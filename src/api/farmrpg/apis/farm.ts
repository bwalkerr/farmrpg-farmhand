import { CachedState, StorageKey } from "../../../utils/state";
import {
  getActivityPerksSet,
  PerkActivity,
  PerkSet,
  runGatedAction,
} from "~/api/farmrpg/apis/perks";
import { getDocument } from "../../../utils/requests";
import { getHTML, getJSON } from "../utils/requests";
import { getPage, Page, WorkerGo } from "~/utils/page";
import { getSettingValues, SettingId } from "~/utils/settings";
import { Item } from "../../buddyfarm/types";
import { logDiagnostic } from "~/utils/diagnostics";
import { showPopup } from "~/utils/popup";

export interface FarmState {
  id: number;
  field?: {
    rows?: number;
    status?: string;
    plots?: {
      cropName?: string;
      isGrowing: boolean;
      isReady: boolean;
      progress?: number;
    }[];
  };
}

export enum CropStatus {
  EMPTY = "empty",
  GROWING = "growing",
  READY = "ready",
}

export interface FarmStatus {
  status: CropStatus;
  count: number;
  readyAt: number;
}

// Reads the one-line field summary the game shows away from the farm page: the
// home screen's xfarm row and worker.php?go=readycount both land here.
//
// Text we can't read now returns undefined, which state.set() treats as "keep
// what you had". It used to fall through to a complete `{status: EMPTY}`
// object, so any summary without the word "growing" or "ready" in it — a bare
// "0" from readycount, which only says nothing is READY yet — asserted an empty
// field over crops that were growing fine. readycount is polled, so every poll
// re-asserted it: that is the "Fields are empty!" banner that follows you
// around until a reload. EMPTY now has to be stated, never assumed.
const processFarmStatus = (root: HTMLElement): FarmStatus | undefined => {
  const statusText = root.textContent?.trim();
  if (!statusText) {
    return undefined;
  }
  const text = statusText.toLowerCase();
  // "36 READY!", "12 Growing"
  const count = Number.parseInt(statusText);
  if (text.includes("ready")) {
    return {
      status: CropStatus.READY,
      count: Number.isNaN(count) ? 0 : count,
      readyAt: Date.now(),
    };
  }
  if (text.includes("growing")) {
    return {
      status: CropStatus.GROWING,
      count: Number.isNaN(count) ? 0 : count,
      // no way to tell when from this text, check again in a minute
      readyAt: Date.now() + 60 * 1000,
    };
  }
  if (text.includes("empty")) {
    return {
      status: CropStatus.EMPTY,
      count: 0,
      readyAt: Number.POSITIVE_INFINITY,
    };
  }
  // A bare number is readycount: more than none are ready, and zero says
  // nothing at all about whether the field is planted.
  if (/^\d+$/.test(statusText)) {
    return count > 0
      ? { status: CropStatus.READY, count, readyAt: Date.now() }
      : undefined;
  }
  logDiagnostic(
    `field: summary text not understood: "${statusText.slice(0, 40)}"`
  );
  return undefined;
};

const processFarmPage = (root: HTMLElement): FarmStatus | undefined => {
  const plots = root.querySelectorAll<HTMLAnchorElement>(
    "#croparea #crops .col-25"
  );
  // No plots at all is a page we failed to read, not an empty field — the plots
  // are in the markup whether or not anything is planted in them, so the loop
  // below can only ever return EMPTY when it had nothing to look at (a farm.php
  // fetch that came back as the logged-out shell looks exactly like this).
  if (plots.length === 0) {
    console.debug("[FARM] No plots on the farm page, keeping status");
    return undefined;
  }
  const count = plots.length;
  let status = CropStatus.EMPTY;
  let readyAt = Number.POSITIVE_INFINITY;
  for (const plot of plots) {
    const image = plot.querySelector<HTMLImageElement>("img");
    if (image?.style.opacity === "1") {
      status = CropStatus.READY;
      readyAt = Date.now();
    } else if (status === CropStatus.EMPTY) {
      status = CropStatus.GROWING;
      readyAt = Math.min(
        readyAt,
        Date.now() + Number(image?.dataset.seconds ?? "60") * 1000
      );
    }
  }
  return { status, count, readyAt };
};

// Every crop-status update goes through here so the panel's log says which
// feed set it and to what. The harvest banner is nothing but this status; when
// it fails to show on a phone, this is the line that says whether the status
// ever reached READY, and from where.
const describeStatus = (status: FarmStatus): string => {
  const due =
    status.readyAt === Number.POSITIVE_INFINITY
      ? ""
      : `, ready in ${Math.max(
          0,
          Math.round((status.readyAt - Date.now()) / 60_000)
        )}m`;
  return `${status.status} x${status.count}${due}`;
};

const setFarmStatus = async (
  state: CachedState<FarmStatus>,
  status: FarmStatus | undefined,
  source: string
): Promise<void> => {
  if (!status) {
    logDiagnostic(`field: ${source} unreadable, keeping status`);
    return;
  }
  logDiagnostic(`field: ${source} -> ${describeStatus(status)}`);
  await state.set(status);
};

export const farmStatusState = new CachedState<FarmStatus>(
  StorageKey.FARM_STATUS,
  async () => {
    const response = await getHTML(Page.FARM, new URLSearchParams());
    const status = processFarmPage(response.body);
    logDiagnostic(
      status
        ? `field: farm page read -> ${describeStatus(status)}`
        : "field: farm page read unreadable, keeping status"
    );
    return status;
  },
  {
    timeout: 5,
    // Live status, so don't keep it between sessions. A five-second value
    // written to storage means last session's crop status is still sitting there
    // at the next load, where it can merge into the first update and show a
    // banner for crops that aren't ready — before any of this session's data has
    // arrived. Every other live state here opts out the same way.
    persist: false,
    defaultState: {
      status: CropStatus.EMPTY,
      count: 4,
      readyAt: Number.POSITIVE_INFINITY,
    },
    interceptors: [
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.READY_COUNT })],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          // undefined means we couldn't read it — say nothing rather than
          // overwriting a good status with a guess
          await setFarmStatus(
            state,
            processFarmStatus(root.body),
            "readycount"
          );
        },
      },
      {
        match: [Page.FARM, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          await setFarmStatus(state, processFarmPage(root.body), "farm page");
        },
      },
      {
        match: [Page.HOME_PATH, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          const linkStatus = root.body.querySelector<HTMLDivElement>(
            "a[href^='xfarm.php'] .item-after"
          );
          if (!linkStatus) {
            logDiagnostic("field: home page has no xfarm row");
            return;
          }
          if (!linkStatus.textContent?.trim()) {
            // the row is filled in by the game's readycount poll later; the
            // poll's reply has its own interceptor above
            logDiagnostic("field: home page row is blank");
            return;
          }
          await setFarmStatus(
            state,
            processFarmStatus(linkStatus),
            "home page"
          );
        },
      },
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.FARM_STATUS })],
        callback: async (state, previous, response) => {
          const raw = await response.text();
          const rawPlots = raw.split(";").filter((plot) => plot.trim());
          if (rawPlots.length === 0) {
            logDiagnostic("field: farmstatus feed empty, keeping status");
            return;
          }
          // A plot counts as planted if it has progress OR time left to run.
          // Progress alone is not enough: a crop planted seconds ago reports
          // 0%, so a fresh plant-all read as an entirely empty field and put
          // the banner up on the way out of the farm — the "I planted, and then
          // it told me the fields were empty" report. The old length check
          // (fewer entries than plots -> EMPTY) is gone with it: it compared
          // this feed against a count parsed out of unrelated summary text, and
          // a partly planted field is not what "Fields are empty!" means.
          let status: CropStatus = CropStatus.EMPTY;
          let readyAt = Number.POSITIVE_INFINITY;
          for (const plot of rawPlots) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [plotId, percent, secondsLeft, secondsSince] =
              plot.split("-");
            const percentReady = Number(percent);
            const remaining = Number(secondsLeft);
            if (percentReady >= 100) {
              status = CropStatus.READY;
              readyAt = Date.now();
              break;
            } else if (percentReady > 0 || remaining > 0) {
              status = CropStatus.GROWING;
              // this feed is the only one that knows the real countdown
              readyAt = Math.min(
                readyAt,
                Date.now() + (remaining > 0 ? remaining : 60) * 1000
              );
            }
          }
          await setFarmStatus(
            state,
            { ...previous, count: previous?.count ?? 0, status, readyAt },
            "farmstatus feed"
          );
        },
      },
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.HARVEST_ALL })],
        callback: async (state, previous, response) => {
          await setFarmStatus(
            state,
            {
              ...previous,
              count: previous?.count ?? 0,
              status: CropStatus.EMPTY,
              readyAt: Number.POSITIVE_INFINITY,
            },
            "harvest all"
          );
          const { drops } = (await response.json()) as {
            result: "success";
            drops: Record<
              Item["id"],
              {
                name: Item["name"];
                img: string;
                qty: number;
              }
            >;
          };
          const [page] = getPage();
          const settings = await getSettingValues();
          if (page !== Page.FARM || settings[SettingId.HARVEST_NOTIFICATIONS]) {
            showPopup({
              title: "Harvested Crops",
              contentHTML: `
              ${Object.values(drops)
                .map(
                  (drop) => `
                    <img
                      src="${drop.img}"
                      style="
                        vertical-align: middle;
                        width: 18px;
                      "
                    >
                    (x${drop.qty})
                  `
                )
                .join("&nbsp;")}
            `,
              actions: [
                {
                  name: "Replant",
                  buttonClass: "btnblue",
                  callback: () => replantAll(page === Page.FARM),
                },
              ],
            });
          }
        },
      },
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.PLANT_ALL })],
        callback: async (state, previous) => {
          // How long the new crop takes is not in this reply; read the farm
          // page for it in a minute rather than keeping the old readyAt.
          await setFarmStatus(
            state,
            {
              ...previous,
              count: previous?.count ?? 0,
              status: CropStatus.GROWING,
              readyAt: Date.now() + 60 * 1000,
            },
            "plant all"
          );
        },
      },
    ],
  }
);

const updateStatus = async (): Promise<void> => {
  const state = farmStatusState.read();
  if (!state) {
    return;
  }
  if (state.status !== CropStatus.READY && state.readyAt <= Date.now()) {
    // time's up — verify against the real farm page instead of assuming ready
    logDiagnostic("field: timer up, re-reading the farm page");
    await farmStatusState.get({ ignoreCache: true });
  }
};

// One pending re-check, moved to wherever the latest status says it belongs.
// This was a map keyed by readyAt, meant to stop the same moment being
// scheduled twice -- but nothing ever removed a key once its timer had fired,
// so a later status that carried the same readyAt scheduled NOTHING. That is
// every harvest and plant: both spread `...previous`, so the GROWING set after
// a replant kept the harvest's readyAt (already in the past, already in the
// map) and the farm page was never re-read. On the web the game's own
// readycount poll papered over it, since Reed sits on the home page where
// that poll runs; a phone that has navigated away from home never gets one,
// and the crop status stuck at "growing" for the session -- no harvest banner.
let pendingUpdate: NodeJS.Timeout | undefined;

farmStatusState.onUpdate((state) => {
  clearTimeout(pendingUpdate);
  pendingUpdate = undefined;
  if (
    !state ||
    state.status === CropStatus.READY ||
    state.readyAt === Number.POSITIVE_INFINITY
  ) {
    return;
  }
  pendingUpdate = setTimeout(
    updateStatus,
    Math.max(0, state.readyAt - Date.now())
  );
});

const processFarmId = (root: HTMLElement): number | undefined => {
  const farmIdRaw = root.querySelector("#farm")?.textContent;
  return farmIdRaw ? Number(farmIdRaw) : undefined;
};

export const farmIdState = new CachedState<number>(
  StorageKey.FARM_ID,
  async () => {
    const response = await getHTML(Page.FARM, new URLSearchParams());
    return processFarmId(response.body);
  },
  {
    timeout: Number.POSITIVE_INFINITY,
    defaultState: -1,
    interceptors: [
      {
        match: [Page.FARM, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          await state.set(processFarmId(root.body));
        },
      },
      {
        match: [Page.HOME_PATH, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          const status = root.body.querySelector<HTMLDivElement>(
            "a[href^='xfarm.php'] .item-after span"
          );
          if (!status) {
            return;
          }
          await state.set(Number(status.dataset.id));
        },
      },
    ],
  }
);

// Which set a harvest or a replant should roll under: the one named "Farming",
// or Default when there is no such set -- where most players, Reed included,
// keep their farm perks. Undefined when auto-manage is off, which leaves the
// perks exactly as they are and just does the action.
//
// Resolved INSIDE the gated task (runGatedAction calls this when the task
// reaches the front of the perk queue), so it reads settings and sets as they
// are at the moment of the switch rather than when the button was clicked.
const getFarmingPerks = async (): Promise<PerkSet | undefined> => {
  const settings = await getSettingValues();
  if (!settings[SettingId.PERK_MANAGER]) {
    return undefined;
  }
  return (
    (await getActivityPerksSet(PerkActivity.FARMING)) ??
    (await getActivityPerksSet(PerkActivity.DEFAULT))
  );
};

// Harvesting and replanting are GATED ACTIONS: the yield depends on the perks
// equipped at the moment the request lands, so the switch and the request run
// as one task on the perk queue (see runGatedAction). Nothing else can switch
// perks in between -- which is what went wrong harvesting from the crops-ready
// banner away from the farm: the switch was serialised but the harvest was not,
// so a page reconcile could start its resetperks() while the harvest was in
// flight and the crops came in with no perks applied at all, one per plot.
//
// Afterwards the perks are LEFT on the farm set -- no restore. This is how
// the wrap worked from the start (1.0.40): switch to Default if it isn't on,
// harvest, done; the next page you land on reconciles to whatever it calls
// for. 1.1.55-1.1.61 restored the page's own set right after the reply, and
// Reed watched it undo the switch before the harvest had visibly landed
// ("Default never turns green before the harvest is run"), then grow a 2 s
// settle, a verify read and a 1.5 s hold trying to make that safe. Reed's
// call: go back to leaving it. The cost is Default staying on in town until
// you navigate, which the reconciler fixes on the next page transition.
//
// It stays snappy where it always was: apply() short-circuits when the set is
// already confirmed equipped, so harvesting from Home or the farm -- where the
// reconciler has already put Default on -- costs zero requests.
export const harvestAll = (): Promise<void> =>
  runGatedAction({
    label: "harvest",
    set: getFarmingPerks,
    restore: false,
    action: async () => {
      const farmId = await farmIdState.get();
      await getJSON(
        Page.WORKER,
        new URLSearchParams({
          go: WorkerGo.HARVEST_ALL,
          id: String(farmId),
        })
      );
    },
  });

// `fromFarmPage`: on the farm we click the game's own Plant All button so its
// UI updates, and a click is fire-and-forget -- the game runs its own request
// and we never see it finish. `holdMs` keeps the perk queue held for that
// window so nothing switches perks out from under it; away from the farm we
// fire the request ourselves and can simply await it.
const PLANT_CLICK_HOLD_MS = 1500;

export const replantAll = async (fromFarmPage: boolean): Promise<void> => {
  const farmId = await farmIdState.get();
  if (!farmId) {
    console.error("No farm id found");
    return;
  }
  await runGatedAction({
    label: "replant",
    set: getFarmingPerks,
    restore: false,
    holdMs: fromFarmPage ? PLANT_CLICK_HOLD_MS : 0,
    action: async () => {
      if (fromFarmPage) {
        document.querySelector<HTMLAnchorElement>(".plantallbtn")?.click();
        return;
      }
      await getHTML(
        Page.WORKER,
        new URLSearchParams({
          go: WorkerGo.PLANT_ALL,
          id: String(farmId),
        })
      );
    },
  });
};
