import { Feature, FeatureSetting } from "../utils/feature";
import {
  getActivityPerksSet,
  getConfirmedEquippedSetId,
  onPerkRestore,
  PerkActivity,
  PerkSession,
  PerkSet,
  runGatedAction,
  runPerkTask,
  setPerkStatusNote,
} from "~/api/farmrpg/apis/perks";
import { getCurrentPage, getHashPage, getPage, Page } from "~/utils/page";
import { getSetting, SettingId } from "~/utils/settings";
import { harvestAllFromFarmPage } from "~/api/farmrpg/apis/farm";
import { QuickAction, setQuicksellGate } from "./quickSellSafely";
import { renderPerkIndicator } from "./perkIndicator";

const SETTING_PERK_MANAGER: FeatureSetting = {
  id: SettingId.PERK_MANAGER,
  title: "Perks: Auto manage",
  description: `
    1. Save your default perks set as "Default"<br>
    2. Save perks for "Cooking", "Crafting", "Farming", "Fishing", "Exploring", "Mining", "Selling", "Friendship", "Temple", "Locksmith", or "Wheel" activities<br>
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
// Town, and (via the confirmed-equipped fast path) only switches once on entry.
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
// so clicking between them never swaps perks -- swapping between sets is what
// caused every switch-timing bug in this feature. That set is the one named
// "Crafting"; it holds the selling, crafting and friendship perks together.
//
// GIVE is the exception: the friendship/give perks live in BOTH the Default set
// and the consolidated set, so if either is already confirmed on there is
// nothing to switch -- no set, no ~1s activation, the give fires immediately.
// (Selling and crafting perks are NOT in Default, so those always switch.)
const getQuickActionSet = async (
  action: QuickAction
): Promise<PerkSet | undefined> => {
  const perks = await getActivityPerksSet(PerkActivity.CRAFTING);
  if (!perks) {
    return undefined;
  }
  if (action === "give") {
    const defaultPerks = await getActivityPerksSet(PerkActivity.DEFAULT);
    const activeId = getConfirmedEquippedSetId();
    const isAlreadyCovered =
      activeId !== undefined &&
      (activeId === perks.id || activeId === defaultPerks?.id);
    if (isAlreadyCovered) {
      return undefined;
    }
  }
  return perks;
};

// A quick action is a proxied click: we press the game's own button and the
// game runs its own request, which we never see finish. So the perk queue is
// held for a moment afterwards -- long enough for that request to go out --
// because the thing it is being held against is a page reconcile starting its
// resetperks() while the sale is in flight, which is how a 50-silver item sells
// for 55 instead of 80.
const QUICK_ACTION_HOLD_MS = 1500;

const runQuickAction = async (
  action: QuickAction,
  fire: () => void
): Promise<void> => {
  const { value: isEnabled } = await getSetting(SETTING_PERK_MANAGER);
  if (!isEnabled) {
    fire();
    return;
  }
  await runGatedAction({
    label: `quick ${action}`,
    set: () => getQuickActionSet(action),
    action: () => fire(),
    holdMs: QUICK_ACTION_HOLD_MS,
  });
};

// Replace the native quick-craft button with a proxy that runs the click as a
// gated action. No-op if the native button is absent or already proxied.
//
// Quick-sell and quick-give are NOT installed here: quickSellSafely.ts already
// proxies both (.quicksellbtn / .quickgivebtn) with lock-safety and routes them
// through the gate registered below, which runs the same helper.
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
    await runQuickAction("craft", () => nativeButton.click());
  });
  nativeButton.parentElement?.insertBefore(proxyButton, nativeButton);
};

// Quick-sell and quick-give, registered once at module scope. One gate, set
// rather than appended to, so it cannot accumulate across page loads.
setQuicksellGate(runQuickAction);

// The farm page's Harvest All. Not a proxy button like CRAFT: the game shows
// and hides this one as the crops come ready, so a stand-in mounted at page
// load would be hidden or stale half the time. Instead the click itself is
// caught in the capture phase at the document -- before the game's own
// delegated handler, which listens on the document in the bubble phase --
// and replayed from inside the gate. Works on a retained page too, since it
// is not tied to any mount. Matched by the game's class, or failing that by
// what the button says, so a renamed class degrades to the text.
let isReplayingHarvestClick = false;
const findHarvestAllButton = (
  target: EventTarget | null
): HTMLElement | undefined => {
  if (!(target instanceof Element)) {
    return undefined;
  }
  const button = target.closest<HTMLElement>("a, button");
  if (!button) {
    return undefined;
  }
  const isHarvestAll =
    button.classList.contains("harvestallbtn") ||
    /^harvest all$/i.test(button.textContent?.trim() ?? "");
  return isHarvestAll ? button : undefined;
};

document.addEventListener(
  "click",
  (event) => {
    if (isReplayingHarvestClick) {
      return;
    }
    const [page] = getPage();
    if ((page ?? getHashPage()) !== Page.FARM) {
      return;
    }
    const button = findHarvestAllButton(event.target);
    if (!button) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    getSetting(SETTING_PERK_MANAGER)
      .then(async ({ value: isEnabled }) => {
        const replay = (): void => {
          isReplayingHarvestClick = true;
          try {
            button.click();
          } finally {
            isReplayingHarvestClick = false;
          }
        };
        if (!isEnabled) {
          replay();
          return;
        }
        const label = [...button.childNodes];
        button.textContent = "Loading...";
        try {
          await harvestAllFromFarmPage(replay);
        } finally {
          // the button is the game's; it repaints the page after the click
          // anyway, this only covers a switch that failed
          button.replaceChildren(...label);
        }
      })
      .catch((error) => {
        console.error("Failed to gate the farm page harvest", error);
      });
  },
  true
);

// Resolves the one activity set the given (live) page calls for, or undefined
// when the page isn't an activity page (→ revert to Default). A page matches at
// most one activity, so the first hit wins; a matched page whose set isn't
// configured falls through to Default, exactly like the old branch table.
const getPageActivation = async (
  page: Page | undefined
): Promise<{ activity: PerkActivity; set: PerkSet } | undefined> => {
  const directMatches: { activity: PerkActivity; matches: boolean }[] = [
    { activity: PerkActivity.CRAFTING, matches: page === Page.WORKSHOP },
    // The kitchen and the individual ovens (oven.php?num=N) are one activity —
    // cooking is started and tended from both, and bouncing between the list and
    // an oven shouldn't swap sets. Neither is a resting page, so with no
    // "Cooking" set this resolves to nothing and the perks are simply left as
    // they are, exactly like any other non-activity page.
    {
      activity: PerkActivity.COOKING,
      matches: page === Page.KITCHEN || page === Page.OVEN,
    },
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
// replant take the farm perks, quick-sell/craft/give take the consolidated set
// (both as gated actions, which hold the perk queue across the action itself),
// and the workshop, market, town and activity locations
// are activity pages in their own right. The one exception is the farm page's
// native Harvest All button, which is the game's and not gated by us — which is
// exactly why the farm stays a revert point.
const isRestingPage = (page: Page | undefined): boolean =>
  page === Page.HOME_PAGE || page === Page.HOME_PATH || page === Page.FARM;

// ---------------------------------------------------------------------------
// The policy: which set does the page you are on call for?
// ---------------------------------------------------------------------------
//
// This file decides WHAT to equip; apis/perks.ts decides WHEN and does the
// equipping. The two meet at a PerkSession, handed to us when our task reaches
// the front of the perk queue -- which is also when we read the page, so a
// decision can never be made about a page you have already left (the 1.1.41
// regression: a reconcile scheduled mid-transition landing after the correct
// one and winning).
interface PerkDecision {
  // undefined = change nothing
  set?: PerkSet;
  // what to show under the panel's perk chip, and to put in the perk log
  note: string;
}

const resolveDecision = async (): Promise<PerkDecision> => {
  const { value: isEnabled } = await getSetting(SETTING_PERK_MANAGER);
  if (!isEnabled) {
    // The one silent path there was. With auto manage off nothing switches and
    // nothing says why, which is indistinguishable from a broken reconciler --
    // and manual equipping from the panel still works, so the setting looks on.
    return { note: "auto manage is off" };
  }

  // `getPage()` reads data-page off the live page element, which this fork has
  // found unreliable often enough that half this file matches on the URL
  // instead -- and when it comes back undefined the reconciler used to fall all
  // the way through to "keeping current set" and switch NOTHING. That is the
  // "it just doesn't switch sometimes" failure, and on the farm it is the
  // "came to the farm and it never went back to Default" one: an unidentified
  // page is not a resting page, so the revert never runs.
  //
  // The address bar is the second opinion (getHashPage: `#!/xfarm.php` ->
  // `xfarm`), used ONLY when the element can't identify itself, so a page that
  // reads fine is unaffected. Mid-transition the hash leads the DOM, but a
  // lagging hash can only name the page we just left, and the next dispatch
  // corrects it.
  const [domPage] = getPage();
  const page = domPage ?? getHashPage();
  // The note says which source answered, so a wrong decision can be traced to
  // the page id rather than to the switch.
  let where = "unknown page";
  if (domPage) {
    where = domPage;
  } else if (page) {
    where = `${page} (url)`;
  }

  // don't touch perks on the perks page so you can edit sets freely
  if (page === Page.PERKS) {
    return { note: `${where}: left alone` };
  }

  const defaultPerks = await getActivityPerksSet(PerkActivity.DEFAULT);
  if (!defaultPerks) {
    console.warn("Default perk set not found");
    return { note: "no Default set" };
  }

  const activation = await getPageActivation(page);
  if (activation) {
    return { set: activation.set, note: where };
  }

  // Not an activity page, and not a resting one either -- you're browsing
  // mid-activity (an item, your inventory, a quest), so leave the perks where
  // they are. This also covers the two cases that used to need their own
  // guards: item pages, where the quick actions manage perks themselves and a
  // revert would fire on top of a just-activated set; and an unidentifiable
  // page (getCurrentPage() momentarily returns null mid-render), which is not a
  // reliable "you've left the activity" signal and once caused the workshop to
  // reset and re-activate Crafting on every single craft.
  if (!isRestingPage(page)) {
    return { note: `${where}: keeping current set` };
  }

  return { set: defaultPerks, note: where };
};

