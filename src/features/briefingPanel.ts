import {
  activatePerkSet,
  getPerkStatus,
  onPerkStatusChange,
  PerkActivity,
  PerkSet,
  perksState,
} from "~/api/farmrpg/apis/perks";
import {
  activateSet,
  CraftworksSnapshot,
  craftworksState,
  restoreQueue,
  setQueueRunning,
} from "~/api/farmrpg/apis/craftworks";
import {
  addGoal,
  getGoalProgress,
  getGoals,
  GoalProgress,
  removeGoal,
  TrackedGoal,
} from "~/utils/goals";
import { Advice, adviseOnSlots, suggestQueueChanges } from "~/utils/craftworks";
import {
  BooleanFeatureSetting,
  Feature,
  FeatureSetting,
} from "../utils/feature";
import {
  BORDER_GRAY,
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import { buildNeeds } from "~/utils/needAdapters";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import {
  getBasicItems,
  getLocationEntries,
  locationDataState,
  LocationRef,
} from "~/api/buddyfarm/api";
import { getCurrentPage, Page } from "~/utils/page";
import {
  getDesiredQueueForNeeds,
  ResolvedNeeds,
  resolveNeeds,
} from "~/utils/needs";
import { getFocusedScopes, setFocusedScopes } from "~/utils/focusScope";
import {
  getFrozenMastery,
  getMasterySuggestions,
  getQuestSuggestions,
  getRecommendedSet,
  getSetSuggestions,
  GoalSuggestion,
} from "~/utils/suggestions";
import {
  getGoalStatuses,
  getNearlyDone,
  GoalStatus,
  mergeMissing,
  rankBottlenecks,
} from "~/utils/focus";
import { getHTML } from "~/api/farmrpg/utils/requests";
import {
  getLocationAdvice,
  matchLocationByImage,
  matchLocationName,
  parseStamina,
} from "~/utils/locationAdvice";
import { getQuestGoals, parseActiveQuests } from "~/api/farmrpg/apis/quests";
import {
  getSetting,
  getSettings,
  getSettingValues,
  setSetting,
  SettingId,
} from "~/utils/settings";
import { inventoryState } from "~/api/farmrpg/apis/inventory";
import {
  makeItemLink,
  makeLinkedLine,
  makeLocationLink,
  makeMutedText,
  makeQuestLink,
} from "~/utils/gameLinks";
import { MasteryEntry, masteryState } from "~/api/farmrpg/apis/mastery";
import { MOBILE_MAX_WIDTH } from "~/utils/layout";
import { orUndefined } from "~/utils/promise";
import { parseUnlimitedItems, UnlimitedItems } from "~/utils/unlimited";
import { planSourcing, RecipeGraph } from "~/utils/craftPlanner";

const SETTING_BRIEFING_PANEL: FeatureSetting = {
  id: SettingId.BRIEFING_PANEL,
  title: "Briefing: Floating panel",
  description: `
    A button above the bottom bar that opens your goals, the Craftworks queue,
    your open requests and where to go, from any page
  `,
  type: "boolean",
  defaultValue: true,
};

const BUTTON_ID = "fh-briefing-button";
const PANEL_ID = "fh-briefing-panel";
const STYLE_ID = "fh-briefing-style";
const MAX_LISTED = 5;

// Bottom-left, mirroring the cap tracker's floating fallback on the right, so
// the two never collide and both clear the bottom bar.
// env() keeps the button clear of the iOS home indicator and any notch; the
// fallbacks make it identical to before on anything that does not report insets.
const EDGE_OFFSET = "calc(8px + env(safe-area-inset-left, 0px))";
const BOTTOM_OFFSET = "calc(62px + env(safe-area-inset-bottom, 0px))";
// On a phone the button moves to the RIGHT, at Reed's request: that is where a
// thumb rests, and the cap tracker -- the only other thing that floats on that
// side -- is not drawn below MOBILE_MAX_WIDTH, so nothing collides there.
const RIGHT_OFFSET = "calc(8px + env(safe-area-inset-right, 0px))";

type TabId = "now" | "goals" | "sets" | "craftworks";
const TABS: { id: TabId; label: string }[] = [
  { id: "now", label: "Now" },
  { id: "goals", label: "Goals" },
  { id: "sets", label: "Sets" },
  // "Queue" rather than "Craftworks": four labels have to fit 380px, and the
  // panel is already inside Craftworks by context
  { id: "craftworks", label: "Queue" },
];

const injectStyles = (): void => {
  if (document.querySelector(`#${STYLE_ID}`)) {
    return;
  }
  document.head.insertAdjacentHTML(
    "beforeend",
    `<style id="${STYLE_ID}">
      #${BUTTON_ID} {
        position: fixed;
        left: ${EDGE_OFFSET};
        bottom: ${BOTTOM_OFFSET};
        z-index: 5000;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid ${BORDER_GRAY};
        background: rgba(20, 20, 20, 0.92);
        color: ${TEXT_GRAY};
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        transition: transform 140ms ease, color 140ms ease,
          border-color 140ms ease;
        -webkit-backdrop-filter: blur(6px);
        backdrop-filter: blur(6px);
      }
      #${BUTTON_ID}:hover { color: ${TEXT_WHITE}; border-color: #5a5a5a; }
      #${BUTTON_ID}:active { transform: scale(0.94); }
      #${BUTTON_ID}[data-open="true"] {
        color: ${TEXT_WHITE};
        transform: rotate(90deg);
      }
      #${BUTTON_ID} .fh-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9px;
        background: ${TEXT_WARNING};
        color: #111;
        font-size: 11px;
        font-weight: bold;
        line-height: 18px;
        text-align: center;
      }
      #${PANEL_ID} {
        position: fixed;
        left: ${EDGE_OFFSET};
        bottom: calc(${BOTTOM_OFFSET} + 52px);
        z-index: 5001;
        width: 380px;
        max-width: calc(100vw - 16px);
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid ${BORDER_GRAY};
        background: rgba(18, 18, 19, 0.97);
        box-shadow: 0 10px 34px rgba(0, 0, 0, 0.55);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: opacity 140ms ease, transform 140ms ease;
      }
      #${PANEL_ID}[data-open="true"] {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      /* Holds the tabs and the body. A column on a phone, exactly as before;
         a row on a wide screen, which turns the tab strip into a vertical
         rail. min-height:0 on both is what lets the body scroll inside a flex
         parent instead of pushing the panel taller. */
      #${PANEL_ID} .fh-briefing-main {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }
      #${PANEL_ID} .fh-briefing-body {
        overflow-y: auto;
        overscroll-behavior: contain;
        flex: 1 1 auto;
        min-height: 0;
      }
      #${PANEL_ID} .fh-briefing-body::-webkit-scrollbar { width: 8px; }
      #${PANEL_ID} .fh-briefing-body::-webkit-scrollbar-thumb {
        background: #3a3a3a;
        border-radius: 4px;
      }
      #${PANEL_ID} .fh-briefing-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .fh-briefing-refresh {
        cursor: pointer;
        color: ${TEXT_GRAY};
        font-size: 11px;
      }
      #${PANEL_ID} .fh-briefing-refresh:hover { color: ${TEXT_WHITE}; }
      #${PANEL_ID} .fh-briefing-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
        border-bottom: 1px solid ${BORDER_GRAY};
        padding-bottom: 8px;
      }
      #${PANEL_ID} .fh-tab {
        flex: 1 1 0;
        text-align: center;
        padding: 5px 8px;
        border-radius: 7px;
        font-size: 12px;
        cursor: pointer;
        color: ${TEXT_GRAY};
        background: transparent;
        transition: background 120ms ease, color 120ms ease;
        user-select: none;
      }
      #${PANEL_ID} .fh-tab:hover { color: ${TEXT_WHITE}; }
      #${PANEL_ID} .fh-tab[data-active="true"] {
        color: ${TEXT_WHITE};
        background: rgba(255, 255, 255, 0.09);
      }
      /* The count of things wanting attention in that tab. Muted, because it
         is there to be scanned rather than read. */
      #${PANEL_ID} .fh-tab-count {
        margin-left: 5px;
        font-size: 11px;
        color: ${TEXT_WARNING};
      }
      #${PANEL_ID} .fh-tab[data-active="true"] .fh-tab-count {
        color: ${TEXT_WARNING};
      }

      /* What you are focused on, and the way out of each one. Sits under the
         title so it is present on every tab, not only the one focus was set
         from. Wraps because focus is a list now -- two or three undertakings
         that share a material are the normal case. */
      #${PANEL_ID} .fh-focus-chip {
        display: none;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 8px;
        font-size: 11px;
      }
      #${PANEL_ID} .fh-focus-chip[data-on="true"] { display: flex; }
      #${PANEL_ID} .fh-focus-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        border-radius: 7px;
        border: 1px solid ${TEXT_WARNING};
        color: ${TEXT_WARNING};
        max-width: 100%;
      }
      #${PANEL_ID} .fh-focus-tag > span:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${PANEL_ID} .fh-chip-clear {
        cursor: pointer;
        opacity: 0.75;
        flex: 0 0 auto;
      }
      #${PANEL_ID} .fh-chip-clear:hover { opacity: 1; }
      /* Only appears once focus is a list: clearing three chips one at a time
         is the sort of thing that stops people using focus at all. */
      #${PANEL_ID} .fh-focus-all {
        cursor: pointer;
        color: ${TEXT_GRAY};
        padding: 3px 4px;
      }
      #${PANEL_ID} .fh-focus-all:hover { color: ${TEXT_WHITE}; }
      /* Dimmed, never hidden: a quest that disappeared because you focused
         another is exactly what you would forget about. */
      #${PANEL_ID} .fh-dim {
        opacity: 0.38;
        transition: opacity 160ms ease;
      }
      #${PANEL_ID} .fh-dim:hover { opacity: 0.75; }

      /* Wide screens get a two-pane panel: a vertical rail of sections and a
         content pane. The rail is what removes the four-tab ceiling -- a
         column takes as many entries as we want, where the horizontal strip
         could not fit a fifth at 380px. Below this width nothing changes. */
      @media (min-width: 1024px) {
        #${PANEL_ID} {
          width: 920px;
          max-height: 82vh;
        }
        #${PANEL_ID} .fh-briefing-main {
          flex-direction: row;
          gap: 14px;
        }
        #${PANEL_ID} .fh-briefing-tabs {
          flex: 0 0 148px;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 0;
          padding-bottom: 0;
          padding-right: 12px;
          border-bottom: none;
          border-right: 1px solid ${BORDER_GRAY};
        }
        #${PANEL_ID} .fh-tab {
          flex: 0 0 auto;
          text-align: left;
          padding: 7px 10px;
          font-size: 13px;
        }
      }
      /* Phone layout. Everything here is either a thumb target or a
         consequence of there being no hover on touch -- the desktop panel is
         driven by hover states a finger never produces. */
      @media (max-width: ${MOBILE_MAX_WIDTH}px) {
        /* Bottom RIGHT on a phone: that is where the thumb is, and the cap
           tracker (the only other floating thing on that side) is not drawn
           below this width, so the corner is free. */
        #${BUTTON_ID} {
          left: auto;
          right: ${RIGHT_OFFSET};
          width: 48px;
          height: 48px;
        }
        #${PANEL_ID} {
          left: auto;
          right: ${RIGHT_OFFSET};
          width: calc(100vw - 16px);
          /* vh on iOS Safari is the LARGEST viewport, so 70vh can run under the
             URL bar; dvh is the visible one. The fallback above still applies
             where dvh is unsupported. */
          max-height: min(70vh, calc(100dvh - 150px));
        }
        /* 5px of padding is a 22px-tall target. This makes the tab strip
           thumb-sized without changing anything on a desktop. */
        #${PANEL_ID} .fh-tab {
          padding: 10px 8px;
          font-size: 13px;
        }
        #${PANEL_ID} .fh-briefing-refresh {
          font-size: 12px;
          padding: 6px 2px 6px 10px;
        }
        /* A 14px glyph is not a target. Padding grows the hit box without
           moving the glyph. */
        #${PANEL_ID} .fh-goal-remove,
        #${PANEL_ID} .fh-goal-action,
        #${PANEL_ID} .fh-chip-clear {
          padding: 6px 8px;
          margin: -6px -8px -6px 0;
        }
        #${PANEL_ID} .fh-chip {
          padding: 6px 12px;
          font-size: 12px;
        }
        /* 0.38 relies on hover to read a dimmed row, and touch has no hover.
           Dimmed still reads as secondary at 0.55 but stays legible. */
        #${PANEL_ID} .fh-dim { opacity: 0.55; }
      }
      #${PANEL_ID} .fh-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin: 2px 0 8px;
      }
      #${PANEL_ID} .fh-chip {
        padding: 2px 8px;
        border-radius: 10px;
        border: 1px solid ${BORDER_GRAY};
        font-size: 11px;
        cursor: pointer;
        color: ${TEXT_GRAY};
        user-select: none;
        transition: background 120ms ease, color 120ms ease,
          border-color 120ms ease;
      }
      #${PANEL_ID} .fh-chip:hover { color: ${TEXT_WHITE}; }
      #${PANEL_ID} .fh-chip[data-active="true"] {
        color: ${TEXT_WHITE};
        background: rgba(255, 255, 255, 0.11);
        border-color: #5a5a5a;
      }
      #${PANEL_ID} .fh-goal { margin-bottom: 10px; }
      #${PANEL_ID} .fh-goal-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }
      #${PANEL_ID} .fh-goal-remove {
        cursor: pointer;
        color: #6a6a6a;
        font-size: 14px;
        line-height: 1;
      }
      #${PANEL_ID} .fh-goal-remove:hover { color: ${TEXT_ERROR}; }
      #${PANEL_ID} .fh-bar {
        height: 4px;
        border-radius: 2px;
        background: #2a2a2a;
        margin: 4px 0 3px;
        overflow: hidden;
      }
      #${PANEL_ID} .fh-bar > div {
        height: 100%;
        border-radius: 2px;
        background: ${TEXT_SUCCESS};
        transition: width 200ms ease;
      }
    </style>`
  );
};

// Inline so it always draws: the game mixes Font Awesome 4 and 6 and neither
// set is guaranteed to carry a given glyph.
const ICON = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h11M3 12h8M3 18h11" />
    <path d="M16 15l3 3 5-6" />
  </svg>`;

const plural = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

// What the badge is counting, in words.
//
// The number alone mixes three unrelated things, so "1" could be a dead slot,
// a mis-ordered queue or a request waiting to be handed in. The tooltip says
// which, and both callers build it the same way so the figure cannot mean one
// thing before the panel is opened and another after.
// How many things in each tab actually want you. The point of the rail is to
// answer "where is the work" without opening all four, so a tab with nothing
// outstanding shows no number at all rather than a zero -- a row of zeroes
// reads as noise and hides the one number that matters.
const getTabCounts = (context: Context): Partial<Record<TabId, number>> => {
  const counts: Partial<Record<TabId, number>> = {};
  const attention = summarizeAttention(
    context.advice,
    context.statuses.filter((status) => status.isReady).length
  );
  if (attention.count > 0) {
    counts.now = attention.count;
  }
  const unfinished = context.goalProgress.filter(
    (progress) => progress.ratio < 1
  ).length;
  if (unfinished > 0) {
    counts.goals = unfinished;
  }
  // the blockers nothing in the queue produces: the only ones a trip fixes
  const roots = context.advice?.roots.length ?? 0;
  if (roots > 0) {
    counts.craftworks = roots;
  }
  return counts;
};

const summarizeAttention = (
  advice: Advice | undefined,
  readyRequests: number
): { count: number; parts: string[] } => {
  const parts: string[] = [];
  if (advice && advice.dead.length > 0) {
    parts.push(`${plural(advice.dead.length, "slot")} at cap`);
  }
  if (advice && advice.ordering.length > 0) {
    parts.push(`${plural(advice.ordering.length, "slot")} out of order`);
  }
  if (readyRequests > 0) {
    parts.push(`${plural(readyRequests, "request")} ready`);
  }
  return {
    count:
      (advice ? advice.dead.length + advice.ordering.length : 0) +
      readyRequests,
    parts,
  };
};

const setBadge = (count: number, parts: string[], isStale = false): void => {
  const button = document.querySelector<HTMLElement>(`#${BUTTON_ID}`);
  if (!button) {
    return;
  }
  button.title =
    parts.length > 0
      ? `Farmhand briefing — ${parts.join(", ")}${
          isStale ? " (from the last read)" : ""
        }`
      : "Farmhand briefing";
  const existing = button.querySelector<HTMLElement>(".fh-badge");
  if (count <= 0) {
    existing?.remove();
    return;
  }
  const badge = existing ?? document.createElement("span");
  badge.className = "fh-badge";
  badge.textContent = String(count);
  if (!existing) {
    button.append(badge);
  }
};

