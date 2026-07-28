import {
  activatePerkSet,
  getActivityPerksSet,
  getConfirmedEquippedSetId,
  PerkActivity,
  PerkSet,
} from "~/api/farmrpg/apis/perks";
import { Feature, FeatureSetting } from "../utils/feature";
import { getCurrentPage, getPage, Page } from "~/utils/page";
import { getSetting, SettingId } from "~/utils/settings";
import { onQuicksellClick, QuickAction } from "./quickSellSafely";

const SETTING_PERK_MANAGER: FeatureSetting = {
  id: SettingId.PERK_MANAGER,
  title: "Perks: Auto manage",
  description: `
    1. Save your default perks set as "Default"<br>
    2. Save perks for "Crafting", "Farming", "Fishing", "Exploring", "Mining", "Selling", "Friendship", "Temple", "Locksmith", or "Wheel" activities<br>
    3. Activity perk sets will automatically be enabled for those activities and reverted to "Default" after
  `,
  type: "boolean",
  defaultValue: true,
};

// the temple was identified by data-page "mailitems" when this feature was
// written; newer game versions serve it as temple.php, so accept either
const isTemplePage = (page: Page | undefined): boolean =>
  page === Page.TEMPLE ||
  /\btemple[_a-z]*\.php/.test(window.location.hash || window.location.pathname);

// mining spans the location page (data-page "mining") and the dig board
// (mine.php), which may not share the same page identity
const isMiningPage = (page: Page | undefined): boolean =>
  page === Page.MINING ||
  /\bmin(?:e|ing)\.php/.test(window.location.hash || window.location.pathname);

// Every activity location (explore areas, fishing spots, mines) is served by
// location.php?type=<activity>&id=<n>, and they can share a page identity — so
// matching on the page id alone risks putting Exploring perks on a fishing spot.
// The URL's own type is the authoritative signal, so prefer it where present.
const getLocationType = (): string | undefined => {
  const location = window.location.hash || window.location.pathname;
  if (!/\blocation\.php/.test(location)) {
    return undefined;
  }
  const type = new URLSearchParams(location.split("?")[1]).get("type");
  return type?.toLowerCase();
};

const isLocationOfType = (...prefixes: string[]): boolean => {
  const type = getLocationType();
  return Boolean(type && prefixes.some((prefix) => type.startsWith(prefix)));
};

// the town hub (town.php) — an unknown page to getPage(), so match on the URL.
// including it in the cluster keeps Town perks active while you bounce between
// town buildings via the hub, instead of reverting to Default at the hub and
// re-switching to Town at every building.
const isTownHubPage = (): boolean =>
  /\btown\.php/.test(window.location.hash || window.location.pathname);

// town-cluster activities and how to recognize their pages. these are all done
// together in the town area, so they share one "Town" perk set
// (PerkActivity.TOWN) to avoid thrashing between sets; each still falls back to
// its own set when no Town set exists. The Town set now also holds the selling
// perks, so the farmers market belongs here too — the whole town area stays on
// Town, and (via activatePerkSet's guard) only switches once on entry.
const TOWN_CLUSTER: {
  activity: PerkActivity;
  matches: (page: Page | undefined) => boolean;
}[] = [
  { activity: PerkActivity.TOWN, matches: () => isTownHubPage() },
  { activity: PerkActivity.TEMPLE, matches: isTemplePage },
  { activity: PerkActivity.WHEEL, matches: (page) => page === Page.WHEEL },
  {
    activity: PerkActivity.LOCKSMITH,
    matches: (page) => page === Page.LOCKSMITH,
  },
  { activity: PerkActivity.VAULT, matches: (page) => page === Page.VAULT },
  // market's own-set fallback is Selling (for anyone without a Town set)
  {
    activity: PerkActivity.SELLING,
    matches: (page) => page === Page.FARMERS_MARKET,
  },
];

// Quick-sell, quick-craft and quick-give all share ONE consolidated perk set,
// so clicking between them never swaps perks — swapping between sets is what
// caused every switch-timing bug in this feature. That set is the one named
// "Crafting"; it holds the selling, crafting and friendship perks together.
const getQuickActionPerks = (): Promise<PerkSet | undefined> =>
  getActivityPerksSet(PerkActivity.CRAFTING);

