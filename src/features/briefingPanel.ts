import { Advice, adviseOnSlots, suggestQueueChanges } from "~/utils/craftworks";
import {
  BORDER_GRAY,
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import {
  CraftworksSnapshot,
  craftworksState,
} from "~/api/farmrpg/apis/craftworks";
import { Feature, FeatureSetting } from "../utils/feature";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import {
  getDesiredQueue,
  getGoalProgress,
  getGoals,
  removeGoal,
  TrackedGoal,
} from "~/utils/goals";
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
import { locationDataState } from "~/api/buddyfarm/api";
import {
  makeItemLink,
  makeLinkedLine,
  makeLocationLink,
  makeQuestLink,
} from "~/utils/gameLinks";
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

type TabId = "now" | "goals" | "craftworks";
const TABS: { id: TabId; label: string }[] = [
  { id: "now", label: "Now" },
  { id: "goals", label: "Goals" },
  { id: "craftworks", label: "Craftworks" },
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

const setBadge = (count: number): void => {
  const button = document.querySelector<HTMLElement>(`#${BUTTON_ID}`);
  if (!button) {
    return;
  }
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
  goals: TrackedGoal[];
  graph: RecipeGraph;
  inventory: Record<string, number>;
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
  const [snapshot, craftworks, quests, goals] = await Promise.all([
    orUndefined(inventoryState.get({ ignoreCache: force })),
    orUndefined(craftworksState.get({ ignoreCache: force })),
    fetchActiveQuests(),
    getGoals(),
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
    goals,
    graph,
    inventory,
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

const renderWhereToGo = async (
  body: HTMLElement,
  context: Context,
  extra: { name: string; quantity: number }[]
): Promise<void> => {
  const { graph, statuses } = context;
  const bottlenecks = rankBottlenecks(statuses);
  const sourcing = planSourcing(
    graph,
    mergeMissing(
      bottlenecks.map((entry) => ({
        name: entry.name,
        quantity: entry.maxNeeded,
      })),
      extra
    )
  );
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
  const { advice, graph, questGoals, statuses } = context;
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
    (advice?.roots ?? []).map((root) => ({ name: root.name, quantity: 1 }))
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
  const { goals, graph, inventory, unlimited } = context;
  if (goals.length === 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [
        "No goals yet. Open any craftable item and use “Track as goal” to watch its progress here.",
      ])
    );
    return;
  }

  const missingLists: { name: string; quantity: number }[][] = [];
  for (const goal of goals) {
    const progress = getGoalProgress(graph, goal, inventory, unlimited);
    missingLists.push(progress.missing);

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
        progress.ratio >= 1 ? TEXT_SUCCESS : TEXT_WHITE
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
    fill.style.width = `${Math.round(progress.ratio * 100)}%`;
    if (progress.ratio < 1) {
      fill.style.background = TEXT_WARNING;
    }
    bar.append(fill);

    const detail =
      progress.ratio >= 1
        ? `ready — ${progress.have} on hand${
            progress.canMakeNow > 0 ? `, ${progress.canMakeNow} craftable` : ""
          }`
        : `${progress.have}/${goal.quantity} made · ${progress.canMakeNow} craftable now`;
    row.append(top, bar, makeLinkedLine(TEXT_GRAY, [detail]));

    if (progress.missing.length > 0) {
      const parts: (string | Node)[] = ["short: "];
      for (const [index, entry] of progress.missing.slice(0, 4).entries()) {
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

  await renderWhereToGo(body, context, mergeMissing(...missingLists));
};

const renderCraftworks = (body: HTMLElement, context: Context): void => {
  const { advice, cap, craftworks, goals, graph, inventory, unlimited } =
    context;
  if (!advice || !craftworks) {
    body.append(
      makeLinkedLine(TEXT_GRAY, ["Could not read the Craftworks queue."])
    );
    return;
  }
  const maxSlots = craftworks.maxSlots ?? craftworks.slots.length;
  const free = maxSlots - craftworks.slots.length;
  body.append(
    makeLinkedLine(advice.working.length > 0 ? TEXT_GRAY : TEXT_WARNING, [
      `${advice.working.length} of ${craftworks.slots.length} slots crafting`,
      free > 0 ? `, ${free} free` : "",
    ])
  );

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
    if (active === "now") {
      renderNow(body, context);
    } else if (active === "goals") {
      renderGoals(body, context, () => {
        // a removed goal changes the list itself, so reload before redrawing
        load(false);
      });
    } else {
      renderCraftworks(body, context);
    }
  };

  const load = async (force: boolean): Promise<void> => {
    body.textContent = "";
    body.append(makeLinkedLine(TEXT_GRAY, ["Reading your farm…"]));
    context = await loadContext(force);
    const attention =
      (context.advice
        ? context.advice.dead.length + context.advice.ordering.length
        : 0) + context.statuses.filter((status) => status.isReady).length;
    setBadge(attention);
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
  const advice = adviseOnSlots(craftworks.slots, snapshot?.cap);
  setBadge(advice.dead.length + advice.ordering.length);
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