const makeHeading = (text: string): HTMLDivElement => {
  const heading = document.createElement("div");
  heading.textContent = text;
  heading.style.color = TEXT_WHITE;
  heading.style.fontSize = "11px";
  heading.style.fontWeight = "bold";
  heading.style.letterSpacing = "0.4px";
  heading.style.textTransform = "uppercase";
  heading.style.margin = "12px 0 4px";
  return heading;
};

const formatHits = (hits: number): string =>
  hits >= 100 ? Math.round(hits).toLocaleString() : hits.toFixed(1);

const fetchActiveQuests = async (): Promise<
  ReturnType<typeof parseActiveQuests> | undefined
> => {
  try {
    const response = await getHTML(Page.QUESTS, new URLSearchParams());
    return parseActiveQuests(response.body);
  } catch {
    return undefined;
  }
};

interface Context {
  advice?: Advice;
  cap?: number;
  craftworks?: CraftworksSnapshot;
  goalProgress: GoalProgress[];
  goals: TrackedGoal[];
  graph: RecipeGraph;
  inventory: Record<string, number>;
  // the explore or fishing spot in view, when there is one
  here?: { location: LocationRef; stamina?: number };
  itemNames: string[];
  mastery: MasteryEntry[];
  perks?: { currentPerkSetId?: number; perkSets: PerkSet[] };
  questGoals?: Awaited<ReturnType<typeof getQuestGoals>>;
  // every demand on you -- tracked goals, open requests, stalled queue slots --
  // resolved once, so each tab reasons from the same numbers
  resolved: ResolvedNeeds;
  statuses: ReturnType<typeof getGoalStatuses>;
  unlimited: UnlimitedItems;
}

