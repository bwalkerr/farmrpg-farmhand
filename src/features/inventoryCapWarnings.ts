import { CachedState } from "~/utils/state";
import { Feature, FeatureSetting } from "../utils/feature";
import { getCurrentPage, Page } from "~/utils/page";
import {
  getHTML,
  parseUrl,
  registerQueryInterceptor,
} from "~/api/farmrpg/utils/requests";
import {
  getRowCount,
  parseInventoryPage,
  publishInventoryPage,
} from "~/api/farmrpg/apis/inventory";
import { Responselike } from "~/utils/requests";
import { SettingId } from "~/utils/settings";
import { TEXT_ERROR, TEXT_WARNING } from "~/utils/theme";

const SETTING_INVENTORY_CAP_WARNINGS: FeatureSetting = {
  id: SettingId.INVENTORY_CAP_WARNINGS,
  title: "Inventory: Cap warnings",
  description:
    "Highlight items at or near your inventory cap so drops don't go to waste",
  type: "boolean",
  defaultValue: true,
};

const SETTING_INVENTORY_CAP_TRACKER: FeatureSetting = {
  id: SettingId.INVENTORY_CAP_TRACKER,
  title: "Inventory: Cap tracker",
  description: `
    Track items at or near your inventory cap: a count on the Farmhand button
    and a Cap tab in the briefing panel, filtered to what drops where you are
  `,
  type: "boolean",
  defaultValue: true,
};

const NEAR_CAP_RATIO = 0.9;
const PASSIVE_REFRESH_MS = 10 * 60 * 1000;
const ACTIVE_DEBOUNCE_MS = 1500;
const ACTIVE_MIN_INTERVAL_MS = 15 * 1000;

export interface CapItem {
  count: number;
  href: string;
  image?: string;
  isAtCap: boolean;
  name: string;
}

interface CapTrackerState {
  cap: number;
  isFetching: boolean;
  items: CapItem[];
  updatedAt: number;
}

const capTrackerState: CapTrackerState = {
  cap: 0,
  isFetching: false,
  items: [],
  updatedAt: 0,
};

const isInventoryPage = (): boolean =>
  (window.location.hash || window.location.pathname).includes("inventory.php");

// narrow a parsed inventory page down to the at/near-cap rows. The parse
// itself is shared with the craft planner (api/farmrpg/apis/inventory), which
// wants every row; this is the only consumer that filters.
const collectCapItems = (
  root: HTMLElement
): { cap: number; items: CapItem[] } | undefined => {
  const page = parseInventoryPage(root);
  if (!page) {
    return undefined;
  }
  // the planner rides along on whatever fetch or page render got us here
  // rather than issuing an inventory request of its own
  publishInventoryPage(page);
  const { cap, rows } = page;
  const items: CapItem[] = [];
  for (const row of rows) {
    if (row.count === 0 || row.count < cap * NEAR_CAP_RATIO) {
      continue;
    }
    items.push({
      count: row.count,
      href: row.href,
      image: row.image,
      isAtCap: row.count >= cap,
      name: row.name,
    });
  }
  return { cap, items };
};

const imageBasename = (source: string): string =>
  (source.split("/").pop() ?? "").split("?")[0];

// per-location drop lists, learned from the game's own explore/fishing
// responses (the location pages themselves don't list what drops there).
// persisted so each location only needs to be learned once.
const LOCATION_DROPS_KEY = "fhCapTrackerLocationDrops";
let locationDrops: Record<string, string[]> = {};
let locationDropsLoaded = false;

const loadLocationDrops = (): void => {
  if (locationDropsLoaded) {
    return;
  }
  locationDropsLoaded = true;
  GM.getValue<Record<string, string[]>>(LOCATION_DROPS_KEY, {})
    .then((value) => {
      locationDrops = value ?? {};
      scheduleRender();
    })
    .catch(() => {
      // ignore failures; stale data is fine here
    });
};

// which worker actions teach us drops, and the location type they belong to
const LEARN_ACTION_TYPES: Record<string, string> = {
  explore: "explore",
  fishcaught: "fishing",
  castnet: "fishing",
};

