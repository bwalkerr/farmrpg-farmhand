import {
  activatePerkSet,
  getActivityPerksSet,
  PerkActivity,
} from "~/api/farmrpg/apis/perks";
import { CachedState, StorageKey } from "../../../utils/state";
import { getDocument } from "../../../utils/requests";
import { getHTML, getJSON } from "../utils/requests";
import { getPage, Page, WorkerGo } from "~/utils/page";
import { getSettingValues, SettingId } from "~/utils/settings";
import { Item } from "../../buddyfarm/types";
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

const processFarmStatus = (root: HTMLElement): FarmStatus | undefined => {
  const statusText = root.textContent;
  if (!statusText) {
    return {
      status: CropStatus.EMPTY,
      count: 0,
      readyAt: Number.POSITIVE_INFINITY,
    };
  }
  // 36 READY!
  const count = Number(statusText.split(" ")[0]);
  let status = CropStatus.EMPTY;
  let readyAt = Number.POSITIVE_INFINITY;
  if (statusText.toLowerCase().includes("growing")) {
    status = CropStatus.GROWING;
    // new sure when ready, check again in a minute
    readyAt = Date.now() + 60 * 1000;
  } else if (statusText.toLowerCase().includes("ready")) {
    status = CropStatus.READY;
    readyAt = Date.now();
  }
  return { status, count, readyAt };
};

const processFarmPage = (root: HTMLElement): FarmStatus | undefined => {
  const plots = root.querySelectorAll<HTMLAnchorElement>(
    "#croparea #crops .col-25"
  );
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

const scheduledUpdates: Record<number, NodeJS.Timeout> = {};

export const farmStatusState = new CachedState<FarmStatus>(
  StorageKey.FARM_STATUS,
  async () => {
    const response = await getHTML(Page.FARM, new URLSearchParams());
    return processFarmPage(response.body);
  },
  {
    timeout: 5,
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
          state.set(processFarmStatus(root.body));
        },
      },
      {
        match: [Page.FARM, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const root = await getDocument(response);
          await state.set(processFarmPage(root.body));
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
            return;
          }
          await state.set(processFarmStatus(linkStatus));
        },
      },
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.FARM_STATUS })],
        callback: async (state, previous, response) => {
          const raw = await response.text();
          const rawPlots = raw.split(";");
          if (rawPlots.length < (previous?.count ?? 4)) {
            await state.set({ ...previous, status: CropStatus.EMPTY });
            return;
          }
          let status: CropStatus = CropStatus.EMPTY;
          for (const plot of rawPlots) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [plotId, percent, secondsLeft, secondsSince] =
              plot.split("-");
            const percentReady = Number(percent);
            if (percentReady === 100) {
              status = CropStatus.READY;
              break;
            } else if (percentReady > 0) {
              status = CropStatus.GROWING;
            }
          }
          await state.set({ ...previous, status });
        },
      },
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.HARVEST_ALL })],
        callback: async (state, previous, response) => {
          await state.set({ ...previous, status: CropStatus.EMPTY });
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
                  callback: async () => {
                    const farmId = await farmIdState.get();
                    if (!farmId) {
                      console.error("No farm id found");
                      return;
                    }
                    await withFarmingPerks(async () => {
                      if (page === Page.FARM) {
                        document
                          .querySelector<HTMLAnchorElement>(".plantallbtn")
                          ?.click();
                      } else {
                        await getHTML(
                          Page.WORKER,
                          new URLSearchParams({
                            go: WorkerGo.PLANT_ALL,
                            id: String(farmId),
                          })
                        );
                      }
                    });
                  },
                },
              ],
            });
          }
        },
      },
      {
        match: [Page.WORKER, new URLSearchParams({ go: WorkerGo.PLANT_ALL })],
        callback: async (state, previous) => {
          await state.set({ ...previous, status: CropStatus.GROWING });
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
  if (state.status !== CropStatus.READY && state.readyAt < Date.now()) {
    // time's up — verify against the real farm page instead of assuming ready
    await farmStatusState.get({ ignoreCache: true });
  }
};

// automatically update crops when finished
farmStatusState.onUpdate((state) => {
  if (!state) {
    return;
  }
  if (scheduledUpdates[state.readyAt]) {
    return;
  }
  scheduledUpdates[state.readyAt] = setTimeout(
    updateStatus,
    state.readyAt - Date.now()
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

// Makes sure the right perks are equipped for a harvest/replant roll, then
// rolls it. The farm perks are whichever set is named "Farming", or Default
// when there's no such set (where most players, Reed included, keep them).
//
// This is a GATED ACTION — the harvest is fired the instant the switch resolves
// and its yield depends on the perks — so it uses the same contract as the item
// page quick actions: `force` (the optimistic active-set cache drifts, and when
// it wrongly reads "already on" the switch is skipped and the harvest rolls
// under whatever is really equipped) and `settle` (the game acks
// activateperkset BEFORE it finishes equipping, so an action fired immediately
// after runs under the OLD perks). That is exactly what went wrong harvesting
// from the crops-ready banner on an item page: the quick-sell/craft set is left
// equipped there on purpose, so the harvest was a real cross-set switch and,
// unsettled, rolled under the selling/crafting perks.
//
// It stays snappy where it always was: activatePerkSet short-circuits on
// `confirmedEquippedSetId` BEFORE it looks at `force`, so harvesting from Home
// or the farm — where the reconciler has already confirmed Default equipped —
// costs zero requests. Only a genuine cross-set harvest pays the settle.
export const withFarmingPerks = async (
  action: () => Promise<void>
): Promise<void> => {
  const settings = await getSettingValues();
  if (!settings[SettingId.PERK_MANAGER]) {
    await action();
    return;
  }
  const farmingPerks = await getActivityPerksSet(PerkActivity.FARMING);
  const defaultPerks = await getActivityPerksSet(PerkActivity.DEFAULT);
  const harvestPerks = farmingPerks ?? defaultPerks;
  if (harvestPerks) {
    await activatePerkSet(harvestPerks, { force: true, settle: true });
  }
  await action();
  // Only a dedicated Farming set needs putting away; without one we harvested
  // under Default and are already where the reconciler wants us. No settle and
  // no reset here — nothing reads the perks after this, so the clean-slate
  // round-trip would only add the lag that made harvest feel slow before.
  if (farmingPerks && defaultPerks) {
    await activatePerkSet(defaultPerks, { reset: false });
  }
};

export const harvestAll = (): Promise<void> =>
  withFarmingPerks(async () => {
    const farmId = await farmIdState.get();
    await getJSON(
      Page.WORKER,
      new URLSearchParams({ go: WorkerGo.HARVEST_ALL, id: String(farmId) })
    );
  });
