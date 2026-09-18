import {
  activateSet,
  CraftworksSnapshot,
  craftworksState,
  restoreQueue,
  setQueueRunning,
} from "~/api/farmrpg/apis/craftworks";
import { addGoal, getGoalProgress, getGoals, removeGoal } from "~/utils/goals";
import { Advice, adviseOnSlots } from "~/utils/craftworks";
import {
  appendMore,
  BUTTON_ID,
  Context,
  formatAge,
  MAX_LISTED,
  PANEL_ID,
  plural,
} from "./briefing/shared";
import { buildNeeds } from "~/utils/needAdapters";
import { Feature, FeatureSetting } from "../utils/feature";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import {
  getBasicItems,
  getLocationEntries,
  locationDataState,
} from "~/api/buddyfarm/api";
import {
  getCapTrackerView,
  onCapTrackerChange,
  refreshCapTrackerNow,
} from "./inventoryCapWarnings";
import { getCurrentPage, Page } from "~/utils/page";
import { getDiagnostics, onDiagnostic } from "~/utils/diagnostics";
import { getFocusedScopes, setFocusedScopes } from "~/utils/focusScope";
import {
  getFrozenMastery,
  getMasterySuggestions,
  getQuestSuggestions,
  getRecommendedSet,
  getSetSuggestions,
  GoalSuggestion,
} from "~/utils/suggestions";
import { getGoalStatuses, getNearlyDone, GoalStatus } from "~/utils/focus";
import { getHTML } from "~/api/farmrpg/utils/requests";
import {
  getPerkLog,
  getPerkStatus,
  onPerkStatusChange,
} from "~/api/farmrpg/apis/perks";
import { getQuestGoals, parseActiveQuests } from "~/api/farmrpg/apis/quests";
import { getSettingValues, SettingId } from "~/utils/settings";
import { injectPanelStyles } from "./briefing/styles";
import { inventoryState } from "~/api/farmrpg/apis/inventory";
import { Lookup, renderLookup, toLookup } from "./briefing/lookup";
import {
  makeHeading,
  makeItemLink,
  makeLinkedLine,
  makeMutedText,
  makeQuestLink,
  SETTINGS_HREF,
} from "~/utils/gameLinks";
import { makeSearchBox } from "./briefing/search";
import { masteryState } from "~/api/farmrpg/apis/mastery";
import {
  matchLocationByImage,
  matchLocationName,
  parseStamina,
} from "~/utils/locationAdvice";
import { onPageTransition } from "~/utils/pageTransitions";

