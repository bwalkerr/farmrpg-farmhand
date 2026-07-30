import {
  BORDER_GRAY,
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import { CachedState } from "~/utils/state";
import { Feature, FeatureSetting } from "../utils/feature";
import { getCurrentPage, Page } from "~/utils/page";
import {
  getHTML,
  parseUrl,
  registerQueryInterceptor,
} from "~/api/farmrpg/utils/requests";
import { isMobileLayout, onLayoutChange } from "~/utils/layout";
import { Responselike } from "~/utils/requests";
import { SettingId } from "~/utils/settings";

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
  title: "Inventory: Cap tracker box",
  description: `
    Show items at or near your inventory cap in a small box above the bottom
    bar; click an item to open its page
  `,
  type: "boolean",
  defaultValue: true,
};

// e.g. "you cannot store more than 200 of any one item"
const INVENTORY_CAP_PATTERN = /more than ([\d,]+) of any/g;
const NEAR_CAP_RATIO = 0.9;
const MAX_TRACKER_ITEMS = 20;
const PASSIVE_REFRESH_MS = 10 * 60 * 1000;
const ACTIVE_DEBOUNCE_MS = 1500;
const ACTIVE_MIN_INTERVAL_MS = 15 * 1000;

interface CapItem {
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

// count text of an inventory row, excluding any badge we appended
const getRowCount = (after: HTMLElement): number => {
  const countText = [...after.childNodes]
    .filter(
      (node) =>
        !(
          node instanceof HTMLElement && node.classList.contains("fh-cap-badge")
        )
    )
    .map((node) => node.textContent ?? "")
    .join("");
  return Number(countText.replaceAll(",", "").trim());
};

// parse cap and at/near-cap items out of an inventory page DOM
const collectCapItems = (
  root: HTMLElement
): { cap: number; items: CapItem[] } | undefined => {
  // the page can mention several caps (e.g. the wagon upgrade pitch quotes
  // the next tier's number), so use the smallest match: that is always the
  // player's current cap
  const caps = [...(root.textContent ?? "").matchAll(INVENTORY_CAP_PATTERN)]
    .map((match) => Number(match[1].replaceAll(",", "")))
    .filter((value) => value > 0);
  if (caps.length === 0) {
    return undefined;
  }
  const cap = Math.min(...caps);
  const items: CapItem[] = [];
  for (const row of root.querySelectorAll<HTMLLIElement>(".list-group li")) {
    if (row.classList.contains("item-divider")) {
      continue;
    }
    const after = row.querySelector<HTMLElement>(".item-after");
    const link =
      row.querySelector<HTMLAnchorElement>("a.item-link") ??
      row.querySelector<HTMLAnchorElement>("a");
    if (!after || !link) {
      continue;
    }
    const count = getRowCount(after);
    if (Number.isNaN(count) || count === 0 || count < cap * NEAR_CAP_RATIO) {
      continue;
    }
    const image = row.querySelector<HTMLImageElement>(".item-media img");
    const title = row.querySelector<HTMLElement>(".item-title");
    items.push({
      count,
      href: link.getAttribute("href") ?? "inventory.php",
      image: image?.getAttribute("src") ?? undefined,
      isAtCap: count >= cap,
      name: title?.textContent?.trim() ?? "Item",
    });
  }
  return { cap, items };
};

const renderTrackerItem = (item: CapItem): HTMLAnchorElement => {
  const anchor = document.createElement("a");
  anchor.href = item.href;
  const count = item.count.toLocaleString();
  const cap = capTrackerState.cap.toLocaleString();
  anchor.title = `${item.name}: ${count} / ${cap}`;
  anchor.style.display = "block";
  anchor.style.lineHeight = "0";
  anchor.style.borderRadius = "5px";
  anchor.style.border = `2px solid ${item.isAtCap ? TEXT_ERROR : TEXT_WARNING}`;
  if (item.image) {
    const icon = document.createElement("img");
    icon.src = item.image;
    icon.style.width = "22px";
    icon.style.height = "22px";
    icon.style.borderRadius = "3px";
    icon.style.display = "block";
    anchor.append(icon);
  } else {
    anchor.style.lineHeight = "22px";
    anchor.style.padding = "0 4px";
    anchor.style.fontSize = "12px";
    anchor.style.color = TEXT_WHITE;
    anchor.textContent = item.name;
  }
  return anchor;
};

const imageBasename = (source: string): string =>
  (source.split("/").pop() ?? "").split("?")[0];

// per-location drop lists, learned from the game's own explore/fishing
// responses (the location pages themselves don't list what drops there).
// persisted so each location only needs to be learned once.
const LOCATION_DROPS_KEY = "fhCapTrackerLocationDrops";
let locationDrops: Record<string, string[]> = {};
let locationDropsLoaded = false;

const COLLAPSED_KEY = "fhCapTrackerCollapsed";
let isCollapsed = false;

const setCollapsed = (value: boolean): void => {
  isCollapsed = value;
  GM.setValue(COLLAPSED_KEY, value);
  scheduleRender();
};

const loadLocationDrops = (): void => {
  if (locationDropsLoaded) {
    return;
  }
  locationDropsLoaded = true;
  GM.getValue<boolean>(COLLAPSED_KEY, false)
    .then((value) => {
      isCollapsed = Boolean(value);
      scheduleRender();
    })
    .catch(() => {
      // ignore load failures; default to expanded
    });
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

const renderCapTracker = (): void => {
  let box = document.querySelector<HTMLDivElement>("#fh-cap-tracker");

  // Not on a phone. The row is up to 20 item icons wide and the phone's stats
  // bar has room for the currency counts and the game's own buttons and nothing
  // else, so wherever it's put it either overflows the bar or pushes the counts
  // off it. Collapsing it by default would fit, but it isn't what's wanted here:
  // this branch exists to look at the perk marker on a phone, and the tracker is
  // the thing crowding it out. The inventory page's own MAX/NEAR badges are a
  // separate feature and are unaffected — the cap information is still there,
  // just not in the bar.
  if (isMobileLayout()) {
    box?.remove();
    return;
  }

  const key = getLocationKey();
  const learned = key ? locationDrops[key] : undefined;
  // filter to this location's known drops; before a location has been
  // learned (first visit), show everything rather than nothing
  const visible =
    learned && learned.length > 0
      ? capTrackerState.items.filter(
          (item) => item.image && learned.includes(imageBasename(item.image))
        )
      : capTrackerState.items;
  if (visible.length === 0) {
    box?.remove();
    return;
  }
  if (!box) {
    box = document.createElement("div");
    box.id = "fh-cap-tracker";
    box.classList.add("fh-cap-tracker");
    box.style.gap = "4px";
    box.style.pointerEvents = "auto";
    const statsZone = document.querySelector("#statszone_main");
    if (statsZone) {
      // single line in the bottom bar, right of the currency counts
      box.style.display = "inline-flex";
      box.style.flexWrap = "nowrap";
      box.style.verticalAlign = "middle";
      box.style.marginLeft = "14px";
      statsZone.append(box);
    } else {
      box.style.display = "flex";
      box.style.flexWrap = "wrap";
      box.style.justifyContent = "flex-end";
      box.style.maxWidth = "180px";
      box.style.padding = "5px 6px";
      box.style.borderRadius = "6px";
      box.style.border = `1px solid ${BORDER_GRAY}`;
      box.style.backgroundColor = "rgba(20, 20, 20, 0.92)";
      box.style.position = "fixed";
      box.style.right = "8px";
      box.style.bottom = "62px";
      box.style.zIndex = "5000";
      document.body.append(box);
    }
  }
  const shown = visible.slice(0, MAX_TRACKER_ITEMS);
  const signature = JSON.stringify([
    capTrackerState.cap,
    visible.length,
    isCollapsed,
    shown,
  ]);
  if (box.dataset.fhSignature === signature) {
    return;
  }
  box.dataset.fhSignature = signature;
  box.innerHTML = "";
  if (isCollapsed) {
    const atCapCount = visible.filter((item) => item.isAtCap).length;
    const nearCapCount = visible.length - atCapCount;
    const summary = document.createElement("span");
    summary.style.cursor = "pointer";
    summary.style.display = "inline-flex";
    summary.style.gap = "6px";
    summary.style.alignItems = "center";
    summary.style.fontWeight = "bold";
    summary.title = `${atCapCount} at cap · ${nearCapCount} near cap — click to expand`;
    const atCapNumber = document.createElement("span");
    atCapNumber.style.color = TEXT_ERROR;
    atCapNumber.textContent = String(atCapCount);
    const nearCapNumber = document.createElement("span");
    nearCapNumber.style.color = TEXT_WARNING;
    nearCapNumber.textContent = String(nearCapCount);
    summary.append(atCapNumber, nearCapNumber);
    summary.addEventListener("click", () => setCollapsed(false));
    box.append(summary);
    return;
  }
  for (const item of shown) {
    box.append(renderTrackerItem(item));
  }
  if (visible.length > shown.length) {
    const more = document.createElement("a");
    more.href = "inventory.php";
    more.textContent = `+${visible.length - shown.length}`;
    more.title = "More items at/near cap — open inventory";
    more.style.color = TEXT_WARNING;
    more.style.fontWeight = "bold";
    more.style.fontSize = "12px";
    more.style.alignSelf = "center";
    more.style.padding = "0 3px";
    box.append(more);
  }
  const collapseButton = document.createElement("span");
  collapseButton.textContent = "\u2212";
  collapseButton.title = "Collapse";
  collapseButton.style.cursor = "pointer";
  collapseButton.style.color = TEXT_GRAY;
  collapseButton.style.fontWeight = "bold";
  collapseButton.style.fontSize = "14px";
  collapseButton.style.alignSelf = "center";
  collapseButton.style.padding = "0 3px";
  collapseButton.addEventListener("click", () => setCollapsed(true));
  box.append(collapseButton);
};

// every state change funnels through here: mutate, then ask for a repaint.
// renders coalesce into a single microtask, so a burst of mutations repaints
// once and no mutation site has to remember to call the renderer.
let isRenderScheduled = false;
const scheduleRender = (): void => {
  if (isRenderScheduled) {
    return;
  }
  isRenderScheduled = true;
  queueMicrotask(() => {
    isRenderScheduled = false;
    renderCapTracker();
  });
};

// Crossing the breakpoint changes whether the row is drawn at all, and nothing
// else would repaint it — so rotating a phone, or dragging a desktop window
// narrow, would otherwise leave the tracker in whichever shape it mounted in.
onLayoutChange(scheduleRender);

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