// Force the consolidated set active and settle, so its perks are actually
// equipped (not just labelled active) before the caller fires the native action.
//
// GIVE is the exception: the friendship/give perks live in BOTH the Default set
// and the consolidated set, so if either is already equipped there's nothing to
// switch — skip the ~1s activation entirely and let the give fire immediately.
// (Selling and crafting perks are NOT in Default, so those always switch.)
// Sell and craft need no such check: activatePerkSet no-ops instantly via its
// confirmedEquippedSetId fast path when the set is already on.
const activateQuickActionPerks = async (
  action: QuickAction = "sell"
): Promise<void> => {
  const perks = await getQuickActionPerks();
  if (!perks) {
    return;
  }
  if (action === "give") {
    const defaultPerks = await getActivityPerksSet(PerkActivity.DEFAULT);
    const activeId = getConfirmedEquippedSetId();
    const giveAlreadyCovered =
      activeId !== undefined &&
      (activeId === perks.id || activeId === defaultPerks?.id);
    if (giveAlreadyCovered) {
      return;
    }
  }
  await activatePerkSet(perks, { force: true, settle: true });
};

// Replace the native quick-craft button with a proxy that activates the
// consolidated set first, then fires the native action and stops — the
// reconciler reverts to Default when you navigate away. No-op if the native
// button is absent or already proxied.
//
// Quick-sell and quick-give are NOT installed here: quickSellSafely.ts already
// proxies both (.quicksellbtn / .quickgivebtn) with lock-safety and runs the
// shared onQuicksellClick callback below, which activates the same consolidated
// set. Installing a second give proxy here was dead code (quickSellSafely runs
// first and wins) and made give's lock-safety silently depend on feature order.
const installQuickActionProxy = (
  nativeSelector: string,
  label: string
): void => {
  const nativeButton =
    getCurrentPage()?.querySelector<HTMLButtonElement>(nativeSelector);
  if (!nativeButton || nativeButton.style.display) {
    return;
  }
  nativeButton.style.display = "none";
  const proxyButton = document.createElement("button");
  proxyButton.classList.add("button", "btngreen");
  proxyButton.style.height = "28px;";
  proxyButton.textContent = label;
  proxyButton.addEventListener("click", async () => {
    await activateQuickActionPerks();
    nativeButton.click();
  });
  nativeButton.parentElement?.insertBefore(proxyButton, nativeButton);
};

// Quick-sell, registered once at module scope (registering per page-load would
// stack duplicate callbacks). Returning true never blocks the sale; the
// reconciler restores Default when you navigate away.
onQuicksellClick(async (_event, action) => {
  const { value: isEnabled } = await getSetting(SETTING_PERK_MANAGER);
  if (isEnabled) {
    await activateQuickActionPerks(action);
  }
  return true;
});

// Resolves the one activity set the given (live) page calls for, or undefined
// when the page isn't an activity page (→ revert to Default). A page matches at
// most one activity, so the first hit wins; a matched page whose set isn't
// configured falls through to Default, exactly like the old branch table.
const getPageActivation = async (
  page: Page | undefined
): Promise<{ activity: PerkActivity; set: PerkSet } | undefined> => {
  const directMatches: { activity: PerkActivity; matches: boolean }[] = [
    { activity: PerkActivity.CRAFTING, matches: page === Page.WORKSHOP },
    // location.php's own type wins over the page id, and is checked first, so a
    // fishing spot can't be mistaken for an explore area (see getLocationType)
    {
      activity: PerkActivity.FISHING,
      matches: isLocationOfType("fish") || page === Page.FISHING,
    },
    {
      activity: PerkActivity.MINING,
      matches: isLocationOfType("mine", "mining") || isMiningPage(page),
    },
    {
      activity: PerkActivity.EXPLORING,
      matches: isLocationOfType("explore") || page === Page.AREA,
    },
    // The farm is listed so it's explicit rather than accidental: with a
    // "Farming" set it's used here; without one (farm perks living in Default,
    // the usual setup) this resolves to nothing and the farm falls through to
    // the Default revert below, which is what it needs — the farm page's own
    // Harvest All button is the game's, not ours, so it isn't gated the way the
    // crops-ready notification is and must not run under a stale activity set.
    { activity: PerkActivity.FARMING, matches: page === Page.FARM },
    // the farmers market is handled in TOWN_CLUSTER below: the Town set now
    // holds the selling perks, so the market stays on Town like the rest of
    // the town area (falling back to a Selling set only if no Town set exists)
    {
      activity: PerkActivity.FRIENDSHIP,
      matches: page === Page.FRIENDSHIP || page === Page.MAILBOX,
    },
  ];
  for (const { activity, matches } of directMatches) {
    if (!matches) {
      continue;
    }
    const set = await getActivityPerksSet(activity);
    return set ? { activity, set } : undefined;
  }

  // town-cluster page: prefer the shared "Town" set, else the activity's own
  const townSet = await getActivityPerksSet(PerkActivity.TOWN);
  for (const { activity, matches } of TOWN_CLUSTER) {
    if (!matches(page)) {
      continue;
    }
    const set = townSet ?? (await getActivityPerksSet(activity));
    if (!set) {
      continue;
    }
    return { activity: townSet ? PerkActivity.TOWN : activity, set };
  }

  return undefined;
};

