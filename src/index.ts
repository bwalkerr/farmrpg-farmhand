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
import { focusDashboard } from "./features/focusDashboard";
import { getCurrentPage, getPage } from "~/utils/page";
import { getSettingValues, registerSettings } from "./utils/settings";
import { highlightSelfInChat } from "./features/highlightSelfInChat";
import { improvedInputs } from "./features/improvedInputs";
import { inventoryCapWarnings } from "./features/inventoryCapWarnings";
import { itemNeeds } from "./features/itemNeeds";
import { kitchenNotifications } from "./features/kitchenNotifications";
import { linkifyQuickCraft } from "./features/linkifyQuickCraft";
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
  focusDashboard,
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
    return;
  }
  let lastHandledAt = 0;
  const handle = async (): Promise<void> => {
    lastHandledAt = Date.now();
    const settings = await getSettingValues();
    const [page, parameters] = getPage();
    // console.debug(`${selector} Load`, page, parameters);
    for (const feature of FEATURES) {
      feature[handler]?.(settings, page, parameters);
    }
  };

  // A transition flips several classes in a burst, and mid-transition the hash
  // has already moved while the page swap has not landed -- dispatching then
  // hands features a page that is about to stop being true. Waiting for the
  // burst to settle is what makes the dispatch read one consistent state, and
  // it is the same 100ms the notifications observer already uses for this.
  let pending: number | undefined;
  const scheduleHandle = (): void => {
    clearTimeout(pending);
    pending = setTimeout(() => {
      // A fresh page arrives as an added node AND flips its class, so the
      // childList branch has usually dispatched already. Skipping the
      // redundant one keeps forward navigation behaving exactly as it did
      // before; back navigation, which adds no node, is the case that gets a
      // dispatch it never had.
      if (Date.now() - lastHandledAt < 150) {
        return;
      }
      handle();
    }, 100) as unknown as number;
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Framework7 keeps the page you came from in the DOM and re-shows that
      // same element on back navigation, so a returned-to page is never an
      // added node and the childList branch below never sees it. What changes
      // instead is the element's own class (`page-on-left` ->
      // `page-on-center`), which is an attribute mutation. Without this branch
      // nothing runs on back navigation: the perk manager never re-decides,
      // and any feature that paints on arrival paints only the first time you
      // ever arrive.
      if (mutation.type === "attributes") {
        const element = mutation.target as HTMLElement;
        // Only the settled class, never the mid-transition -to-center one:
        // that fires while the hash and the page element disagree.
        if (
          filter &&
          element.matches?.(filter) &&
          [...element.classList].some((name) => name.endsWith("-on-center"))
        ) {
          scheduleHandle();
        }
        continue;
      }
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
  observer.observe(target, {
    attributeFilter: ["class"],
    attributes: true,
    childList: true,
    subtree: true,
  });
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
  for (const { onInitialize } of FEATURES) {
    if (onInitialize) {
      onInitialize(settings);
    }
  }

  // run any interceptors for the first page
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
  }

  console.info("Registering query interceptors...");
  await watchQueries();

  console.info("Registering DOM watchers...");
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

  console.info("Farmhand running!");
})();