// Identify the explore or fishing spot in view, if the panel was opened on one.
//
// This lives in the panel rather than on the page itself because the panel is
// the surface that reliably renders: injecting a card into the explore page
// meant guessing at its structure, and a wrong guess fails silently.
const getHere = async (): Promise<Context["here"]> => {
  const page = getCurrentPage();
  if (!page) {
    return undefined;
  }
  // The page's own identity, not the URL. Framework7 does not always put the
  // route in the hash -- exploring shows a bare "farmrpg.com/#" -- so gating on
  // the address meant this returned before it had looked at anything, which is
  // also why it never reached a log line. `data-page` is what the page actually
  // declares itself to be.
  const route = window.location.hash || window.location.pathname;
  const identity = page.dataset.page;
  const isLocation =
    identity === Page.AREA ||
    identity === Page.FISHING ||
    /\b(?:area|fishing)\.php/.test(route);
  if (!isLocation) {
    return undefined;
  }
  const locations = await getLocationEntries();
  const centre = document.querySelector(".navbar-on-center .center");
  const title =
    [...(centre?.childNodes ?? [])]
      .find((node) => node.nodeType === Node.TEXT_NODE)
      ?.textContent?.trim() ??
    centre?.textContent?.trim() ??
    "";
  const header = page.querySelector<HTMLImageElement>(
    "img[src*='/img/items/']"
  );
  const name =
    matchLocationName(
      title,
      locations.map((entry) => entry.name)
    ) ??
    (header
      ? matchLocationByImage(header.getAttribute("src") ?? "", locations)
      : undefined);
  if (!name) {
    console.debug("[Farmhand] could not identify this location", {
      image: header?.getAttribute("src"),
      known: locations.length,
      title,
    });
    return undefined;
  }
  let location = await orUndefined(locationDataState.get({ query: name }));
  // entries cached before drop tables existed carry no `drops`, and that cache
  // lives a week
  if (location && !location.drops) {
    location = await orUndefined(
      locationDataState.get({ query: name, ignoreCache: true })
    );
  }
  if (!location?.drops?.length) {
    console.debug("[Farmhand] no drop table for", name, location);
    return undefined;
  }
  const staminaText = page.querySelector("#stamina")?.textContent ?? "";
  return {
    location,
    stamina:
      Number(staminaText.replaceAll(",", "").trim()) ||
      parseStamina(page.textContent ?? ""),
  };
};

// Everything the three tabs need, gathered once. Switching tabs re-renders from
// this rather than re-fetching, so only the refresh control costs requests.
const loadContext = async (force: boolean): Promise<Context> => {
  const settings = await getSettingValues();
  const unlimited = parseUnlimitedItems(
    String(settings[SettingId.UNLIMITED_ITEMS] ?? "")
  );
  const [snapshot, craftworks, quests, goals, mastery, basicItems] =
    await Promise.all([
      orUndefined(inventoryState.get({ ignoreCache: force })),
      orUndefined(craftworksState.get({ ignoreCache: force })),
      fetchActiveQuests(),
      getGoals(),
      orUndefined(masteryState.get({ ignoreCache: force })),
      orUndefined(getBasicItems()),
    ]);
  const inventory = snapshot?.quantities ?? {};
  const cap = snapshot?.cap;
  const advice = craftworks
    ? adviseOnSlots(craftworks.slots, cap, unlimited)
    : undefined;
  const questGoals = quests ? await getQuestGoals(quests) : undefined;
  const graph = await gatherRecipeGraph([
    ...(questGoals?.goals ?? []).flatMap((goal) =>
      goal.needs.map((need) => need.name)
    ),
    ...(advice?.roots.map((root) => root.name) ?? []),
    ...goals.map((goal) => goal.name),
  ]);
  return {
    advice,
    cap,
    craftworks,
    here: await getHere(),
    goalProgress: goals.map((goal) =>
      getGoalProgress(graph, goal, inventory, unlimited, mastery?.entries ?? [])
    ),
    goals,
    graph,
    inventory,
    itemNames: (basicItems ?? []).map((item) => item.name),
    mastery: mastery?.entries ?? [],
    perks: await orUndefined(perksState.get()),
    questGoals,
    resolved: resolveNeeds(
      graph,
      buildNeeds({
        craftworksRoots: advice?.roots ?? [],
        questGoals: questGoals?.goals ?? [],
        trackedGoals: goals,
      }),
      inventory,
      unlimited,
      mastery?.entries ?? []
    ),
    statuses: getGoalStatuses(
      graph,
      questGoals?.goals ?? [],
      inventory,
      unlimited
    ),
    unlimited,
  };
};

// The item names the backlog wants, for matching Craftworks set names against.
// Everything outstanding, not only what was tracked by hand: a set that makes
// an intermediate a request needs is worth offering too.
const getWantedNames = (context: Context): string[] => {
  const names = new Set<string>();
  for (const status of context.resolved.statuses) {
    if (status.need.kind === "item" && !status.isReady) {
      names.add(status.need.item);
    }
  }
  for (const entry of context.resolved.missing) {
    names.add(entry.name);
  }
  return [...names];
};

// Takes exactly what to source. It used to fold in quest bottlenecks itself
// regardless of caller, which meant the Goals tab quoted trips for items no
// tracked goal wanted — each tab now decides what its own list means.
const renderWhereToGo = async (
  body: HTMLElement,
  context: Context,
  missing: { name: string; quantity: number }[]
): Promise<void> => {
  const { graph } = context;
  const sourcing = planSourcing(graph, missing);
  if (sourcing.locations.length === 0) {
    return;
  }
  body.append(makeHeading("Where to go"));
  const top = sourcing.locations.slice(0, MAX_LISTED);
  const references = await Promise.all(
    top.map((entry) =>
      orUndefined(locationDataState.get({ query: entry.location }))
    )
  );
  for (const [index, entry] of top.entries()) {
    const color = entry.items.length > 1 ? TEXT_SUCCESS : TEXT_GRAY;
    const parts: (string | Node)[] = [
      makeLocationLink(entry.location, references[index], color),
      ` ~${formatHits(entry.hits)} ${
        entry.type === "fishing" ? "casts" : "explores"
      } — `,
    ];
    for (const [itemIndex, item] of entry.items.slice(0, 4).entries()) {
      if (itemIndex > 0) {
        parts.push(", ");
      }
      parts.push(
        makeItemLink(item.name, graph.nodes.get(item.name)?.id, color)
      );
    }
    body.append(makeLinkedLine(color, parts));
  }
};

