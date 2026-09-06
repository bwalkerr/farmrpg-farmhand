import {
  BORDER_GRAY,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import {
  Bottleneck,
  getFocusSourcing,
  getGoalStatuses,
  getNearlyDone,
  Goal,
  rankBottlenecks,
} from "~/utils/focus";
import { Feature, FeatureSetting } from "../utils/feature";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import { getCurrentPage, getTitle, Page } from "~/utils/page";
import { getQuestGoals, parseActiveQuests } from "~/api/farmrpg/apis/quests";
import { inventoryState } from "~/api/farmrpg/apis/inventory";
import { SettingId } from "~/utils/settings";

const SETTING_FOCUS_DASHBOARD: FeatureSetting = {
  id: SettingId.FOCUS_DASHBOARD,
  title: "Quests: Focus dashboard",
  description: `
    On the quests page, cross your open requests against your inventory: what
    you can turn in now, what's one item away, and which materials are holding
    up the most requests
  `,
  type: "boolean",
  defaultValue: true,
};

const CONTAINER_ID = "fh-focus-dashboard";
const MAX_LISTED = 6;

const makeLine = (color: string, text: string): HTMLDivElement => {
  const line = document.createElement("div");
  line.style.color = color;
  line.style.fontSize = "12px";
  line.style.lineHeight = "1.5";
  line.style.marginBottom = "3px";
  line.textContent = text;
  return line;
};

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

const describeBottleneck = (entry: Bottleneck): string => {
  const gated =
    entry.goalsGated > 1
      ? `blocks ${entry.goalsGated} requests`
      : `blocks ${entry.goals[0]}`;
  return `${
    entry.name
  } — ${gated}, need up to ${entry.maxNeeded.toLocaleString()}`;
};

const render = async (container: HTMLElement, goals: Goal[]): Promise<void> => {
  const snapshot = await inventoryState.get();
  const inventory = snapshot?.quantities ?? {};

  // one walk covering every item any open request wants, so the whole board is
  // costed from a single batch of buddy.farm lookups
  const graph = await gatherRecipeGraph(
    goals.flatMap((goal) => goal.needs.map((need) => need.name))
  );
  const statuses = getGoalStatuses(graph, goals, inventory);
  const ready = statuses.filter((status) => status.isReady);
  const nearlyDone = getNearlyDone(statuses);
  const bottlenecks = rankBottlenecks(statuses);

  container.append(
    makeLine(
      TEXT_GRAY,
      `${goals.length} open request${
        goals.length === 1 ? "" : "s"
      } costed against your inventory.`
    )
  );

  if (ready.length > 0) {
    container.append(makeHeading("Ready to turn in"));
    for (const status of ready) {
      container.append(makeLine(TEXT_SUCCESS, status.goal.label));
    }
  }

  if (nearlyDone.length > 0) {
    container.append(makeHeading("One item away"));
    for (const status of nearlyDone.slice(0, MAX_LISTED)) {
      const [only] = status.missing;
      container.append(
        makeLine(
          TEXT_WARNING,
          `${status.goal.label} — ${only.quantity.toLocaleString()} × ${
            only.name
          }`
        )
      );
    }
  }

  if (bottlenecks.length > 0) {
    container.append(makeHeading("Holding up the most"));
    for (const entry of bottlenecks.slice(0, MAX_LISTED)) {
      container.append(
        makeLine(
          entry.goalsGated > 1 ? TEXT_WARNING : TEXT_GRAY,
          describeBottleneck(entry)
        )
      );
    }

    const sourcing = getFocusSourcing(graph, bottlenecks);
    if (sourcing.locations.length > 0) {
      container.append(makeHeading("Where to go"));
      for (const location of sourcing.locations) {
        container.append(
          makeLine(
            location.items.length > 1 ? TEXT_SUCCESS : TEXT_GRAY,
            `${location.location} — ${location.items
              .map((item) => item.name)
              .join(", ")} (~${formatHits(location.hits)} ${
              location.type === "fishing" ? "casts" : "explores"
            })`
          )
        );
      }
    }
  } else if (ready.length === statuses.length && statuses.length > 0) {
    container.append(
      makeLine(TEXT_SUCCESS, "Every open request is ready to hand in.")
    );
  }
};

export const focusDashboard: Feature = {
  settings: [SETTING_FOCUS_DASHBOARD],
  onPageLoad: async (settings, page) => {
    if (page !== Page.QUESTS) {
      return;
    }
    if (!settings[SettingId.FOCUS_DASHBOARD]) {
      return;
    }
    const currentPage = getCurrentPage();
    if (!currentPage) {
      return;
    }
    currentPage.querySelector(`#${CONTAINER_ID}`)?.remove();

    const quests = parseActiveQuests();
    if (quests.length === 0) {
      return;
    }

    const card = document.createElement("div");
    card.id = CONTAINER_ID;
    card.className = "card";
    const content = document.createElement("div");
    content.className = "card-content";
    const inner = document.createElement("div");
    inner.className = "card-content-inner";
    inner.style.borderLeft = `3px solid ${BORDER_GRAY}`;
    inner.style.paddingLeft = "10px";
    const title = document.createElement("div");
    title.textContent = "Focus";
    title.style.color = TEXT_WHITE;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "6px";
    inner.append(title);
    const status = makeLine(TEXT_GRAY, "Costing your open requests…");
    inner.append(status);
    content.append(inner);
    card.append(content);

    const heading = getTitle(/Active Requests/);
    if (heading) {
      heading.before(card);
    } else {
      currentPage.querySelector(".content-block")?.prepend(card);
    }

    const { goals, unmatched } = await getQuestGoals(quests);
    status.remove();
    if (goals.length === 0) {
      inner.append(
        makeLine(TEXT_GRAY, "No requirements found for your open requests.")
      );
      return;
    }
    await render(inner, goals);
    if (unmatched.length > 0) {
      inner.append(
        makeLine(
          TEXT_GRAY,
          `Not on buddy.farm, so not costed: ${unmatched.join(", ")}`
        )
      );
    }
  },
};