const learnLocationDrops = (actionGo: string, response: Responselike): void => {
  const type = LEARN_ACTION_TYPES[actionGo];
  if (!type) {
    return;
  }
  const [, query] = parseUrl(response.url);
  const id = query.get("id");
  if (!id) {
    return;
  }
  response
    .text()
    .then((html) => {
      const key = `${type}:${id}`;
      const existing = new Set(locationDrops[key] ?? []);
      let changed = false;
      for (const match of html.matchAll(/img\/items\/([^"'?]+)/g)) {
        if (!existing.has(match[1])) {
          existing.add(match[1]);
          changed = true;
        }
      }
      if (changed) {
        locationDrops[key] = [...existing];
        GM.setValue(LOCATION_DROPS_KEY, locationDrops as any);
        scheduleRender();
      }
    })
    .catch(() => {
      // ignore failures; stale data is fine here
    });
};

// current location key when on a fishing or explore page
const getLocationKey = (): string | undefined => {
  const url = window.location.hash || window.location.pathname;
  let match = url.match(/fishing\.php\?[^#]*\bid=(\d+)/);
  if (match) {
    return `fishing:${match[1]}`;
  }
  match = url.match(/area\.php\?[^#]*\bid=(\d+)/);
  if (match) {
    return `explore:${match[1]}`;
  }
  // mining.php?id=N is the dig board itself (mine.php is the mine list),
  // so the key works for any number of mines
  match = url.match(/mining\.php\?[^#]*\bid=(\d+)/);
  if (match) {
    return `mining:${match[1]}`;
  }
  return undefined;
};

// digging reveals a found item as an image tile on the dig board: a
// discovered cell (.checkCell) holds an <img> of the item, which is the same
// signal the auto-miner reads to spot discoveries. learn a mine's drops
// straight off the board, restricted to img/items/ paths so only real item
// icons are learned (misses/hits/traps render font icons, not item images),
// and so the learned basenames match the inventory rows we filter against.
const learnFromMiningPage = (key: string): void => {
  const existing = new Set(locationDrops[key] ?? []);
  let changed = false;
  const root = getCurrentPage() ?? document;
  for (const image of root.querySelectorAll<HTMLImageElement>(
    ".checkCell img[src*='img/items/']"
  )) {
    const name = imageBasename(image.getAttribute("src") ?? "");
    if (name && !existing.has(name)) {
      existing.add(name);
      changed = true;
    }
  }
  if (changed) {
    locationDrops[key] = [...existing];
    GM.setValue(LOCATION_DROPS_KEY, locationDrops as any);
    scheduleRender();
  }
};

// explore/fishing drops arrive via intercepted responses, but a mine's drops
// are only visible as tiles on the board, so scrape them whenever a mine page
// is (re)shown. kept separate from rendering so the render stays a pure paint.
const learnCurrentLocation = (): void => {
  const key = getLocationKey();
  if (key?.startsWith("mining:")) {
    learnFromMiningPage(key);
  }
};

// What the tracker knows, for whoever draws it. The tracker used to draw
// itself -- a row of icons in the bottom stats bar -- and that row is gone:
// it was up to twenty icons wide in a bar that also holds the currency counts
// and the perk pill, it could not be drawn on a phone at all, and the briefing
// panel is where every other "what wants you" list already lives. The panel
// now owns the drawing (a Cap tab, and a count on its button); this module
// owns the data and says when it changed.
export interface CapTrackerView {
  cap: number;
  isEnabled: boolean;
  // everything at or near cap, at-cap first
  items: readonly CapItem[];
  // the subset that drops where you are, once this location's drops have been
  // learned; undefined when you are not somewhere with drops, or it has not
  // been learned yet (then `items` is the honest answer)
  here?: readonly CapItem[];
  isFetching: boolean;
  updatedAt: number;
}

export const getCapTrackerView = (): CapTrackerView => {
  const key = getLocationKey();
  const learned = key ? locationDrops[key] : undefined;
  const here =
    learned && learned.length > 0
      ? capTrackerState.items.filter(
          (item) => item.image && learned.includes(imageBasename(item.image))
        )
      : undefined;
  return {
    cap: capTrackerState.cap,
    here,
    isEnabled: isTrackerEnabled,
    isFetching: capTrackerState.isFetching,
    items: capTrackerState.items,
    updatedAt: capTrackerState.updatedAt,
  };
};

const capTrackerListeners: (() => void)[] = [];

export const onCapTrackerChange = (listener: () => void): void => {
  capTrackerListeners.push(listener);
};

const notifyCapTracker = (): void => {
  for (const listener of capTrackerListeners) {
    listener();
  }
};

// The panel's own refresh control: read the inventory now, regardless of the
// passive interval.
export const refreshCapTrackerNow = (): Promise<void> => fetchCapTrackerNow();

// every state change funnels through here: mutate, then announce it. Notices
// coalesce into a single microtask, so a burst of mutations announces once and
// no mutation site has to remember to do it.
let isRenderScheduled = false;
const scheduleRender = (): void => {
  if (isRenderScheduled) {
    return;
  }
  isRenderScheduled = true;
  queueMicrotask(() => {
    isRenderScheduled = false;
    notifyCapTracker();
  });
};

const updateFromRoot = (root: HTMLElement): void => {
  const result = collectCapItems(root);
  if (!result) {
    return;
  }
  capTrackerState.cap = result.cap;
  capTrackerState.items = result.items;
  capTrackerState.updatedAt = Date.now();
  scheduleRender();
};

const fetchCapTrackerNow = async (): Promise<void> => {
  if (capTrackerState.isFetching) {
    return;
  }
  capTrackerState.isFetching = true;
  try {
    const response = await getHTML(Page.INVENTORY, new URLSearchParams());
    // mark updated even if parsing fails so we don't hammer the server
    // eslint-disable-next-line require-atomic-updates
    capTrackerState.updatedAt = Date.now();
    const result = collectCapItems(response.body);
    if (result) {
      // eslint-disable-next-line require-atomic-updates
      capTrackerState.cap = result.cap;
      // eslint-disable-next-line require-atomic-updates
      capTrackerState.items = result.items;
      scheduleRender();
    }
  } catch {
    // ignore fetch failures; the next refresh will retry
  } finally {
    // eslint-disable-next-line require-atomic-updates
    capTrackerState.isFetching = false;
  }
};

// passive background refresh, at most every 10 minutes
const refreshCapTracker = (): void => {
  if (Date.now() - capTrackerState.updatedAt < PASSIVE_REFRESH_MS) {
    return;
  }
  fetchCapTrackerNow();
};

// active refresh: while the player is fishing/exploring/harvesting/selling,
// the game's own worker.php calls trigger a debounced, throttled refresh —
// a short delay batches bursts of actions, and refreshes run at most every 15s
let isTrackerEnabled = false;
let activeTimer: NodeJS.Timeout | undefined;
let lastActiveFetchAt = 0;

const markCapTrackerActive = (): void => {
  if (!isTrackerEnabled || activeTimer) {
    return;
  }
  const wait = Math.max(
    ACTIVE_DEBOUNCE_MS,
    lastActiveFetchAt + ACTIVE_MIN_INTERVAL_MS - Date.now()
  );
  activeTimer = setTimeout(() => {
    activeTimer = undefined;
    lastActiveFetchAt = Date.now();
    fetchCapTrackerNow();
  }, wait);
};

// game actions that change inventory counts
const ACTION_GOS = [
  "fishcaught",
  "castnet",
  "sellalluserfish",
  "explore",
  "harvestall",
  "sellitem",
  "useitem",
  "openitem",
];

// interceptors only observe responses; no state is attached to them
const noopState = {
  get: (): Promise<undefined> => Promise.resolve(undefined),
} as unknown as CachedState<undefined>;

for (const actionGo of ACTION_GOS) {
  registerQueryInterceptor([
    noopState,
    {
      match: [Page.WORKER, new URLSearchParams({ go: actionGo })],
      callback: (_state, _previous, response) => {
        markCapTrackerActive();
        learnLocationDrops(actionGo, response);
        return Promise.resolve();
      },
    },
  ]);
}

// digging has no documented worker action, so while the player is in a mine
// treat any non-polling worker response as activity for the live refresh
const POLLING_GOS = new Set([
  "getchat",
  "getstats",
  "farmstatus",
  "readycount",
  "notes",
]);
registerQueryInterceptor([
  noopState,
  {
    match: [Page.WORKER, new URLSearchParams()],
    callback: (_state, _previous, response) => {
      const key = getLocationKey();
      if (key?.startsWith("mining:")) {
        const [, query] = parseUrl(response.url);
        if (!POLLING_GOS.has(query.get("go") ?? "")) {
          markCapTrackerActive();
          // the board repaints the discovered cell just after the response
          setTimeout(() => {
            learnFromMiningPage(key);
            scheduleRender();
          }, 400);
        }
      }
      return Promise.resolve();
    },
  },
]);

// quick sell / give / craft change inventory through the item page's own
// buttons rather than the worker actions above, so those clicks would otherwise
// leave the tracker stale. one delegated listener schedules the same throttled
// refresh for all three: it catches a direct click on the native button, and
// the quickSellSafely / perkManagement proxies each click through to that same
// native button, so their proxied clicks bubble here too.
const QUICK_ACTION_SELECTOR =
  ".quicksellbtn, .quicksellbtnnc, .quickgivebtn, .quickcraftbtn";
document.addEventListener(
  "click",
  (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest?.(QUICK_ACTION_SELECTOR)) {
      markCapTrackerActive();
    }
  },
  true
);

const renderInventoryCapWarnings = (): void => {
  const root = getCurrentPage();
  if (!root) {
    return;
  }
  const result = collectCapItems(root);
  if (!result) {
    return;
  }
  const { cap } = result;
  let atCap = 0;
  let nearCap = 0;
  for (const row of root.querySelectorAll<HTMLLIElement>(".list-group li")) {
    if (row.classList.contains("item-divider")) {
      continue;
    }
    const after = row.querySelector<HTMLElement>(".item-after");
    if (!after) {
      continue;
    }
    const count = getRowCount(after);
    if (Number.isNaN(count) || count === 0) {
      continue;
    }
    const isAtCap = count >= cap;
    const isNearCap = !isAtCap && count >= cap * NEAR_CAP_RATIO;
    if (isAtCap) {
      atCap += 1;
    } else if (isNearCap) {
      nearCap += 1;
    } else {
      continue;
    }
    if (after.querySelector(".fh-cap-badge")) {
      continue;
    }
    const badge = document.createElement("span");
    badge.classList.add("fh-cap-badge");
    badge.style.fontWeight = "bold";
    badge.style.marginLeft = "5px";
    badge.style.color = isAtCap ? TEXT_ERROR : TEXT_WARNING;
    badge.textContent = isAtCap ? "MAX" : "NEAR";
    after.append(badge);
  }
  const parts = [];
  if (atCap > 0) {
    const plural = atCap === 1 ? "" : "s";
    parts.push(`${atCap} item${plural} at the ${cap.toLocaleString()} cap`);
  }
  if (nearCap > 0) {
    parts.push(`${nearCap} near cap`);
  }
  let summary = root.querySelector<HTMLDivElement>(".fh-cap-summary");
  const list = root.querySelector(".list-group");
  if (!summary && list?.parentElement && parts.length > 0) {
    summary = document.createElement("div");
    summary.classList.add("fh-cap-summary");
    summary.style.padding = "8px 15px";
    summary.style.fontWeight = "bold";
    summary.style.color = TEXT_WARNING;
    list.parentElement.insertBefore(summary, list);
  }
  if (summary) {
    const text = parts.length > 0 ? `⚠ ${parts.join(" · ")}` : "";
    if (summary.textContent !== text) {
      summary.textContent = text;
    }
  }
};

export const inventoryCapWarnings: Feature = {
  settings: [SETTING_INVENTORY_CAP_WARNINGS, SETTING_INVENTORY_CAP_TRACKER],
  // The flag the Cap tab reads was set only by onPageLoad, so until the first
  // page dispatch had run -- or if it never ran -- the tab reported the
  // tracker as "off" over a setting that was on. Read the setting up front.
  onInitialize: (settings) => {
    isTrackerEnabled = Boolean(settings[SettingId.INVENTORY_CAP_TRACKER]);
  },
  onPageLoad: (settings) => {
    const isInventory = isInventoryPage();
    if (settings[SettingId.INVENTORY_CAP_WARNINGS] && isInventory) {
      renderInventoryCapWarnings();
    }
    isTrackerEnabled = Boolean(settings[SettingId.INVENTORY_CAP_TRACKER]);
    if (!isTrackerEnabled) {
      return;
    }
    loadLocationDrops();
    if (isInventory) {
      // refresh tracker data from the live inventory page for free
      const root = getCurrentPage();
      if (root) {
        updateFromRoot(root);
      }
    }
    learnCurrentLocation();
    scheduleRender();
    refreshCapTracker();
  },
  // the stats bar lives in the toolbar; re-mount if the game rewrites it
  onQuestLoad: (settings) => {
    if (!settings[SettingId.INVENTORY_CAP_TRACKER]) {
      return;
    }
    learnCurrentLocation();
    scheduleRender();
  },
};