// Why the scope wants an item, for the "Here" list -- standing in a place, the
// question is which of your undertakings this drop is actually for.
const getReasonsByItem = (
  resolved: ResolvedNeeds,
  only: ReadonlySet<string>
): Map<string, string[]> => {
  const reasons = new Map<string, string[]>();
  for (const scope of resolved.scopes) {
    if (only.size > 0 && !only.has(scope.rootId)) {
      continue;
    }
    for (const entry of scope.missing) {
      reasons.set(entry.name, [
        ...(reasons.get(entry.name) ?? []),
        scope.label,
      ]);
    }
  }
  return reasons;
};

// What the place you are standing in is worth right now.
//
// Both halves come from data the panel already paid for -- `getHere` fetches
// the drop table on every open -- and neither is anywhere in the game: `needed`
// is this location's table intersected with your backlog, and `wasted` is the
// opposite and the sharper of the two, items you are already at cap on whose
// every drop is discarded, along with the mastery that discard is costing you.
const renderHere = (
  body: HTMLElement,
  context: Context,
  missing: { name: string; quantity: number }[],
  focused: ReadonlySet<string>
): void => {
  const { cap, here, inventory, mastery, resolved } = context;
  if (!here) {
    return;
  }
  const { location, stamina } = here;
  const advice = getLocationAdvice(
    location.drops,
    missing,
    getReasonsByItem(resolved, focused),
    inventory,
    cap,
    mastery
  );
  if (advice.needed.length === 0 && advice.wasted.length === 0) {
    return;
  }
  const attempts = location.type === "fishing" ? "casts" : "explores";
  body.append(makeHeading(`Here: ${location.name}`));

  for (const entry of advice.needed.slice(0, MAX_LISTED)) {
    // Stamina is the whole reason to know this while standing here: whether
    // the trip finishes the item or only dents it.
    const covered =
      stamina !== undefined && stamina >= entry.attempts
        ? " — you have the stamina"
        : "";
    body.append(
      makeLinkedLine(TEXT_SUCCESS, [
        makeItemLink(entry.name, entry.id, TEXT_SUCCESS),
        ` ${entry.quantity.toLocaleString()} needed, ~${formatHits(
          entry.attempts
        )} ${attempts}${covered}`,
        entry.reasons.length > 0
          ? ` — for ${entry.reasons.slice(0, 2).join(", ")}`
          : "",
      ])
    );
  }
  if (advice.needed.length === 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, ["Nothing you are short of drops here."])
    );
  }

  for (const entry of advice.wasted.slice(0, MAX_LISTED)) {
    body.append(
      makeLinkedLine(TEXT_ERROR, [
        makeItemLink(entry.name, entry.id, TEXT_ERROR),
        " is at cap — every one you find here is thrown away",
        entry.masteryRemaining === undefined
          ? ""
          : `, and it still owes ${entry.masteryRemaining.toLocaleString()} mastery`,
      ])
    );
  }
  if (stamina !== undefined) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [`${stamina.toLocaleString()} stamina banked`])
    );
  }
};

const renderNow = async (
  body: HTMLElement,
  context: Context,
  focused: ReadonlySet<string>
): Promise<void> => {
  const { advice, goalProgress, graph, questGoals, resolved, statuses } =
    context;
  const focusedScopes = resolved.scopes.filter((scope) =>
    focused.has(scope.rootId)
  );
  // Scope ids are `kind:label`, and the legacy statuses this tab still reads
  // are keyed by that same label, so this is how focus reaches them without
  // moving the whole tab onto `resolved` in one go.
  const focusedLabels = new Set(focusedScopes.map((scope) => scope.label));
  // Focus decides what survives the cut to MAX_LISTED rather than hiding
  // anything: the alert sections are the things you must not miss, focused or
  // not, so they SORT rather than filter.
  const byFocus = (a: GoalStatus, b: GoalStatus): number =>
    Number(focusedLabels.has(b.goal.label)) -
    Number(focusedLabels.has(a.goal.label));
  const ready = statuses.filter((status) => status.isReady).sort(byFocus);
  const nearlyDone = getNearlyDone(statuses).sort(byFocus);

  if (ready.length > 0) {
    body.append(makeHeading("Ready to turn in"));
    for (const status of ready.slice(0, MAX_LISTED)) {
      body.append(
        makeLinkedLine(TEXT_SUCCESS, [
          makeQuestLink(status.goal.label, status.goal.href, TEXT_SUCCESS),
        ])
      );
    }
  }
  if (nearlyDone.length > 0) {
    body.append(makeHeading("One item away"));
    for (const status of nearlyDone.slice(0, MAX_LISTED)) {
      const [only] = status.missing;
      body.append(
        makeLinkedLine(TEXT_WARNING, [
          makeQuestLink(status.goal.label, status.goal.href, TEXT_WARNING),
          ` — ${only.quantity.toLocaleString()} × `,
          makeItemLink(only.name, graph.nodes.get(only.name)?.id, TEXT_WARNING),
        ])
      );
    }
  }
  if (advice && advice.dead.length + advice.ordering.length > 0) {
    body.append(makeHeading("Craftworks needs a hand"));
    for (const slot of advice.dead.slice(0, MAX_LISTED)) {
      body.append(
        makeLinkedLine(TEXT_ERROR, [
          makeItemLink(slot.name, Number(slot.id) || undefined, TEXT_ERROR),
          " is at cap — dead slot",
        ])
      );
    }
    for (const { producer, slot } of advice.ordering) {
      body.append(
        makeLinkedLine(TEXT_WARNING, [
          `move #${producer.position} ${producer.name} above #${slot.position} ${slot.name}`,
        ])
      );
    }
  }

  // Craftworks says what a slot is out of but never how many it is short by,
  // so a blocker counts as one unit; a request's shortfall is exact. Both are
  // the same trip, which is why they merge rather than being listed twice.
  //
  // This is the ONE block focus narrows. The sections above are alerts and must
  // never be filtered -- a request going unhanded-in because you focused
  // something else is exactly the failure this panel exists to prevent -- but
  // "where to go" is the block that answers what to do with the next hour, and
  // that question is what focus is for.
  const missing =
    focusedScopes.length > 0
      ? mergeMissing(...focusedScopes.map((scope) => scope.missing))
      : mergeMissing(
          rankBottlenecks(statuses).map((entry) => ({
            name: entry.name,
            quantity: entry.maxNeeded,
          })),
          (advice?.roots ?? []).map((root) => ({
            name: root.name,
            quantity: 1,
          })),
          // tracked goals steer this list too, so setting a goal changes where
          // the panel sends you rather than only what the Goals tab says
          ...goalProgress.map((entry) => entry.missing)
        );
  renderHere(body, context, missing, focused);
  await renderWhereToGo(body, context, missing);

  if (body.childNodes.length === 0) {
    body.append(makeLinkedLine(TEXT_SUCCESS, ["Nothing needs attention."]));
  }
  const { unmatched } = questGoals ?? {};
  if (unmatched?.length) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [`not on buddy.farm: ${unmatched.join(", ")}`])
    );
  }
};

