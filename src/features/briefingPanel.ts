import {
  activateSet,
  CraftworksSnapshot,
  craftworksState,
  restoreQueue,
  setQueueRunning,
} from "~/api/farmrpg/apis/craftworks";
import {
  addGoal,
  getDesiredQueue,
  getGoalProgress,
  getGoals,
  GoalProgress,
  removeGoal,
  TrackedGoal,
} from "~/utils/goals";
import { Advice, adviseOnSlots, suggestQueueChanges } from "~/utils/craftworks";
import {
  BORDER_GRAY,
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import { Feature, FeatureSetting } from "../utils/feature";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import { getBasicItems, locationDataState } from "~/api/buddyfarm/api";
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
  mergeMissing,
  rankBottlenecks,
} from "~/utils/focus";
import { getHTML } from "~/api/farmrpg/utils/requests";
import { getQuestGoals, parseActiveQuests } from "~/api/farmrpg/apis/quests";
import { getSettingValues, SettingId } from "~/utils/settings";
import { inventoryState } from "~/api/farmrpg/apis/inventory";
import {
  makeItemLink,
  makeLinkedLine,
  makeLocationLink,
  makeMutedText,
  makeQuestLink,
} from "~/utils/gameLinks";
import { MasteryEntry, masteryState } from "~/api/farmrpg/apis/mastery";
import { orUndefined } from "~/utils/promise";
import { Page } from "~/utils/page";
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
const EDGE_OFFSET = "8px";
const BOTTOM_OFFSET = "62px";

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
      #${PANEL_ID} .fh-briefing-body {
        overflow-y: auto;
        overscroll-behavior: contain;
        flex: 1 1 auto;
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
  itemNames: string[];
  mastery: MasteryEntry[];
  questGoals?: Awaited<ReturnType<typeof getQuestGoals>>;
  statuses: ReturnType<typeof getGoalStatuses>;
  unlimited: UnlimitedItems;
}

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
    goalProgress: goals.map((goal) =>
      getGoalProgress(graph, goal, inventory, unlimited)
    ),
    goals,
    graph,
    inventory,
    itemNames: (basicItems ?? []).map((item) => item.name),
    mastery: mastery?.entries ?? [],
    questGoals,
    statuses: getGoalStatuses(
      graph,
      questGoals?.goals ?? [],
      inventory,
      unlimited
    ),
    unlimited,
  };
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

const renderNow = async (
  body: HTMLElement,
  context: Context
): Promise<void> => {
  const { advice, goalProgress, graph, questGoals, statuses } = context;
  const ready = statuses.filter((status) => status.isReady);
  const nearlyDone = getNearlyDone(statuses);

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
  await renderWhereToGo(
    body,
    context,
    mergeMissing(
      rankBottlenecks(statuses).map((entry) => ({
        name: entry.name,
        quantity: entry.maxNeeded,
      })),
      (advice?.roots ?? []).map((root) => ({ name: root.name, quantity: 1 })),
      // tracked goals steer this list too, so setting a goal changes where the
      // panel sends you rather than only what the Goals tab says
      ...goalProgress.map((entry) => entry.missing)
    )
  );

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

const renderGoals = async (
  body: HTMLElement,
  context: Context,
  rerender: () => void
): Promise<void> => {
  const { goalProgress, goals, graph } = context;
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
        await addGoal(suggestion.name, suggestion.quantity);
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
  reload: () => void
): void => {
  const {
    advice,
    cap,
    craftworks,
    goals,
    graph,
    inventory,
    mastery,
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

  const active = craftworks.sets.find((set) => set.isActive);
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
  const desired =
    goals.length > 0
      ? getDesiredQueue(graph, goals, inventory, unlimited)
      : advice.roots
          .filter((root) => graph.nodes.get(root.name)?.canCraft)
          .map((root) => ({ name: root.name, quantity: 1 }));
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
    if (goals.length === 0) {
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
  const { craftworks, goals, itemNames } = context;
  if (!craftworks) {
    return;
  }
  const recommended = getRecommendedSet(goals, craftworks.sets, itemNames);
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
  const { craftworks, goals, itemNames } = context;
  if (!craftworks || craftworks.sets.length === 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, ["No saved sets found on the Craftworks page."])
    );
    return;
  }
  const recommended = getRecommendedSet(goals, craftworks.sets, itemNames);
  for (const set of craftworks.sets) {
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
  const title = document.createElement("div");
  title.textContent = "Briefing";
  title.style.color = TEXT_WHITE;
  title.style.fontWeight = "bold";
  const refresh = document.createElement("span");
  refresh.className = "fh-briefing-refresh";
  refresh.textContent = "refresh";
  head.append(title, refresh);

  const tabs = document.createElement("div");
  tabs.className = "fh-briefing-tabs";
  const body = document.createElement("div");
  body.className = "fh-briefing-body";
  panel.append(head, tabs, body);
  document.body.append(button, panel);

  let active: TabId = "now";
  let context: Context | undefined;

  const draw = (): void => {
    body.textContent = "";
    if (!context) {
      return;
    }
    for (const tab of tabs.children) {
      (tab as HTMLElement).dataset.active = String(
        (tab as HTMLElement).dataset.tab === active
      );
    }
    switch (active) {
      case "now": {
        renderNow(body, context);

        break;
      }
      case "goals": {
        renderGoals(body, context, () => {
          // a removed goal changes the list itself, so reload before redrawing
          load(false);
        });

        break;
      }
      case "sets": {
        renderSets(body, context, () => load(true));

        break;
      }
      default: {
        renderCraftworks(body, context, () => load(true));
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
    element.textContent = tab.label;
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
    if (open && !hasLoaded) {
      hasLoaded = true;
      load(false);
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
  document.addEventListener("click", () => setOpen(false));
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