// Pages that put perks back to Default. Everywhere else that isn't an activity
// page simply LEAVES THE CURRENT SET ALONE — browsing to an item, your
// inventory, a quest or a profile in the middle of an activity is not a signal
// that you're done with it, and reverting there cost a full switch out and
// another one back when you returned. So an activity set now stays on until you
// actually go somewhere that means "done": home, or the farm.
//
// This is safe because everything that actually spends perks is gated on its
// own set rather than trusting whatever happens to be equipped: harvest and
// replant force the farm perks (withFarmingPerks), quick-sell/craft/give force
// the consolidated set, and the workshop, market, town and activity locations
// are activity pages in their own right. The one exception is the farm page's
// native Harvest All button, which is the game's and not gated by us — which is
// exactly why the farm stays a revert point.
const isRestingPage = (page: Page | undefined): boolean =>
  page === Page.HOME_PAGE || page === Page.HOME_PATH || page === Page.FARM;

// The single source of truth for page-scoped perk switching. Resolves the set
// the *live* page calls for (via getPage(), NOT the argument handed to
// onPageLoad) and switches to it, going back to Default on a resting page.
// Idempotent: the SPA fires onPageLoad several times per navigation,
// sometimes with a stale page — the old branch table let one run activate the
// activity set while another fell through and reverted to Default, and whoever
// landed last won, nondeterministically leaving e.g. the market under Default
// (partial sell perks). Keying every run off the same live page makes the
// duplicate runs agree on the same set, so the redundant ones no-op via the
// activatePerkSet guard instead of fighting each other.
const reconcilePerksForCurrentPage = async (): Promise<void> => {
  const { value: isEnabled } = await getSetting(SETTING_PERK_MANAGER);
  if (!isEnabled) {
    return;
  }

  const [page] = getPage();

  // don't touch perks on the perks page so you can edit sets freely
  if (page === Page.PERKS) {
    return;
  }

  const defaultPerks = await getActivityPerksSet(PerkActivity.DEFAULT);
  if (!defaultPerks) {
    console.warn("Default perk set not found");
    return;
  }

  const activation = await getPageActivation(page);
  if (activation) {
    await activatePerkSet(activation.set, { settle: true });
    return;
  }

  // Not an activity page, and not a resting one either — you're browsing
  // mid-activity (an item, your inventory, a quest), so leave the perks where
  // they are. This also covers the two cases that used to need their own
  // guards: item pages, where the quick actions manage perks themselves and a
  // revert would fire on top of a just-activated set; and an unidentifiable
  // page (getCurrentPage() momentarily returns null mid-render), which is not a
  // reliable "you've left the activity" signal and once caused the workshop to
  // reset and re-activate Crafting on every single craft.
  if (!isRestingPage(page)) {
    return;
  }

  // back to Default (settle: the game acks the switch before it equips, so
  // without waiting the label flips to Default while the previous set's perks
  // stay on)
  await activatePerkSet(defaultPerks, { settle: true });
};

export const perkManagment: Feature = {
  settings: [SETTING_PERK_MANAGER],
  onPageLoad: async (settings) => {
    if (!settings[SettingId.PERK_MANAGER]) {
      return;
    }

    // page-scoped perk switching, driven by the live page (idempotent, so the
    // SPA's duplicate onPageLoad calls converge instead of racing)
    await reconcilePerksForCurrentPage();

    // the quick-craft proxy lives on item pages; skip the workshop, where the
    // reconciler already scopes perks. (quick-sell and quick-give are handled
    // by quickSellSafely.ts — see installQuickActionProxy's note.)
    const [page] = getPage();
    if (page !== Page.WORKSHOP) {
      installQuickActionProxy(".quickcraftbtn", "CRAFT");
    }
  },
};