declare const __VERSION__: string | undefined;
import { orUndefined } from "~/utils/promise";
import { parseUnlimitedItems } from "~/utils/unlimited";
import { renderCapTab } from "./briefing/cap";
import { renderHereTab } from "./briefing/here";
import { renderQueuePlans } from "./briefing/queuePlan";
import { resolveNeeds } from "~/utils/needs";
import {
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";

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

type TabId = "now" | "here" | "goals" | "craftworks" | "cap";
const TABS: { id: TabId; label: string }[] = [
  // strictly what wants you this minute
  { id: "now", label: "Now" },
  // the place you are standing, read against your needs -- or where to go
  { id: "here", label: "Here" },
  { id: "goals", label: "Goals" },
  // the queue and its saved sets, together: sets are craftworks-only and the
  // one thing you open on purpose, so they sit under the queue's alerts
  { id: "craftworks", label: "Craftworks" },
  // items at or near the inventory cap, and who would take them off your hands
  { id: "cap", label: "Cap" },
];

// Inline so it always draws: the game mixes Font Awesome 4 and 6 and neither
// set is guaranteed to carry a given glyph.
const ICON = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h11M3 12h8M3 18h11" />
    <path d="M16 15l3 3 5-6" />
  </svg>`;

// How many things in each tab actually want you. The point of the rail is to
// answer "where is the work" without opening all five, so a tab with nothing
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
  // what drops where you are that you are short of; the tab is the place to
  // answer "is it worth staying"
  if (context.here) {
    const wanted = context.here.location.drops.filter((drop) =>
      context.resolved.scopes.some((scope) =>
        scope.missing.some((entry) => entry.name === drop.name)
      )
    ).length;
    if (wanted > 0) {
      counts.here = wanted;
    }
  }
  const unfinished = context.goalProgress.filter(
    (progress) => progress.ratio < 1
  ).length;
  if (unfinished > 0) {
    counts.goals = unfinished;
  }
  // the blockers nothing in the queue produces: the only ones a trip fixes --
  // or, failing those, a saved set that matches something you want and is not
  // the one loaded (getRecommendedSet skips the active set, so anything it
  // returns is by definition a change)
  const roots = context.advice?.roots.length ?? 0;
  if (roots > 0) {
    counts.craftworks = roots;
  } else if (
    getRecommendedSet(
      getWantedNames(context),
      context.craftworks?.sets ?? [],
      context.itemNames
    )
  ) {
    counts.craftworks = 1;
  }
  // items at cap where you are (or anywhere, before this spot is learned);
  // live tracker state rather than the context, same as the button's badge
  const capView = getCapTrackerView();
  const atCapHere = (capView.here ?? capView.items).filter(
    (item) => item.isAtCap
  ).length;
  if (capView.isEnabled && atCapHere > 0) {
    counts.cap = atCapHere;
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

// The count on the button's left shoulder. Counts what is AT cap where you are
// (or anywhere, when this location's drops aren't known yet); when nothing is
// at cap it falls back to the near-cap count in amber, and to nothing at all
// when there is nothing to say. Live: repainted on every tracker change, not
// only when the panel loads.
const setCapBadge = (): void => {
  const button = document.querySelector<HTMLElement>(`#${BUTTON_ID}`);
  if (!button) {
    return;
  }
  const existing = button.querySelector<HTMLElement>(".fh-cap-badge");
  const view = getCapTrackerView();
  const scope = view.here ?? view.items;
  const atCap = scope.filter((item) => item.isAtCap).length;
  const nearCap = scope.length - atCap;
  if (!view.isEnabled || (atCap === 0 && nearCap === 0)) {
    existing?.remove();
    return;
  }
  const badge = existing ?? document.createElement("span");
  badge.className = "fh-cap-badge";
  badge.dataset.level = atCap > 0 ? "at" : "near";
  badge.textContent = String(atCap > 0 ? atCap : nearCap);
  const where = view.here ? "here" : "in your inventory";
  badge.title =
    atCap > 0
      ? `${plural(atCap, "item")} at cap ${where}${
          nearCap > 0 ? `, ${nearCap} near` : ""
        }`
      : `${plural(nearCap, "item")} near cap ${where}`;
  if (!existing) {
    button.append(badge);
  }
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
  // entries cached before drop tables (or the per-hit figures and icons that
  // came later) existed lack them, and that cache lives a week
  if (location && (!location.drops || location.silverPerHit === undefined)) {
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
    image: locations.find((entry) => entry.name === name)?.image,
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

const renderNow = (
  body: HTMLElement,
  context: Context,
  focused: ReadonlySet<string>
): void => {
  const { advice, graph, questGoals, resolved, statuses } = context;
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
    appendMore(body, ready.length);
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
    appendMore(body, nearlyDone.length);
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
    appendMore(body, advice.dead.length);
    for (const { producer, slot } of advice.ordering) {
      body.append(
        makeLinkedLine(TEXT_WARNING, [
          `move #${producer.position} ${producer.name} above #${slot.position} ${slot.name}`,
        ])
      );
    }
  }

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

const renderGoals = (
  body: HTMLElement,
  context: Context,
  rerender: () => void,
  focused: ReadonlySet<string>,
  onFocus: (scopeId: string) => void
): void => {
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
  const { advice, cap, craftworks, inventory, mastery, resolved } = context;
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

  // The queue the panel would build for what you are doing -- focused
  // undertakings, and the slice of that fed by the spot you are standing at --
  // each row marked queued / not queued against the live slots, and saveable
  // as a set in one press. This replaced the add/remove diff ("Suggested
  // changes"): the plan says the same thing in the order the queue wants, and
  // dead slots are already red in the live list above.
  renderQueuePlans(body, context, focused, reload, (set, onFailure) =>
    makeSetLoadControl(set, context, reload, onFailure)
  );
  // only when there is genuinely nothing to aim at -- the plan costs open
  // requests and stalled slots too, not tracked goals alone
  if (resolved.scopes.length === 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [
        "Track a goal to get a queue plan aimed at something.",
      ])
    );
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
const renderSets = (
  body: HTMLElement,
  context: Context,
  reload: () => void
): void => {
  const { craftworks, itemNames } = context;
  const sets = craftworks?.sets ?? [];
  // Having no sets and never having read the page are different problems with
  // different fixes, and this tab holds nothing else now, so saying "none
  // found" for both sent you looking for sets you had already saved.
  if (!craftworks) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [
        "Haven't read the Craftworks page yet — open it once and refresh.",
      ])
    );
    return;
  }
  if (sets.length === 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [
        "No saved sets. Save one on the Craftworks page and it can be loaded from here.",
      ])
    );
    return;
  }
  body.append(makeHeading("Craftworks sets"));
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
const makeLoadingLine = (): HTMLElement => {
  const line = makeLinkedLine(TEXT_GRAY, ["Reading buddy.farm…"]);
  line.className = "fh-loading";
  return line;
};