// The whole-undertaking view: one row per thing you are working toward, with
// its own roll-up rather than a flat list of items. This is what the scope axis
// in needs.ts is for -- a quest's items share a pool, so "3 of 5 ready" and the
// shortfall below it are the real figures for finishing it, not the sum of five
// independent questions.
//
// Non-focused rows are dimmed rather than hidden. The panel's job is stopping
// you from missing things, and a quest that vanished because you focused
// another one is exactly the sort of thing you would miss.
const renderUndertakings = (
  body: HTMLElement,
  context: Context,
  focused: ReadonlySet<string>,
  onFocus: (scopeId: string) => void
): void => {
  const { graph, resolved } = context;
  // single-item scopes are tracked goals, which have their own rows below --
  // this section is for things made of several parts
  const scopes = resolved.scopes.filter((scope) => {
    const items = scope.needs.filter((status) => status.need.kind === "item");
    return items.length > 1;
  });
  if (scopes.length === 0) {
    return;
  }
  body.append(makeHeading("Undertakings"));

  // Every focused scope floats above the rest, then progress order within each
  // group -- with several focused at once, "closest to done" is still the order
  // you want to work them in.
  const ordered = [...scopes].sort(
    (a, b) =>
      Number(focused.has(b.rootId)) - Number(focused.has(a.rootId)) ||
      b.ratio - a.ratio
  );

  for (const scope of ordered) {
    const isFocused = focused.has(scope.rootId);
    const isDimmed = focused.size > 0 && !isFocused;
    const items = scope.needs.filter((status) => status.need.kind === "item");
    const ready = items.filter((status) => status.isReady).length;

    const row = document.createElement("div");
    row.className = isDimmed ? "fh-goal fh-dim" : "fh-goal";

    const top = document.createElement("div");
    top.className = "fh-goal-top";
    const name = document.createElement("div");
    name.style.fontSize = "12px";
    let colour = TEXT_WHITE;
    if (scope.isReady) {
      colour = TEXT_SUCCESS;
    } else if (isFocused) {
      colour = TEXT_WARNING;
    }
    const link = document.createElement("span");
    link.style.color = colour;
    link.textContent = scope.label;
    name.append(link);

    const action = document.createElement("span");
    action.className = "fh-goal-action";
    action.style.cursor = "pointer";
    action.style.fontSize = "11px";
    action.style.color = isFocused ? TEXT_WARNING : TEXT_GRAY;
    // Toggling rather than replacing is the whole of multi-focus at this end:
    // pressing focus on a second undertaking adds it instead of dropping the
    // first, which is how two things sharing a material get worked together.
    action.textContent = isFocused ? "focused" : "focus";
    action.addEventListener("click", (event) => {
      event.stopPropagation();
      onFocus(scope.rootId);
    });
    top.append(name, action);
    row.append(top);

    const bar = document.createElement("div");
    bar.className = "fh-bar";
    const fill = document.createElement("div");
    fill.style.width = `${Math.round(scope.ratio * 100)}%`;
    if (!scope.isReady) {
      fill.style.background = TEXT_WARNING;
    }
    bar.append(fill);
    row.append(bar);

    const detail = makeLinkedLine(TEXT_GRAY, [
      `${ready}/${items.length} ready`,
      scope.missing.length > 0 ? " — short " : "",
      ...scope.missing
        .slice(0, 3)
        .flatMap((entry, index) => [
          index > 0 ? ", " : "",
          makeItemLink(entry.name, graph.nodes.get(entry.name)?.id, TEXT_GRAY),
          ` x${entry.quantity}`,
        ]),
      scope.missing.length > 3 ? `, +${scope.missing.length - 3} more` : "",
    ]);
    detail.style.fontSize = "11px";
    detail.style.marginBottom = "0";
    row.append(detail);
    body.append(row);
  }
};

const renderGoals = async (
  body: HTMLElement,
  context: Context,
  rerender: () => void,
  focused: ReadonlySet<string>,
  onFocus: (scopeId: string) => void
): Promise<void> => {
  const { goalProgress, goals, graph } = context;
  renderUndertakings(body, context, focused, onFocus);
  if (goals.length === 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [
        "No goals yet — pick one below, or use “Track as goal” on any item page.",
      ])
    );
  }

  for (const progress of goalProgress) {
    const { canMakeNow, goal, have, missing, ratio } = progress;
    const row = document.createElement("div");
    row.className = "fh-goal";

    const top = document.createElement("div");
    top.className = "fh-goal-top";
    const name = document.createElement("div");
    name.style.fontSize = "12px";
    name.append(
      makeItemLink(
        goal.name,
        graph.nodes.get(goal.name)?.id,
        ratio >= 1 ? TEXT_SUCCESS : TEXT_WHITE
      )
    );
    const remove = document.createElement("span");
    remove.className = "fh-goal-remove";
    remove.textContent = "×";
    remove.title = `Stop tracking ${goal.name}`;
    remove.addEventListener("click", async (event) => {
      event.stopPropagation();
      await removeGoal(goal.name);
      rerender();
    });
    top.append(name, remove);

    const bar = document.createElement("div");
    bar.className = "fh-bar";
    const fill = document.createElement("div");
    fill.style.width = `${Math.round(ratio * 100)}%`;
    if (ratio < 1) {
      fill.style.background = TEXT_WARNING;
    }
    bar.append(fill);

    const detail =
      ratio >= 1
        ? `ready — ${have} on hand${
            canMakeNow > 0 ? `, ${canMakeNow} craftable` : ""
          }`
        : `${have}/${goal.quantity} made · ${canMakeNow} craftable now`;
    row.append(top, bar, makeLinkedLine(TEXT_GRAY, [detail]));

    if (missing.length > 0) {
      const parts: (string | Node)[] = ["short: "];
      for (const [index, entry] of missing.slice(0, 4).entries()) {
        if (index > 0) {
          parts.push(", ");
        }
        parts.push(
          `${entry.quantity.toLocaleString()} × `,
          makeItemLink(
            entry.name,
            graph.nodes.get(entry.name)?.id,
            TEXT_WARNING
          )
        );
      }
      row.append(makeLinkedLine(TEXT_WARNING, parts));
    }
    body.append(row);
  }

  // only what the tracked goals themselves need
  if (goalProgress.length > 0) {
    await renderWhereToGo(
      body,
      context,
      mergeMissing(...goalProgress.map((entry) => entry.missing))
    );
  }
  renderSuggestions(body, context, rerender);
};

// Suggestions are offered, never auto-adopted. Mastery alone would add hundreds
// of entries and the tab would stop being a place to look for what matters, so
// the player promotes the few they actually intend to chase.
type SuggestionFilter = "all" | "set" | "mastery" | "quest";

// Panel-scoped, not persisted: a filter is a way to read the list right now,
// not a preference worth carrying between sessions.
let suggestionFilter: SuggestionFilter = "all";

const FILTER_LABELS: { id: SuggestionFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "set", label: "Sets" },
  { id: "mastery", label: "Mastery" },
  { id: "quest", label: "Requests" },
];

// Suggestions are offered, never auto-adopted. Mastery alone would add hundreds
// of entries and the tab would stop being a place to look for what matters, so
// the player promotes the few they actually intend to chase.
//
// Unfiltered, each source contributes a few so no one of them crowds the others
// out. Picking a category then shows far more of it — filtering is for reading
// deeper into one source, not only for hiding the rest.
const PER_SOURCE_UNFILTERED = 3;
const PER_SOURCE_FILTERED = 10;

const renderSuggestions = (
  body: HTMLElement,
  context: Context,
  rerender: () => void
): void => {
  const {
    cap,
    craftworks,
    goals,
    graph,
    inventory,
    itemNames,
    mastery,
    questGoals,
  } = context;
  const bySource: Record<Exclude<SuggestionFilter, "all">, GoalSuggestion[]> = {
    mastery: getMasterySuggestions(
      mastery,
      inventory,
      cap,
      goals,
      PER_SOURCE_FILTERED
    ),
    quest: getQuestSuggestions(
      questGoals?.goals ?? [],
      inventory,
      goals,
      PER_SOURCE_FILTERED
    ),
    set: getSetSuggestions(
      craftworks?.sets ?? [],
      itemNames,
      goals,
      inventory,
      PER_SOURCE_FILTERED
    ),
  };
  const total =
    bySource.set.length + bySource.mastery.length + bySource.quest.length;
  if (total === 0) {
    return;
  }

  body.append(makeHeading("Suggested"));
  const chips = document.createElement("div");
  chips.className = "fh-chips";
  const list = document.createElement("div");
  body.append(chips, list);

  const drawList = (): void => {
    list.textContent = "";
    const shown =
      suggestionFilter === "all"
        ? [
            // saved sets first: goals the player has already been keeping
            ...bySource.set.slice(0, PER_SOURCE_UNFILTERED),
            ...bySource.mastery.slice(0, PER_SOURCE_UNFILTERED),
            ...bySource.quest.slice(0, PER_SOURCE_UNFILTERED),
          ]
        : bySource[suggestionFilter];
    for (const chip of chips.children) {
      (chip as HTMLElement).dataset.active = String(
        (chip as HTMLElement).dataset.filter === suggestionFilter
      );
    }
    for (const suggestion of shown) {
      const row = document.createElement("div");
      row.className = "fh-goal-top";
      row.style.marginBottom = "4px";
      const text = makeLinkedLine(
        suggestion.isFrozen ? TEXT_ERROR : TEXT_GRAY,
        [
          makeItemLink(
            suggestion.name,
            suggestion.id ?? graph.nodes.get(suggestion.name)?.id,
            suggestion.isFrozen ? TEXT_ERROR : TEXT_WHITE
          ),
          ` ${suggestion.quantity.toLocaleString()} more — ${
            suggestion.reason
          }`,
        ]
      );
      text.style.marginBottom = "0";
      const add = document.createElement("span");
      add.className = "fh-goal-remove";
      add.style.color = TEXT_SUCCESS;
      add.textContent = "+";
      add.title = `Track ${suggestion.name}`;
      add.addEventListener("click", async (event) => {
        event.stopPropagation();
        await addGoal(
          suggestion.name,
          suggestion.quantity,
          suggestion.source === "mastery" ? "mastery" : undefined
        );
        rerender();
      });
      row.append(text, add);
      list.append(row);
    }
  };

  const select = (filter: SuggestionFilter): void => {
    suggestionFilter = filter;
    drawList();
  };
  for (const entry of FILTER_LABELS) {
    const count = entry.id === "all" ? total : bySource[entry.id].length;
    // a category with nothing in it is not worth a chip
    if (count === 0) {
      continue;
    }
    const chip = document.createElement("span");
    chip.className = "fh-chip";
    chip.dataset.filter = entry.id;
    chip.textContent = `${entry.label} ${count}`;
    chip.addEventListener("click", (event) => {
      event.stopPropagation();
      select(entry.id);
    });
    chips.append(chip);
  }
  // a filter left over from a previous draw may no longer have any entries
  if (suggestionFilter !== "all" && bySource[suggestionFilter].length === 0) {
    suggestionFilter = "all";
  }
  drawList();
};

