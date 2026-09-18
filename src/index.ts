import { autocomplete } from "./utils/autocomplete";
import { autocompleteItems } from "./features/autocompleteItems";
import { autocompleteUsers } from "./features/autocompleteUsers";
import { banker } from "./features/banker";
import { briefingPanel } from "./features/briefingPanel";
import { buddyFarm } from "~/features/buddyfarm";
import { chatMailboxStats } from "./features/mailboxInChat";
import { chatNav } from "./features/chatNav";
import { cleanupExplore } from "./features/cleanupExplore";
import { cleanupHome } from "./features/cleanupHome";
import { collapseItemImage } from "./features/collapseItemImage";
import { compactSilver } from "./features/compactSilver";
import { compressChat } from "./features/compressChat";
import { confirmations } from "./utils/confirmation";
import { craftPlanner } from "./features/craftPlanner";
import { craftworksAdvisor } from "./features/craftworksAdvisor";
import { customNavigation, NavigationItem } from "./features/customNavigation";
import { dismissableChatBanners } from "./features/dismissableChatBanners";
import { exploreFirst } from "./features/exploreFirst";
import { farmhandSettings } from "./features/farmhandSettings";
import { fieldNotifications } from "./features/harvestNotifications";
import { fishinInBarrel } from "./features/fishInBarrel";
import { fleaMarket } from "./features/fleaMarket";
import { getCurrentPage, getHashPage, getPage } from "~/utils/page";
import { getSettingValues, registerSettings } from "./utils/settings";
import { highlightSelfInChat } from "./features/highlightSelfInChat";
import { improvedInputs } from "./features/improvedInputs";
import { inventoryCapWarnings } from "./features/inventoryCapWarnings";
import { itemNeeds } from "./features/itemNeeds";
import { kitchenNotifications } from "./features/kitchenNotifications";
import { linkifyQuickCraft } from "./features/linkifyQuickCraft";
import { logDiagnostic, logFailure } from "~/utils/diagnostics";
import { mailboxNotifications } from "./features/mailboxNotifications";
import { maxContainers } from "./features/maxContainers";
import { maxCows } from "./features/maxCows";
import { maxPigs } from "./features/maxPigs";
import { mealNotifications } from "./features/mealNotifications";
import { miner } from "./features/miner";
import { moveUpdateToTop } from "./features/moveUpdateToTop";
import { navigationStyle } from "./features/compressNavigation";
import { notifications } from "./utils/notifications";
import { perkManagment } from "./features/perkManagement";
import { petNotifications } from "./features/petNotifications";
import { popups } from "./utils/popup";
import {
  queryInterceptors,
  urlMatches,
  watchQueries,
} from "./api/farmrpg/utils/requests";
import { questCollapse } from "./features/questCollapse";
import { quests } from "./features/quests";
import { questTagging } from "./features/questTagging";
import { quicksellSafely } from "./features/quickSellSafely";
import { vaultSolver } from "./features/vaultSolver";
import { versionManager } from "./features/versionManager";

const FEATURES = [
  // internal
  notifications,
  confirmations,
  popups,
  autocomplete,
  versionManager,

  // UI
  improvedInputs,
  briefingPanel,

  // home
  cleanupHome,
  moveUpdateToTop,

  // kitchen
  kitchenNotifications,
  mealNotifications,

  // farm,
  fieldNotifications,
  maxPigs,
  maxCows,

  // flea market
  fleaMarket,

  // items
  buddyFarm,
  collapseItemImage,
  quicksellSafely,
  linkifyQuickCraft,
  exploreFirst,
  craftPlanner,
  itemNeeds,

  // craftworks
  craftworksAdvisor,

  // inventory
  inventoryCapWarnings,

  // quests
  quests,
  questCollapse,
  questTagging,
  compactSilver,

  // bank
  banker,

  // mailbox
  mailboxNotifications,

  // pets
  petNotifications,

  // vault
  vaultSolver,

  // mining
  miner,

  // locksmith
  maxContainers,

  // fishing
  fishinInBarrel,

  // explore
  perkManagment,
  cleanupExplore,

  // chat
  chatNav,
  compressChat,
  dismissableChatBanners,
  highlightSelfInChat,
  autocompleteItems,
  autocompleteUsers,
  chatMailboxStats,

  // nav
  navigationStyle,
  customNavigation,

  // settings
  farmhandSettings,
];

for (const feature of FEATURES) {
  registerSettings(...(feature.settings ?? []));
}

// Features have no name of their own; the first setting they register is the
// nearest thing, and the ones without settings are the internal utilities.
const describeFeature = (feature: (typeof FEATURES)[number]): string =>
  feature.settings?.[0]?.id ?? `feature #${FEATURES.indexOf(feature)}`;

