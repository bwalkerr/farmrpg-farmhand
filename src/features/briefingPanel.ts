import { adviseOnSlots } from "~/utils/craftworks";
import {
  BORDER_GRAY,
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import { craftworksState } from "~/api/farmrpg/apis/craftworks";
import { Feature, FeatureSetting } from "../utils/feature";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import {
  getGoalStatuses,
  getNearlyDone,
  mergeMissing,
  rankBottlenecks,
} from "~/utils/focus";
import { getHTML } from "~/api/farmrpg/utils/requests";
import { getQuestGoals, parseActiveQuests } from "~/api/farmrpg/apis/quests";
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
import { planSourcing } from "~/utils/craftPlanner";
import { SettingId } from "~/utils/settings";

const SETTING_BRIEFING_PANEL: FeatureSetting = {
  id: SettingId.BRIEFING_PANEL,
  title: "Briefing: Floating panel",
  description: `
    A button above the bottom bar that opens the Craftworks queue, your open
    requests and where to go, from any page
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
        overflow-y: auto;
        overscroll-behavior: contain;
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
      #${PANEL_ID}::-webkit-scrollbar { width: 8px; }
      #${PANEL_ID}::-webkit-scrollbar-thumb {
        background: #3a3a3a;
        border-radius: 4px;
      }
      #${PANEL_ID} .fh-briefing-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      #${PANEL_ID} .fh-briefing-refresh {
        cursor: pointer;
        color: ${TEXT_GRAY};
        font-size: 11px;
      }
      #${PANEL_ID} .fh-briefing-refresh:hover { color: ${TEXT_WHITE}; }
      @media (max-width: 480px) {
        #${PANEL_ID} { width: calc(100vw - 16px); max-height: 60vh; }
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

const render = async (body: HTMLElement, force: boolean): Promise<void> => {
  body.textContent = "";
  const loading = makeLinkedLine(TEXT_GRAY, ["Reading your farm…"]);
  body.append(loading);

  const [snapshot, craftworks, quests] = await Promise.all([
    orUndefined(inventoryState.get({ ignoreCache: force })),
    orUndefined(craftworksState.get({ ignoreCache: force })),
    fetchActiveQuests(),
  ]);
  const inventory = snapshot?.quantities ?? {};
  const cap = snapshot?.cap;
  loading.remove();

  let attention = 0;

  const advice = craftworks ? adviseOnSlots(craftworks.slots, cap) : undefined;
  if (advice && craftworks) {
    const free = craftworks.maxSlots
      ? craftworks.maxSlots - craftworks.slots.length
      : 0;
    body.append(makeHeading("Craftworks"));
    body.append(
      makeLinkedLine(advice.working.length > 0 ? TEXT_GRAY : TEXT_WARNING, [
        `${advice.working.length} of ${craftworks.slots.length} slots crafting`,
        free > 0 ? `, ${free} free` : "",
      ])
    );
    attention += advice.dead.length + advice.ordering.length;
    for (const slot of advice.dead.slice(0, MAX_LISTED)) {
      body.append(
        makeLinkedLine(TEXT_ERROR, [
          "at cap: ",
          makeItemLink(slot.name, Number(slot.id) || undefined, TEXT_ERROR),
          ` (${slot.inventory.toLocaleString()}${
            cap ? `/${cap.toLocaleString()}` : ""
          }) — dead slot`,
        ])
      );
    }
    for (const { blocker, producer, slot } of advice.ordering) {
      body.append(
        makeLinkedLine(TEXT_WARNING, [
          `move #${producer.position} ${producer.name} above #${slot.position} ${slot.name} (waits on ${blocker})`,
        ])
      );
    }
  }

  const questGoals = quests ? await getQuestGoals(quests) : undefined;
  const goals = questGoals?.goals ?? [];
  const craftworkBlockers = advice?.roots.map((root) => root.name) ?? [];
  const graph = await gatherRecipeGraph([
    ...goals.flatMap((goal) => goal.needs.map((need) => need.name)),
    ...craftworkBlockers,
  ]);
  const statuses = getGoalStatuses(graph, goals, inventory);
  const ready = statuses.filter((status) => status.isReady);
  const nearlyDone = getNearlyDone(statuses);
  const bottlenecks = rankBottlenecks(statuses);
  attention += ready.length;

  if (statuses.length > 0) {
    body.append(makeHeading("Requests"));
    for (const status of ready.slice(0, MAX_LISTED)) {
      body.append(
        makeLinkedLine(TEXT_SUCCESS, [
          "ready: ",
          makeQuestLink(status.goal.label, status.goal.href, TEXT_SUCCESS),
        ])
      );
    }
    for (const status of nearlyDone.slice(0, MAX_LISTED)) {
      const [only] = status.missing;
      body.append(
        makeLinkedLine(TEXT_WARNING, [
          makeQuestLink(status.goal.label, status.goal.href, TEXT_WARNING),
          ` — needs ${only.quantity.toLocaleString()} × `,
          makeItemLink(only.name, graph.nodes.get(only.name)?.id, TEXT_WARNING),
        ])
      );
    }
    if (ready.length === 0 && nearlyDone.length === 0) {
      body.append(
        makeLinkedLine(TEXT_GRAY, [
          `${statuses.length} open, none close to done`,
        ])
      );
    }
  }

  // Craftworks says what a slot is out of but never how many it is short by,
  // so a blocker counts as one unit; a request's shortfall is exact. Both are
  // the same trip, which is why they merge rather than being listed twice.
  const sourcing = planSourcing(
    graph,
    mergeMissing(
      bottlenecks.map((entry) => ({
        name: entry.name,
        quantity: entry.maxNeeded,
      })),
      craftworkBlockers.map((name) => ({ name, quantity: 1 }))
    )
  );
  if (sourcing.locations.length > 0) {
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
  }

  if (body.childNodes.length === 0) {
    body.append(makeLinkedLine(TEXT_SUCCESS, ["Nothing needs attention."]));
  }
  if (questGoals?.unmatched.length) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [
        `not on buddy.farm: ${questGoals.unmatched.join(", ")}`,
      ])
    );
  }

  setBadge(attention);
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

// One button and one panel for the whole session, hung off document.body.
//
// Framework7 keeps the page you came from in the DOM, so anything appended
// inside a page element gets duplicated as you navigate and the retained copy's
// listeners point at a detached tree — which is exactly how the first attempt
// at this ended up drawn twice with only one of them responding. Living on the
// body sidesteps page swaps entirely, and the same trick is what keeps the cap
// tracker single.
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

  const body = document.createElement("div");
  panel.append(head, body);
  document.body.append(button, panel);

  // Nothing is fetched until it is opened. The panel costs three page fetches
  // plus buddy.farm lookups, and the home page already refetches itself every
  // minute while a meal cooks, so an eager panel would become a steady
  // background load.
  let hasRendered = false;
  const setOpen = (open: boolean): void => {
    panel.dataset.open = String(open);
    button.dataset.open = String(open);
    if (open && !hasRendered) {
      hasRendered = true;
      render(body, false);
    }
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(panel.dataset.open !== "true");
  });
  refresh.addEventListener("click", (event) => {
    event.stopPropagation();
    render(body, true);
  });
  panel.addEventListener("click", (event) => {
    // let links through, but don't let a stray click close the panel
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
