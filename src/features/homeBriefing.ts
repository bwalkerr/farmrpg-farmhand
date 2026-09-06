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
  getBaselineSource,
  getDropSources,
  planSourcing,
} from "~/utils/craftPlanner";
import { getCurrentPage, Page } from "~/utils/page";
import { getData, setData, SettingId } from "~/utils/settings";
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

const SETTING_HOME_BRIEFING: FeatureSetting = {
  id: SettingId.HOME_BRIEFING,
  title: "Home: Briefing panel",
  description: `
    A collapsible panel on the home page pulling the Craftworks queue, your
    open requests and where to go into one place
  `,
  type: "boolean",
  defaultValue: true,
};

const CONTAINER_ID = "fh-home-briefing";
const MAX_LISTED = 5;

interface BriefingData {
  isOpen: boolean;
}

const makeHeading = (text: string): HTMLDivElement => {
  const heading = document.createElement("div");
  heading.textContent = text;
  heading.style.color = TEXT_WHITE;
  heading.style.fontSize = "12px";
  heading.style.fontWeight = "bold";
  heading.style.margin = "10px 0 4px";
  return heading;
};

const formatHits = (hits: number): string =>
  hits >= 100 ? Math.round(hits).toLocaleString() : hits.toFixed(1);

// Fetch the quests page in the background — the briefing lives on the home
// page, so the active request list is not already in the DOM the way it is for
// the quests-page dashboard.
const fetchActiveQuests = async (): Promise<ReturnType<
  typeof parseActiveQuests
> | null> => {
  try {
    const response = await getHTML(Page.QUESTS, new URLSearchParams());
    return parseActiveQuests(response.body);
  } catch {
    return null;
  }
};