const watchSubtree = (
  selector: string,
  handler:
    | "onPageLoad"
    | "onChatLoad"
    | "onMenuLoad"
    | "onQuestLoad"
    | "onNotificationLoad",
  filter?: string
): void => {
  const target = document.querySelector(selector);
  if (!target) {
    console.error(`${selector} not found`);
    logDiagnostic(`watch: ${selector} not found (${handler} never fires)`);
    return;
  }
  const handle = async (): Promise<void> => {
    let settings;
    try {
      settings = await getSettingValues();
    } catch (error) {
      logFailure(`${handler}: reading settings failed`, error);
      return;
    }
    const [page, parameters] = getPage();
    // console.debug(`${selector} Load`, page, parameters);
    if (handler === "onPageLoad") {
      logDiagnostic(
        `onPageLoad: ${page ?? "?"} (route ${getHashPage() ?? "none"})`
      );
    }
    for (const feature of FEATURES) {
      // Each feature on its own: a hook that throws is logged and the loop
      // moves on. Uncontained, one bad hook silently skipped every feature
      // registered after it -- the cap tracker, the settings section, the
      // perk reconcile -- for that dispatch, with nothing on the page to say
      // so. On a phone there is no console to say so either.
      try {
        feature[handler]?.(settings, page, parameters);
      } catch (error) {
        logFailure(`${handler} failed in ${describeFeature(feature)}`, error);
      }
    }
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // only respond to tree changes
      if (mutation.type !== "childList") {
        continue;
      }
      if (mutation.addedNodes.length === 0) {
        continue;
      }
      const anyFirstPartyChanges = [...mutation.addedNodes].some((node) =>
        (node as HTMLElement).className?.includes("fh")
      );
      if (anyFirstPartyChanges) {
        continue;
      }
      if (filter) {
        for (const node of mutation.addedNodes) {
          if ((node as HTMLElement).matches?.(filter)) {
            handle();
          }
        }
      } else {
        handle();
      }
    }
  });
  observer.observe(target, { childList: true, subtree: true });
  handle();
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async function () {
  // eslint-disable-next-line unicorn/prefer-module
  "use strict";
  console.info("STARTING Farmhand by Ansel Santosa");

  console.info("Running migrations...");
  const keys = await GM.listValues();
  for (const key of keys) {
    const value = await GM.getValue<any>(key, null);
    if (key.startsWith("chatBanners")) {
      console.info(`Deleting legacy chat banners ${key}`, value);
      await GM.deleteValue(key);
      continue;
    }
    if (key === "customNav_data" && typeof value === "string") {
      console.info(`Migrating legacy custom nav ${key}`, value);
      const items = JSON.parse(value) as NavigationItem[];
      await GM.setValue(key, { items } as any);
      continue;
    }
    if (typeof value === "string") {
      console.info(`Deleting setting ${key} with invalid data format`, value);
      await GM.deleteValue(key);
      continue;
    }
    if (
      key.startsWith("state_") &&
      (!Array.isArray(value) ||
        value.length !== 2 ||
        typeof value[0] !== "object" ||
        typeof value[1] !== "object")
    ) {
      console.info(`Deleting ${key} with invalid data format`, value);
      await GM.deleteValue(key);
      continue;
    }
    if (key.endsWith("_data") && typeof value !== "object") {
      console.info(`Deleting setting ${key} with invalid data format`, value);
      await GM.deleteValue(key);
    }
  }
  console.info("Migrations complete");

  // initialize
  console.info("Running initializers...");
  const settings = await getSettingValues();
  for (const feature of FEATURES) {
    try {
      feature.onInitialize?.(settings);
    } catch (error) {
      logFailure(`onInitialize failed in ${describeFeature(feature)}`, error);
    }
  }
  logDiagnostic(`init: ${FEATURES.length} features initialized`);

  // Each remaining phase on its own. They were one straight line, so a throw
  // in any of them -- the request watchers not finding the game's fetchWorker
  // in this script's world, say -- meant the DOM watchers after it were never
  // registered and no page hook ever ran, with the panel (mounted above)
  // sitting there looking fine.

  // run any interceptors for the first page
  try {
    const currentPage = getCurrentPage();
    if (currentPage) {
      console.info(`Running interceptors for ${currentPage.dataset.page}...`);
      for (const [state, interceptor] of queryInterceptors) {
        const url = window.location.href.replace("/index.php#!", "");
        if (urlMatches(url, ...interceptor.match)) {
          const previous = await state.get({ doNotFetch: true });
          interceptor.callback(state, previous, {
            headers: new Headers(),
            ok: true,
            redirected: false,
            status: 200,
            statusText: "OK",
            type: "default",
            url,
            text: () => Promise.resolve(currentPage.innerHTML),
            json: () => Promise.resolve({}),
            formData: () => Promise.resolve(new FormData()),
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            blob: () => Promise.resolve(new Blob([])),
          });
        }
      }
    } else {
      console.warn("Failed to find first page");
      logDiagnostic("init: no first page found");
    }
  } catch (error) {
    logFailure("init: first-page interceptors failed", error);
  }

  console.info("Registering query interceptors...");
  try {
    watchQueries();
    logDiagnostic("init: request watchers on");
  } catch (error) {
    logFailure("init: request watchers failed", error);
  }

  console.info("Registering DOM watchers...");
  try {
    // double watches because the page and nav load at different times but
    // separating the handlers makes everything harder
    watchSubtree(".view-main .pages", "onPageLoad", ".page");
    watchSubtree(".view-main .navbar", "onPageLoad", ".navbar-inner");
    watchSubtree(".view-main .pages", "onNotificationLoad", ".page > .button");
    // watch quest popup
    watchSubtree(".view-main .toolbar", "onQuestLoad");
    // watch menu
    watchSubtree(".view-left", "onMenuLoad");
    // watch desktop and mobile versions of chat
    watchSubtree("#mobilechatpanel", "onChatLoad");
    watchSubtree("#desktopchatpanel", "onChatLoad");
    logDiagnostic("init: DOM watchers on");
  } catch (error) {
    logFailure("init: DOM watchers failed", error);
  }

  console.info("Farmhand running!");
})().catch((error) => {
  logFailure("init: start-up failed", error);
});