// Put the page's set on. Used for BOTH halves of the job: the page-transition
// reconcile, and the restore after a quick action. (Harvest and replant opt
// OUT of the restore: they leave the farm set on and let the next page
// transition reconcile, the way the wrap worked from 1.0.40 -- see
// apis/farm.ts.) One function, so the two can't drift apart.
//
// Called with a live session, so it must never enqueue a task of its own.
const applyDecision = async (perks: PerkSession): Promise<void> => {
  const decision = await resolveDecision();
  if (!decision.set) {
    setPerkStatusNote(decision.note);
    return;
  }
  const { set, note } = decision;
  setPerkStatusNote(`${note} → ${set.name}`);
  try {
    const switched = await perks.apply(set);
    setPerkStatusNote(
      `${note} → ${set.name}${switched ? "" : " (already on)"}`
    );
  } catch (error) {
    // A failed switch was invisible before: the queue swallows failures to
    // protect the next task, so there was no way to tell a request that failed
    // from a page that was never recognised.
    console.error(`Failed to activate the ${set.name} perk set`, error);
    setPerkStatusNote(`${note} → ${set.name} FAILED`);
  }
};

// After any gated action, the perks go back to what the page calls for.
onPerkRestore(applyDecision);

// Nothing awaits a feature's onPageLoad, so a throw in the reconciler would be
// an unhandled rejection: silent, and on a phone there is no console to find it
// in. Every path through applyDecision leaves a note, so this one does too.
const reconcileSafely = async (): Promise<void> => {
  try {
    await runPerkTask(applyDecision, "reconcile");
  } catch (error) {
    console.error("Failed to reconcile perks", error);
    setPerkStatusNote(
      `reconcile failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

// Framework7 re-shows a RETAINED page element on back navigation instead of
// adding one, so the global childList dispatch in index.ts never fires and the
// reconciler never runs. A phone leans on cached pages and back navigation far
// harder than a desktop does, which is why auto switching has always worked on
// a PC and never on mobile.
//
// Deliberately LOCAL to this feature. 1.1.41 put this same observer on the
// global dispatch instead, which re-ran every notification feature against
// cached state and resurrected harvest and field banners that had already been
// cleared -- "I needed to plant, after I planted then fields empty when they
// are not". Same observer shape as utils/notifications.ts, which has run this
// way since 1.1.16, and the 100ms debounce matters for a second reason here:
// mid-transition the hash has already moved while the page swap has not landed,
// so a reconcile that ran then would be deciding about the page you are
// leaving. (Deciding inside the perk task rather than here is the real defence
// -- see resolveDecision -- but there is no reason to queue the work at all.)
let transitionTimeout: number | undefined;

// Everything this feature puts ON a page, as opposed to the perks it switches:
// the equipped-set marker and the quick-craft proxy. Both were reachable only
// from onPageLoad, which is precisely the dispatch that does not fire for a
// RETAINED page — so arriving at an item page by back navigation left the
// game's own quick-craft button live and unproxied, and clicking it crafted
// under whatever set happened to be equipped. That is "crafting perk switching
// does not happen on item pages", and it is a phone symptom because a phone
// leans on back navigation far harder than a desktop does.
//
// Safe to re-run: renderPerkIndicator mounts once and reuses, and
// installQuickActionProxy bails when the native button is missing or already
// hidden (i.e. already proxied), so a retained page keeps its one proxy.
const mountPageExtras = async (): Promise<void> => {
  await renderPerkIndicator();

  // With auto manage off nothing switches, so there is nothing for a proxy to
  // do but hide the game's own button and click it for you.
  const { value: isEnabled } = await getSetting(SETTING_PERK_MANAGER);
  if (!isEnabled) {
    return;
  }

  // the quick-craft proxy lives on item pages; skip the workshop, where the
  // reconciler already scopes perks. (quick-sell and quick-give are handled
  // by quickSellSafely.ts — see installQuickActionProxy's note.)
  const [page] = getPage();
  if (page !== Page.WORKSHOP) {
    installQuickActionProxy(".quickcraftbtn", "CRAFT");
  }
};

// Extras first, then the switch. They are independent -- the proxy button and
// the marker don't need to know which set is on -- and the reconcile now waits
// on the perk queue, which a harvest can hold for a couple of seconds. Mounting
// second meant arriving at an item page during one left the game's own,
// UNGATED craft button live and clickable for that whole window.
const onPageSettled = async (): Promise<void> => {
  await mountPageExtras();
  await reconcileSafely();
};

const scheduleReconcile = (): void => {
  clearTimeout(transitionTimeout);
  transitionTimeout = setTimeout(() => {
    onPageSettled().catch((error) => {
      console.error("Failed to reconcile perks", error);
    });
  }, 100) as unknown as number;
};

const watchPageTransitions = (): void => {
  const pages = document.querySelector(".view-main .pages");
  if (!pages) {
    console.error("Pages not found");
    return;
  }
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Only a page's own class, never a descendant's: with subtree watching,
      // the classes our own features put on the DOM would otherwise schedule
      // another reconcile, and so on.
      if ((mutation.target as HTMLElement).matches?.(".page")) {
        scheduleReconcile();
        return;
      }
    }
  });
  observer.observe(pages, {
    attributeFilter: ["class"],
    attributes: true,
    subtree: true,
  });
};

export const perkManagment: Feature = {
  settings: [SETTING_PERK_MANAGER],
  onInitialize: () => {
    watchPageTransitions();
  },
  onPageLoad: async () => {
    // The marker and the quick-craft proxy, then page-scoped perk switching.
    // Idempotent, so the SPA's duplicate onPageLoad calls converge instead of
    // racing, and it agrees with the page-transition watcher below, which runs
    // the same pair for the arrivals this dispatch never sees.
    // (renderPerkIndicator waits out the game's own boot on its own — see
    // isGameBooted there.)
    await onPageSettled();
  },
  onQuestLoad: async (settings) => {
    if (!settings[SettingId.PERK_MANAGER]) {
      return;
    }
    await renderPerkIndicator();
  },
};