const render = async (body: HTMLElement): Promise<void> => {
  body.textContent = "";
  const loading = makeLinkedLine(TEXT_GRAY, ["Reading your farm…"]);
  body.append(loading);

  const [snapshot, craftworks, quests] = await Promise.all([
    inventoryState.get(),
    orUndefined(craftworksState.get()),
    fetchActiveQuests(),
  ]);
  const inventory = snapshot?.quantities ?? {};
  const cap = snapshot?.cap;
  loading.remove();

  // ---- Craftworks ------------------------------------------------------
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

  // ---- Requests --------------------------------------------------------
  const questGoals = quests ? await getQuestGoals(quests) : undefined;
  const goals = questGoals?.goals ?? [];
  const questNeeds = goals.flatMap((goal) =>
    goal.needs.map((need) => need.name)
  );
  const craftworkBlockers = advice?.roots.map((root) => root.name) ?? [];

  // one walk covering everything either half needs
  const graph = await gatherRecipeGraph([...questNeeds, ...craftworkBlockers]);
  const statuses = getGoalStatuses(graph, goals, inventory);
  const ready = statuses.filter((status) => status.isReady);
  const nearlyDone = getNearlyDone(statuses);
  const bottlenecks = rankBottlenecks(statuses);

  if (statuses.length > 0) {
    body.append(makeHeading("Requests"));
    if (ready.length > 0) {
      for (const status of ready.slice(0, MAX_LISTED)) {
        body.append(
          makeLinkedLine(TEXT_SUCCESS, [
            "ready: ",
            makeQuestLink(status.goal.label, status.goal.href, TEXT_SUCCESS),
          ])
        );
      }
    }
    for (const status of nearlyDone.slice(0, MAX_LISTED)) {
      const [only] = status.missing;
      body.append(
        makeLinkedLine(TEXT_WARNING, [
          makeQuestLink(status.goal.label, status.goal.href, TEXT_WARNING),
          " — needs ",
          `${only.quantity.toLocaleString()} × `,
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

  // ---- Where to go -----------------------------------------------------
  // Craftworks reports what a slot is out of but never how many it is short
  // by, so a blocker counts as one unit; a request's shortfall is exact. Both
  // reduce to the same trip, which is why they merge here instead of being
  // listed twice.
  const combined = mergeMissing(
    bottlenecks.map((entry) => ({
      name: entry.name,
      quantity: entry.maxNeeded,
    })),
    craftworkBlockers.map((name) => ({ name, quantity: 1 }))
  );
  const sourcing = planSourcing(graph, combined);
  if (sourcing.locations.length > 0) {
    body.append(makeHeading("Where to go"));
    const references = await Promise.all(
      sourcing.locations
        .slice(0, MAX_LISTED)
        .map((entry) =>
          orUndefined(locationDataState.get({ query: entry.location }))
        )
    );
    for (const [index, entry] of sourcing.locations
      .slice(0, MAX_LISTED)
      .entries()) {
      const parts: (string | Node)[] = [
        makeLocationLink(
          entry.location,
          references[index],
          entry.items.length > 1 ? TEXT_SUCCESS : TEXT_GRAY
        ),
        ` ~${formatHits(entry.hits)} ${
          entry.type === "fishing" ? "casts" : "explores"
        } — `,
      ];
      for (const [itemIndex, item] of entry.items.slice(0, 4).entries()) {
        if (itemIndex > 0) {
          parts.push(", ");
        }
        parts.push(
          makeItemLink(
            item.name,
            graph.nodes.get(item.name)?.id,
            entry.items.length > 1 ? TEXT_SUCCESS : TEXT_GRAY
          )
        );
      }
      body.append(
        makeLinkedLine(entry.items.length > 1 ? TEXT_SUCCESS : TEXT_GRAY, parts)
      );
    }
  }

  if (body.childNodes.length === 0) {
    body.append(makeLinkedLine(TEXT_SUCCESS, ["Nothing needs attention."]));
  }

  // items with no drop location at all are worth naming once, since no amount
  // of exploring will produce them
  const unsourced = sourcing.unsourced.filter((name) => {
    const source = getBaselineSource(
      getDropSources(graph.nodes.get(name)?.item)
    );
    return !source;
  });
  if (unsourced.length > 0) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [`no drop location: ${unsourced.join(", ")}`])
    );
  }
  if (questGoals?.unmatched.length) {
    body.append(
      makeLinkedLine(TEXT_GRAY, [
        `not on buddy.farm: ${questGoals.unmatched.join(", ")}`,
      ])
    );
  }
};

export const homeBriefing: Feature = {
  settings: [SETTING_HOME_BRIEFING],
  onPageLoad: async (settings, page) => {
    if (page !== Page.HOME_PAGE && page !== Page.HOME_PATH) {
      return;
    }
    if (!settings[SettingId.HOME_BRIEFING]) {
      return;
    }
    const currentPage = getCurrentPage();
    if (!currentPage) {
      return;
    }
    // the home page is re-rendered constantly (the meal timer refetches it
    // every minute), so never stack a second panel
    if (currentPage.querySelector(`#${CONTAINER_ID}`)) {
      return;
    }

    const { isOpen } = await getData<BriefingData>(SETTING_HOME_BRIEFING, {
      isOpen: false,
    });

    const card = document.createElement("div");
    card.id = CONTAINER_ID;
    card.className = "card";
    const content = document.createElement("div");
    content.className = "card-content";
    const inner = document.createElement("div");
    inner.className = "card-content-inner";
    inner.style.borderLeft = `3px solid ${BORDER_GRAY}`;
    inner.style.paddingLeft = "10px";

    const header = document.createElement("div");
    header.style.alignItems = "center";
    header.style.cursor = "pointer";
    header.style.display = "flex";
    header.style.gap = "6px";
    const chevron = document.createElement("i");
    chevron.className = "fa fa-fw";
    chevron.style.color = TEXT_GRAY;
    const label = document.createElement("span");
    label.textContent = "Farmhand briefing";
    label.style.color = TEXT_WHITE;
    label.style.fontWeight = "bold";
    header.append(chevron, label);

    const body = document.createElement("div");

    // The panel costs three page fetches plus buddy.farm lookups, and the home
    // page reloads on its own every minute while a meal is cooking. So nothing
    // is fetched until it is actually opened, and closing it drops the content
    // rather than leaving it to go stale behind a collapsed header.
    let hasRendered = false;
    const apply = (open: boolean): void => {
      chevron.classList.toggle("fa-chevron-down", open);
      chevron.classList.toggle("fa-chevron-right", !open);
      body.style.display = open ? "block" : "none";
      if (open && !hasRendered) {
        hasRendered = true;
        render(body);
      }
    };

    header.addEventListener("click", async () => {
      const next = body.style.display === "none";
      apply(next);
      await setData<BriefingData>(SETTING_HOME_BRIEFING, { isOpen: next });
    });

    inner.append(header, body);
    content.append(inner);
    card.append(content);

    const pageContent = currentPage.querySelector(".page-content");
    pageContent?.prepend(card);

    apply(isOpen);
  },
};