const ensurePanel = (): void => {
  if (document.querySelector(`#${BUTTON_ID}`)) {
    return;
  }
  injectPanelStyles();

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
  perkDot.style.width = "8px";
  const perkLabel = document.createElement("span");
  perkLabel.style.fontSize = "11px";
  perkLabel.style.whiteSpace = "nowrap";
  // The chip is the whole indicator, and it opens the note below. The note is
  // the only account of what the manager did -- which page it recognised and
  // whether the switch landed -- and it used to live in a tooltip, which a
  // phone never shows and which is where perk switching is hardest to trust.
  const perkChip = document.createElement("div");
  perkChip.className = "fh-perk-chip";
  perkChip.dataset.on = "false";
  perkChip.append(perkDot, perkLabel);
  const perkNote = document.createElement("div");
  perkNote.className = "fh-perk-note";
  perkNote.dataset.on = "false";
  const perkNoteText = document.createElement("div");
  perkNote.append(perkNoteText);
  const perkLogElement = document.createElement("div");
  perkLogElement.className = "fh-perk-log";
  // The script's own start-up and dispatch log, below the perk log, with the
  // running version on top. Together they are the only account a phone can
  // give of what the script did (see utils/diagnostics.ts).
  const diagnosticsHeading = document.createElement("div");
  diagnosticsHeading.className = "fh-perk-log-heading";
  diagnosticsHeading.textContent = `Farmhand ${__VERSION__ ?? "?"} log`;
  const diagnosticsElement = document.createElement("div");
  diagnosticsElement.className = "fh-perk-log";
  perkNote.append(perkLogElement, diagnosticsHeading, diagnosticsElement);
  const paintLog = (
    element: HTMLElement,
    entries: readonly { at: number; text: string }[]
  ): void => {
    element.replaceChildren();
    for (const entry of entries) {
      const time = document.createElement("span");
      time.className = "fh-perk-log-time";
      time.textContent = new Date(entry.at).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const text = document.createElement("span");
      text.textContent = entry.text;
      element.append(time, text);
    }
    // newest entry last, so that is where the eye should land
    element.scrollTop = element.scrollHeight;
  };
  const paintPerkLog = (): void => {
    paintLog(perkLogElement, getPerkLog());
    paintLog(diagnosticsElement, getDiagnostics());
  };
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
    perkChip.title = status.note
      ? `Perks: ${status.name ?? "none"} — ${status.note}`
      : `Perks: ${status.name ?? "none"}`;
    // No note at all is itself the diagnostic: every path through the manager
    // sets one, so a blank note means it has not run on this page at all.
    perkNoteText.textContent =
      status.note ?? "no note yet — the manager has not acted on this page";
    paintPerkLog();
  };
  paintPerk();
  onPerkStatusChange(paintPerk);
  onDiagnostic(paintPerkLog);
  perkChip.addEventListener("click", (event) => {
    event.stopPropagation();
    const next = perkNote.dataset.on !== "true";
    perkNote.dataset.on = String(next);
    perkChip.dataset.on = String(next);
  });
  const title = document.createElement("div");
  title.textContent = "Briefing";
  title.style.color = TEXT_WHITE;
  title.style.fontWeight = "bold";
  // name first, then the perk state: the title is what identifies the panel,
  // and the indicator reads as a status attached to it rather than a label
  // competing with it
  heading.append(title, perkChip);
  const age = document.createElement("span");
  age.className = "fh-briefing-age";
  const refresh = document.createElement("span");
  refresh.className = "fh-briefing-refresh";
  refresh.textContent = "refresh";
  const settingsLink = document.createElement("a");
  settingsLink.className = "fh-briefing-settings";
  settingsLink.href = SETTINGS_HREF;
  settingsLink.dataset.view = ".view-main";
  settingsLink.textContent = "⚙";
  settingsLink.title = "Farmhand settings";
  settingsLink.setAttribute("aria-label", "Farmhand settings");
  const controls = document.createElement("div");
  controls.className = "fh-briefing-controls";
  controls.append(age, refresh, settingsLink);
  head.append(heading, controls);

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
  // buddy.farm, searched from here and opened in here (see briefing/lookup.ts)
  const search = makeSearchBox((entry) => {
    const lookup = toLookup(entry);
    if (lookup) {
      openLookup(lookup);
    }
  });
  panel.append(head, search.element, perkNote, chip, main);
  document.body.append(button, panel);

  let active: TabId = "now";
  let context: Context | undefined;
  // A lookup replaces the active tab's body until you go back; walking
  // item → quest → item pushes, and back pops. The tabs stay put underneath,
  // so leaving is one press whatever depth you reached.
  const lookups: Lookup[] = [];
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

    paintAge();
    const counts = getTabCounts(context);
    const lookup = lookups.at(-1);
    for (const tab of tabs.children) {
      const element = tab as HTMLElement;
      element.dataset.active = String(
        lookup === undefined && element.dataset.tab === active
      );
      const count = counts[element.dataset.tab as TabId];
      const badge = element.querySelector<HTMLElement>(".fh-tab-count");
      if (badge) {
        badge.textContent = count === undefined ? "" : String(count);
      }
    }
    if (lookup) {
      const bar = document.createElement("div");
      bar.className = "fh-lookup-bar";
      const back = document.createElement("span");
      back.className = "fh-lookup-back";
      back.textContent =
        lookups.length > 1
          ? `‹ ${lookups.at(-2)?.name ?? "back"}`
          : `‹ ${TABS.find((tab) => tab.id === active)?.label ?? "back"}`;
      back.addEventListener("click", (event) => {
        event.stopPropagation();
        lookups.pop();
        draw();
      });
      const kind = document.createElement("span");
      kind.className = "fh-lookup-kind";
      kind.textContent = lookup.kind;
      bar.append(back, kind);
      body.append(bar);
      const view = document.createElement("div");
      body.append(view, makeLoadingLine());
      const snapshot = context;
      renderLookup(view, snapshot, lookup, focused, openLookup)
        .catch((error) => {
          console.error("Failed to draw the lookup", error);
          view.append(
            makeLinkedLine(TEXT_GRAY, ["Could not load that from buddy.farm."])
          );
        })
        .finally(() => {
          body.querySelector(".fh-loading")?.remove();
        });
      return;
    }
    switch (active) {
      case "now": {
        renderNow(body, context, focused);

        break;
      }
      case "here": {
        renderHereTab(body, context, focused).catch((error) => {
          console.error("Failed to draw the Here tab", error);
        });

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
      case "cap": {
        renderCapTab(body, () => {
          refreshCapTrackerNow().catch((error) => {
            console.error("Failed to refresh the cap tracker", error);
          });
        });

        break;
      }
      default: {
        renderCraftworks(body, context, () => load(true), focused);
        // the sets list only makes sense under a queue that was read; its own
        // "haven't read the page" line would repeat the one above
        if (context.craftworks) {
          renderSets(body, context, () => load(true));
        }
      }
    }
  };

  // The tracker refreshes itself off your actions, so the Cap tab and the
  // button's count follow it rather than the panel's own read.
  onCapTrackerChange(() => {
    setCapBadge();
    if (panel.dataset.open === "true" && active === "cap" && context) {
      draw();
    }
  });
  setCapBadge();

  // When the numbers in `context` were read. The panel outlives navigation, so
  // a figure on screen can be from any point in the session.
  let readAt: number | undefined;
  const paintAge = (): void => {
    age.textContent = readAt === undefined ? "" : `read ${formatAge(readAt)}`;
  };
  // Only while it is open, and only once a minute: the label's whole job is to
  // stop a five-minute-old number reading as live.
  setInterval(() => {
    if (panel.dataset.open === "true") {
      paintAge();
    }
  }, 30_000);

  const load = async (force: boolean): Promise<void> => {
    body.textContent = "";
    age.textContent = "reading…";
    body.append(makeLinkedLine(TEXT_GRAY, ["Reading your farm…"]));
    context = await loadContext(force);
    readAt = Date.now();
    paintAge();
    const attention = summarizeAttention(
      context.advice,
      context.statuses.filter((status) => status.isReady).length
    );
    setBadge(attention.count, attention.parts);
    draw();
  };

  const openLookup = (lookup: Lookup): void => {
    const top = lookups.at(-1);
    if (top && top.kind === lookup.kind && top.name === lookup.name) {
      return;
    }
    lookups.push(lookup);
    if (panel.dataset.open !== "true") {
      setOpen(true);
    }
    if (context) {
      draw();
    }
  };

  // A tab switch crossfades where the browser can do it (View Transitions;
  // the panel body is the only named element, so nothing else on the page
  // moves) and simply redraws where it can't. Reduced-motion users get the
  // plain redraw via the stylesheet.
  const selectTab = (id: TabId): void => {
    if (id === active && lookups.length === 0) {
      return;
    }
    lookups.length = 0;
    active = id;
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => {
        draw();
      });
      return;
    }
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
    if (context !== previous) {
      return;
    }
    // Nothing moved, nothing to redraw: this also runs on every page
    // transition now, most of which are between pages that are not
    // locations, and a redraw would throw away a lookup you were reading.
    if (
      here?.location.name === previous.here?.location.name &&
      here?.stamina === previous.here?.stamina
    ) {
      return;
    }
    context = { ...previous, here };
    draw();
  };

  // On a desktop the panel sits open beside the game, so walking from town to
  // the Misty Forest never re-opened it and "here" stayed wherever it was
  // first read. A phone closes and re-opens the panel around every move, which
  // is why the Now tab followed you there and not on a PC. Only while open and
  // loaded: nothing is fetched for a closed panel, as before.
  onPageTransition(() => {
    if (panel.dataset.open === "true" && hasLoaded) {
      refreshHere().catch((error) => {
        console.error("Failed to refresh the panel's location", error);
      });
    }
  });

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
      return;
    }
    // Ctrl/⌘-K: the panel, with the search ready to type into, from anywhere
    // in the game -- the shortcut every launcher uses, and one the game does
    // not bind
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      const target = event.target as HTMLElement | null;
      if (target?.closest("#chatarea, textarea") && !event.metaKey) {
        return;
      }
      event.preventDefault();
      setOpen(true);
      search.focus();
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