// Start/stop for the whole queue. Both calls are reversible and take no
// parameters, so unlike loading a set this needs no confirmation.
const makeQueueToggle = (
  craftworks: CraftworksSnapshot,
  reload: () => void
): HTMLAnchorElement => {
  const running = craftworks.slots.filter((slot) => !slot.isPaused).length;
  const isRunning = running > 0;
  const toggle = document.createElement("a");
  toggle.href = "#";
  toggle.style.fontSize = "11px";
  toggle.style.whiteSpace = "nowrap";
  toggle.style.textDecoration = "underline";
  toggle.style.color = isRunning ? TEXT_WARNING : TEXT_SUCCESS;
  toggle.textContent = isRunning ? "pause all" : "start all";
  toggle.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggle.textContent = isRunning ? "pausing…" : "starting…";
    toggle.style.color = TEXT_GRAY;
    const ok = await setQueueRunning(!isRunning);
    if (!ok) {
      toggle.textContent = "failed — try again";
      toggle.style.color = TEXT_ERROR;
      return;
    }
    reload();
  });
  return toggle;
};

const renderCraftworks = (
  body: HTMLElement,
  context: Context,
  reload: () => void,
  focused: ReadonlySet<string>
): void => {
  const {
    advice,
    cap,
    craftworks,
    graph,
    inventory,
    mastery,
    resolved,
    unlimited,
  } = context;
  if (!advice || !craftworks) {
    body.append(
      makeLinkedLine(TEXT_GRAY, ["Could not read the Craftworks queue."])
    );
    return;
  }
  const maxSlots = craftworks.maxSlots ?? craftworks.slots.length;
  const free = maxSlots - craftworks.slots.length;
  const summary = document.createElement("div");
  summary.className = "fh-goal-top";
  summary.style.marginBottom = "4px";
  const summaryText = makeLinkedLine(
    advice.working.length > 0 ? TEXT_GRAY : TEXT_WARNING,
    [
      `${advice.working.length} of ${craftworks.slots.length} slots crafting`,
      free > 0 ? `, ${free} free` : "",
    ]
  );
  summaryText.style.marginBottom = "0";
  summary.append(summaryText, makeQueueToggle(craftworks, reload));
  body.append(summary);

  for (const slot of craftworks.slots) {
    const isDead = advice.dead.includes(slot);
    const isStalled = slot.blockedOn.length > 0 && !isDead;
    let color = TEXT_SUCCESS;
    if (isDead) {
      color = TEXT_ERROR;
    } else if (isStalled) {
      color = TEXT_WARNING;
    }
    const parts: (string | Node)[] = [
      `${slot.position}. `,
      makeItemLink(slot.name, Number(slot.id) || undefined, color),
    ];
    if (isDead) {
      parts.push(" — at cap, dead slot");
    } else if (slot.isPaused) {
      parts.push(" — paused");
    } else if (isStalled) {
      parts.push(
        ` — out of ${slot.blockedOn.map((entry) => entry.name).join(", ")}`
      );
    } else {
      parts.push(" — crafting");
    }
    body.append(makeLinkedLine(color, parts));
  }

  const active = (craftworks.sets ?? []).find((set) => set.isActive);
  if (active) {
    body.append(makeLinkedLine(TEXT_GRAY, [`active set: ${active.name}`]));
  }
  renderSetLoader(body, context, reload);

  const frozen = getFrozenMastery(mastery, inventory, cap);
  if (frozen.length > 0) {
    body.append(makeHeading("Mastery frozen at cap"));
    for (const entry of frozen.slice(0, MAX_LISTED)) {
      body.append(
        makeLinkedLine(TEXT_ERROR, [
          makeItemLink(entry.name, entry.id, TEXT_ERROR),
          ` ${entry.value.toLocaleString()}/${entry.required.toLocaleString()} — ${entry.remaining.toLocaleString()} more, but you are at cap so none of it counts`,
        ])
      );
    }
  }

  if (advice.supplied.length > 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [
        `auto-bought, ignore: ${advice.supplied
          .map((entry) => entry.name)
          .join(", ")}`,
      ])
    );
  }

  // Suggestions are goal-driven when there are goals; otherwise the queue's own
  // stalled slots are the only thing there is to reason from.
  // Everything that wants something, at the quantity it wants: tracked goals,
  // open requests and the queue's own stalled slots. The old list was tracked
  // goals alone, falling back to ONE of each thing a slot was stalled on --
  // which is how the queue filled up with single units of things nothing
  // actually needed much of.
  const desired = getDesiredQueueForNeeds(
    graph,
    resolved,
    inventory,
    unlimited,
    // with focus set the queue works on those undertakings alone
    focused
  );
  const suggestions = suggestQueueChanges(
    desired,
    craftworks.slots,
    inventory,
    cap,
    maxSlots,
    unlimited
  );
  if (suggestions.length > 0) {
    body.append(makeHeading("Suggested changes"));
    for (const suggestion of suggestions) {
      const color = suggestion.action === "drop" ? TEXT_ERROR : TEXT_SUCCESS;
      body.append(
        makeLinkedLine(color, [
          suggestion.action === "drop" ? "remove " : "add ",
          makeItemLink(
            suggestion.name,
            graph.nodes.get(suggestion.name)?.id,
            color
          ),
          ` — ${suggestion.reason}`,
        ])
      );
    }
    // only when there is genuinely nothing to aim at -- suggestions now come
    // from open requests and stalled slots too, not tracked goals alone
    if (resolved.scopes.length === 0) {
      body.append(
        makeLinkedLine(TEXT_GRAY, [
          "Track a goal to get suggestions aimed at something.",
        ])
      );
    }
  }
};

// Loading a set is destructive: it clears the queue first. So it takes two
// presses -- the second states exactly how many items it will clear -- and on
// failure it offers to put the old queue back, which the game's own button
// cannot do because it never knew what was there.
const makeSetLoadControl = (
  set: { id: string; name: string },
  context: Context,
  reload: () => void,
  onFailure: (node: Node) => void
): HTMLAnchorElement => {
  const slots = context.craftworks?.slots ?? [];
  const action = document.createElement("a");
  action.href = "#";
  action.style.color = TEXT_SUCCESS;
  action.style.fontSize = "12px";
  action.style.textDecoration = "underline";
  action.textContent = "load";
  let armed = false;
  action.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!armed) {
      armed = true;
      action.textContent = `confirm — clears ${slots.length} item${
        slots.length === 1 ? "" : "s"
      }`;
      action.style.color = TEXT_WARNING;
      return;
    }
    action.textContent = "loading…";
    action.style.color = TEXT_GRAY;
    // a set you just chose should start working immediately
    const result = await activateSet(set.id, slots, true);
    if (result.ok) {
      reload();
      return;
    }
    onFailure(makeMutedText(` ${result.message}`));
    action.textContent = "put the old queue back";
    action.style.color = TEXT_ERROR;
    action.addEventListener(
      "click",
      async (undoEvent) => {
        undoEvent.preventDefault();
        undoEvent.stopPropagation();
        action.textContent = "restoring…";
        const restored = await restoreQueue(result.previous);
        action.textContent = `restored ${restored} of ${result.previous.length}`;
        reload();
      },
      { once: true }
    );
  });
  return action;
};

const renderSetLoader = (
  body: HTMLElement,
  context: Context,
  reload: () => void
): void => {
  const { craftworks, itemNames } = context;
  if (!craftworks) {
    return;
  }
  const recommended = getRecommendedSet(
    getWantedNames(context),
    craftworks.sets ?? [],
    itemNames
  );
  if (!recommended) {
    return;
  }
  const line = makeLinkedLine(TEXT_SUCCESS, [
    `“${recommended.name}” matches your ${recommended.goalName} goal — `,
  ]);
  line.append(
    makeSetLoadControl(recommended, context, reload, (node) =>
      line.append(node)
    )
  );
  body.append(line);
};

// Every saved set, loadable in place. The recommendation alone was too easy to
// miss: it only appears when a tracked goal happens to share a name with a set,
// so a queue of location loadouts showed nothing at all.
// Perk sets live here rather than in a tab of their own: this tab is already
// the loadouts you switch between, and a fifth tab would not fit the panel's
// width, let alone a thumb. Switching is forced, because the reason to reach
// for it by hand is that the automatic switch is not being trusted -- and the
// fast path would otherwise no-op on the very state in doubt.
const renderPerkSets = (
  body: HTMLElement,
  context: Context,
  reload: () => void
): void => {
  const perkSets = context.perks?.perkSets ?? [];
  if (perkSets.length === 0) {
    return;
  }
  const status = getPerkStatus();
  body.append(makeHeading("Perk sets"));

  // Auto manage is repeated here, not only on the game's settings page, for two
  // reasons: that page is genuinely hard to reach on a phone, and this is the
  // one setting whose being off is indistinguishable from the reconciler being
  // broken -- manual equipping below still works, because it calls
  // activatePerkSet directly and never consults the setting.
  const autoSetting = getSettings().find(
    (setting): setting is BooleanFeatureSetting =>
      setting.id === SettingId.PERK_MANAGER && setting.type === "boolean"
  );
  if (autoSetting) {
    const row = document.createElement("div");
    row.style.alignItems = "center";
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.marginBottom = "5px";
    const label = document.createElement("span");
    label.style.fontSize = "11px";
    const toggle = document.createElement("a");
    toggle.href = "#";
    toggle.style.color = TEXT_GRAY;
    toggle.style.fontSize = "11px";
    toggle.style.marginLeft = "auto";
    toggle.style.textDecoration = "underline";
    const paintAuto = (isOn: boolean): void => {
      label.textContent = `Auto manage: ${isOn ? "on" : "off"}`;
      label.style.color = isOn ? TEXT_SUCCESS : TEXT_WARNING;
      toggle.textContent = isOn ? "turn off" : "turn on";
    };
    paintAuto(Boolean(autoSetting.defaultValue));
    getSetting(autoSetting)
      .then((current) => {
        paintAuto(Boolean(current.value));
      })
      .catch((error) => {
        console.error("Failed to read the perk auto-manage setting", error);
      });
    toggle.addEventListener("click", async (event) => {
      event.preventDefault();
      const current = await getSetting(autoSetting);
      const next = !current.value;
      toggle.textContent = "saving…";
      await setSetting({ ...autoSetting, value: next });
      paintAuto(next);
      // turning it on should take effect where you are, not at the next
      // navigation -- otherwise it reads as not having worked
      reload();
    });
    row.append(label, toggle);
    body.append(row);
  }

  if (status.note) {
    body.append(makeLinkedLine(TEXT_GRAY, [status.note]));
  }

  // Activity sets are matched by NAME, case-insensitively and exactly, so a set
  // called "explore" or "def" is invisible to the reconciler while still being
  // perfectly equippable by hand below. Without a set named "Default" the
  // reconciler bails before it switches anything at all, which looks exactly
  // like auto manage being broken -- so say so here rather than leave it to be
  // deduced.
  const activityNames = new Set(
    Object.values(PerkActivity)
      .filter((activity) => activity !== PerkActivity.UNKNOWN)
      .map((activity) => activity.toLowerCase())
  );
  const isActivityName = (name: string): boolean =>
    activityNames.has(name.trim().toLowerCase());
  if (!perkSets.some((set) => isActivityName(set.name))) {
    body.append(
      makeLinkedLine(TEXT_ERROR, [
        "none of these names match an activity — nothing can auto-switch",
      ])
    );
  } else if (
    !perkSets.some((set) => set.name.trim().toLowerCase() === "default")
  ) {
    body.append(
      makeLinkedLine(TEXT_ERROR, [
        'no set named "Default" — the reconciler stops before it switches',
      ])
    );
  }

  for (const set of perkSets) {
    const isOn = status.isConfirmed && status.name === set.name;
    const row = document.createElement("div");
    row.className = "fh-goal-top";
    row.style.marginBottom = "5px";
    const label = makeLinkedLine(isOn ? TEXT_SUCCESS : TEXT_GRAY, [
      `${set.name}${isOn ? " · on" : ""}${
        isActivityName(set.name) ? "" : " · manual only"
      }`,
    ]);
    label.style.marginBottom = "0";
    row.append(label);
    if (!isOn) {
      const action = document.createElement("a");
      action.href = "#";
      action.style.color = TEXT_SUCCESS;
      action.style.fontSize = "12px";
      action.style.textDecoration = "underline";
      action.textContent = "equip";
      action.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        action.textContent = "equipping…";
        action.style.color = TEXT_GRAY;
        try {
          await activatePerkSet(set, { force: true, settle: true });
          reload();
        } catch {
          action.textContent = "failed — try again";
          action.style.color = TEXT_ERROR;
        }
      });
      row.append(action);
    }
    body.append(row);
  }
};

const renderSets = (
  body: HTMLElement,
  context: Context,
  reload: () => void
): void => {
  const { craftworks, itemNames } = context;
  const sets = craftworks?.sets ?? [];
  if (!craftworks || sets.length === 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, ["No saved sets found on the Craftworks page."])
    );
    return;
  }
  renderPerkSets(body, context, reload);
  if (sets.length > 0) {
    body.append(makeHeading("Craftworks sets"));
  }
  const recommended = getRecommendedSet(
    getWantedNames(context),
    sets,
    itemNames
  );
  for (const set of sets) {
    const row = document.createElement("div");
    row.className = "fh-goal-top";
    row.style.marginBottom = "5px";
    const isRecommended = recommended?.id === set.id;
    let color = TEXT_GRAY;
    if (set.isActive) {
      color = TEXT_WHITE;
    } else if (isRecommended) {
      color = TEXT_SUCCESS;
    }
    let suffix = "";
    if (set.isActive) {
      suffix = " · loaded";
    } else if (isRecommended) {
      suffix = ` · matches your ${recommended?.goalName} goal`;
    }
    const label = makeLinkedLine(color, [`${set.name}${suffix}`]);
    label.style.marginBottom = "0";
    row.append(label);
    // reloading the set already in place would re-run a destructive activation
    // for no change
    if (!set.isActive) {
      row.append(
        makeSetLoadControl(set, context, reload, (node) => label.append(node))
      );
    }
    body.append(row);
  }
};

// One button and one panel for the whole session, hung off document.body.
//
// Framework7 keeps the page you came from in the DOM, so anything appended
// inside a page element gets duplicated as you navigate and the retained copy's
// listeners point at a detached tree — which is exactly how the first attempt
// at this ended up drawn twice with only one of them responding. Living on the
// body sidesteps page swaps entirely, and the same trick keeps the cap tracker
// single.
const ensurePanel = (): void => {
  if (document.querySelector(`#${BUTTON_ID}`)) {
    return;
  }
  injectStyles();

  const button = document.createElement("div");
  button.id = BUTTON_ID;
  button.title = "Farmhand briefing";
  button.innerHTML = ICON;

  const panel = document.createElement("div");
  panel.id = PANEL_ID;

  const head = document.createElement("div");
  head.className = "fh-briefing-head";
  const heading = document.createElement("div");
  heading.style.alignItems = "center";
  heading.style.display = "flex";
  heading.style.gap = "6px";
  // Which perk set the manager believes is on, in the same shape as the marker
  // in the stats bar. On a phone that bar has no room for it and there is no
  // console either, so without this there is no way to tell whether switching
  // is working at all.
  const perkDot = document.createElement("span");
  perkDot.style.borderRadius = "50%";
  perkDot.style.flexShrink = "0";
  perkDot.style.height = "8px";
  perkDot.style.marginLeft = "4px";
  perkDot.style.width = "8px";
  const perkLabel = document.createElement("span");
  perkLabel.style.fontSize = "11px";
  perkLabel.style.whiteSpace = "nowrap";
  const paintPerk = (): void => {
    const status = getPerkStatus();
    let colour = TEXT_GRAY;
    if (status.isConfirmed) {
      colour = TEXT_SUCCESS;
    } else if (status.isPending) {
      colour = TEXT_WARNING;
    }
    perkDot.style.backgroundColor = colour;
    perkLabel.style.color = colour;
    perkLabel.textContent = status.name ?? "no set";
    // the note says which page was recognised and whether the switch landed --
    // the only diagnostic there is without a console
    heading.title = status.note
      ? `Perks: ${status.name ?? "none"} — ${status.note}`
      : `Perks: ${status.name ?? "none"}`;
  };
  paintPerk();
  onPerkStatusChange(paintPerk);
  const title = document.createElement("div");
  title.textContent = "Briefing";
  title.style.color = TEXT_WHITE;
  title.style.fontWeight = "bold";
  // name first, then the perk state: the title is what identifies the panel,
  // and the indicator reads as a status attached to it rather than a label
  // competing with it
  heading.append(title, perkDot, perkLabel);
  const refresh = document.createElement("span");
  refresh.className = "fh-briefing-refresh";
  refresh.textContent = "refresh";
  head.append(heading, refresh);

  const chip = document.createElement("div");
  chip.className = "fh-focus-chip";
  chip.dataset.on = "false";

  const tabs = document.createElement("div");
  tabs.className = "fh-briefing-tabs";
  const body = document.createElement("div");
  body.className = "fh-briefing-body";
  const main = document.createElement("div");
  main.className = "fh-briefing-main";
  main.append(tabs, body);
  panel.append(head, chip, main);
  document.body.append(button, panel);

  let active: TabId = "now";
  let context: Context | undefined;
  let focused: Set<string> = new Set();
  getFocusedScopes()
    .then((scopeIds) => {
      focused = new Set(scopeIds);
      if (context) {
        draw();
      }
    })
    .catch((error) => {
      console.error("Failed to read the focused undertakings", error);
    });

  const persistFocus = (): void => {
    setFocusedScopes([...focused]).catch((error) => {
      console.error("Failed to save the focused undertakings", error);
    });
    draw();
  };

  // Add or remove one, never replace the set: focusing a second undertaking
  // that shares a material with the first is the case worth supporting.
  const toggleFocus = (scopeId: string): void => {
    if (focused.has(scopeId)) {
      focused.delete(scopeId);
    } else {
      focused.add(scopeId);
    }
    persistFocus();
  };

  const clearFocus = (): void => {
    focused = new Set();
    persistFocus();
  };

  const draw = (): void => {
    body.textContent = "";
    if (!context) {
      return;
    }
    // The way out of focus has to be visible from every tab, not only the one
    // you set it from -- otherwise a focus set days ago silently filters the
    // panel and reads as the panel being wrong.
    //
    // A scope id that no longer resolves is simply not drawn rather than
    // dropped from storage: a quest missing from one read of the page (a failed
    // fetch, a stale cache) would otherwise silently unfocus itself.
    const scopes = context.resolved.scopes.filter((entry) =>
      focused.has(entry.rootId)
    );
    chip.textContent = "";
    chip.dataset.on = String(scopes.length > 0);
    for (const scope of scopes) {
      const tag = document.createElement("div");
      tag.className = "fh-focus-tag";
      const chipLabel = document.createElement("span");
      chipLabel.textContent = scope.label;
      const clear = document.createElement("span");
      clear.className = "fh-chip-clear";
      clear.textContent = "✕";
      clear.title = `Stop focusing ${scope.label}`;
      clear.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleFocus(scope.rootId);
      });
      tag.append(chipLabel, clear);
      chip.append(tag);
    }
    if (scopes.length > 1) {
      const all = document.createElement("span");
      all.className = "fh-focus-all";
      all.textContent = "clear all";
      all.addEventListener("click", (event) => {
        event.stopPropagation();
        clearFocus();
      });
      chip.append(all);
    }

    const counts = getTabCounts(context);
    for (const tab of tabs.children) {
      const element = tab as HTMLElement;
      element.dataset.active = String(element.dataset.tab === active);
      const count = counts[element.dataset.tab as TabId];
      const badge = element.querySelector<HTMLElement>(".fh-tab-count");
      if (badge) {
        badge.textContent = count === undefined ? "" : String(count);
      }
    }
    switch (active) {
      case "now": {
        renderNow(body, context, focused);

        break;
      }
      case "goals": {
        renderGoals(
          body,
          context,
          () => {
            // a removed goal changes the list itself, so reload before redrawing
            load(false);
          },
          focused,
          toggleFocus
        );

        break;
      }
      case "sets": {
        renderSets(body, context, () => load(true));

        break;
      }
      default: {
        renderCraftworks(body, context, () => load(true), focused);
      }
    }
  };

  const load = async (force: boolean): Promise<void> => {
    body.textContent = "";
    body.append(makeLinkedLine(TEXT_GRAY, ["Reading your farm…"]));
    context = await loadContext(force);
    const attention = summarizeAttention(
      context.advice,
      context.statuses.filter((status) => status.isReady).length
    );
    setBadge(attention.count, attention.parts);
    draw();
  };

  const selectTab = (id: TabId): void => {
    active = id;
    draw();
  };
  for (const tab of TABS) {
    const element = document.createElement("div");
    element.className = "fh-tab";
    element.dataset.tab = tab.id;
    const tabLabel = document.createElement("span");
    tabLabel.textContent = tab.label;
    const tabCount = document.createElement("span");
    tabCount.className = "fh-tab-count";
    element.append(tabLabel, tabCount);
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      selectTab(tab.id);
    });
    tabs.append(element);
  }

  // Nothing is fetched until the panel is opened. It costs three page fetches
  // plus buddy.farm lookups, and the home page already refetches itself every
  // minute while a meal cooks, so an eager panel would become a steady
  // background load.
  let hasLoaded = false;

  const setOpen = (open: boolean): void => {
    panel.dataset.open = String(open);
    button.dataset.open = String(open);
    if (!open) {
      return;
    }
    if (!hasLoaded) {
      hasLoaded = true;
      load(false);
      return;
    }
    // The panel outlives page navigation, so what it knows about where you are
    // standing goes stale the moment you walk somewhere else. Comparing routes
    // to detect that does not work -- the hash often does not change -- and
    // both lookups behind this are cached, so simply re-derive it every time.
    refreshHere();
  };

  const refreshHere = async (): Promise<void> => {
    const previous = context;
    if (!previous) {
      return;
    }
    const here = await getHere();
    // a full reload may have replaced the context while this was in flight;
    // its `here` is already current, so leave it alone
    if (context === previous) {
      context = { ...previous, here };
      draw();
    }
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(panel.dataset.open !== "true");
  });
  refresh.addEventListener("click", (event) => {
    event.stopPropagation();
    load(true);
  });
  panel.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a")) {
      setOpen(false);
      return;
    }
    event.stopPropagation();
  });
  // Deliberately not closed by clicks elsewhere on the page. The whole point
  // while exploring is to read the advice and keep pressing Continue, and an
  // outside-click-to-close made the panel vanish on the first press.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  setOpen(false);
  primeBadge();
};

// Show a count before the panel has ever been opened, using only what is
// already in GM storage. `doNotFetch` means this cannot cost a request, so a
// stale-but-free number beats no number at all; opening the panel corrects it.
const primeBadge = async (): Promise<void> => {
  const [snapshot, craftworks] = await Promise.all([
    orUndefined(inventoryState.get({ doNotFetch: true })),
    orUndefined(craftworksState.get({ doNotFetch: true })),
  ]);
  if (!craftworks) {
    return;
  }
  // requests are not counted here: reading them costs a fetch, and this runs
  // before the panel has been opened. Marked stale so the tooltip says so
  // rather than implying it is the whole picture.
  const advice = adviseOnSlots(craftworks.slots, snapshot?.cap);
  const attention = summarizeAttention(advice, 0);
  setBadge(attention.count, attention.parts, true);
};

export const briefingPanel: Feature = {
  settings: [SETTING_BRIEFING_PANEL],
  onInitialize: (settings) => {
    if (!settings[SettingId.BRIEFING_PANEL]) {
      return;
    }
    ensurePanel();
  },
  onPageLoad: (settings) => {
    if (!settings[SettingId.BRIEFING_PANEL]) {
      document.querySelector(`#${BUTTON_ID}`)?.remove();
      document.querySelector(`#${PANEL_ID}`)?.remove();
      return;
    }
    // cheap: returns immediately once the button exists. Covers the case where
    // initialization ran before the game shell was ready.
    ensurePanel();
  },
};
