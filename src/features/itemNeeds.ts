import { adviseOnSlots } from "~/utils/craftworks";
import {
  BORDER_GRAY,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import { buildNeeds } from "~/utils/needAdapters";
import { craftworksState } from "~/api/farmrpg/apis/craftworks";
import { Feature, FeatureSetting } from "../utils/feature";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import { getCurrentPage, Page } from "~/utils/page";
import { getGoals } from "~/utils/goals";
import { getHTML } from "~/api/farmrpg/utils/requests";
import { getQuestGoals, parseActiveQuests } from "~/api/farmrpg/apis/quests";
import { Goal } from "~/utils/focus";
import { inventoryState } from "~/api/farmrpg/apis/inventory";
import { masteryState } from "~/api/farmrpg/apis/mastery";
import { NeedStatus, resolveNeeds, ScopeStatus } from "~/utils/needs";
import { orUndefined } from "~/utils/promise";
import { parseUnlimitedItems } from "~/utils/unlimited";
import { SettingId } from "~/utils/settings";

const CONTAINER_ID = "fh-item-needs";

// The quest list is the one source here with no cached state behind it, and an
// item page is somewhere you land constantly -- browsing twenty items would be
// twenty requests for a list that changes a few times a day. Farm RPG's whole
// objection to scripting is server load, so this is memoised and the panel's
// own refresh stays the way you force it.
const QUESTS_TTL = 5 * 60 * 1000;
// the promise rather than the value, so two item pages opened at once share one
// request instead of racing to make two
let questCache: { at: number; goals: Promise<Goal[]> } | undefined;

const fetchQuestGoals = async (previous: Promise<Goal[]>): Promise<Goal[]> => {
  const response = await orUndefined(
    getHTML(Page.QUESTS, new URLSearchParams())
  );
  if (!response) {
    // a failed refresh keeps the last good answer rather than blanking the card
    return previous;
  }
  const quests = await getQuestGoals(parseActiveQuests(response.body));
  return quests.goals;
};

const getCachedQuestGoals = (): Promise<Goal[]> => {
  if (!questCache || Date.now() - questCache.at >= QUESTS_TTL) {
    questCache = {
      at: Date.now(),
      goals: fetchQuestGoals(questCache?.goals ?? Promise.resolve([])),
    };
  }
  return questCache.goals;
};

const SETTING_ITEM_NEEDS: FeatureSetting = {
  id: SettingId.ITEM_NEEDS,
  title: "Show what an item is needed for",
  description:
    "On an item page, show how many you are still short and which goals, " +
    "requests and Craftworks slots are waiting on it",
  type: "boolean",
  defaultValue: true,
};

// Where the item in view sits in everything you are working toward.
//
// The math for this already existed; it just wasn't where the decision is. You
// had to open the panel and go looking to find out whether the thing on screen
// mattered. Raw drops are the important case and the craft-plan card skips
// them, because a raw has no plan -- but "12 of the 20 Glass the Lanterns
// want" is exactly the sentence worth reading on a raw's page.
export const itemNeeds: Feature = {
  settings: [SETTING_ITEM_NEEDS],
  onPageLoad: async (settings, page) => {
    if (page !== Page.ITEM || !settings[SettingId.ITEM_NEEDS]) {
      return;
    }
    const currentPage = getCurrentPage();
    if (!currentPage) {
      return;
    }
    const itemName = currentPage
      .querySelector(".sharelink")
      ?.textContent?.trim();
    if (!itemName) {
      return;
    }
    // the page is re-rendered on navigation, and re-shown on back navigation:
    // never stack two cards
    currentPage.querySelector(`#${CONTAINER_ID}`)?.remove();

    const unlimited = parseUnlimitedItems(
      String(settings[SettingId.UNLIMITED_ITEMS] ?? "")
    );
    const [snapshot, trackedGoals, mastery, craftworks, questGoals] =
      await Promise.all([
        orUndefined(inventoryState.get()),
        getGoals(),
        orUndefined(masteryState.get()),
        orUndefined(craftworksState.get()),
        getCachedQuestGoals(),
      ]);
    const inventory = snapshot?.quantities ?? {};
    const craftworksRoots = craftworks
      ? adviseOnSlots(craftworks.slots, snapshot?.cap, unlimited).roots
      : [];

    const needs = buildNeeds({ craftworksRoots, questGoals, trackedGoals });
    if (needs.length === 0) {
      return;
    }
    const graph = await gatherRecipeGraph([
      itemName,
      ...needs.flatMap((need) => (need.kind === "item" ? [need.item] : [])),
    ]);
    const resolved = resolveNeeds(
      graph,
      needs,
      inventory,
      unlimited,
      mastery?.entries ?? []
    );

    // Every undertaking whose shortfall names this item, plus every place it
    // appears as a milestone inside one.
    const shortfalls: { quantity: number; scope: ScopeStatus }[] = [];
    for (const scope of resolved.scopes) {
      const entry = scope.missing.find((item) => item.name === itemName);
      if (entry) {
        shortfalls.push({ quantity: entry.quantity, scope });
      }
    }
    const milestones = resolved.statuses.filter(
      (status): status is NeedStatus =>
        status.need.kind === "item" &&
        status.need.item === itemName &&
        status.coveredByParent
    );
    if (shortfalls.length === 0 && milestones.length === 0) {
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
    title.textContent = "Needed for";
    title.style.color = TEXT_WHITE;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "6px";
    inner.append(title);

    const held = inventory[itemName] ?? 0;
    // The largest single ask, not the sum: these are competing undertakings,
    // and covering the biggest covers the rest.
    const worst = Math.max(0, ...shortfalls.map((entry) => entry.quantity));
    const headline = document.createElement("div");
    headline.style.fontSize = "13px";
    headline.style.marginBottom = "6px";
    headline.style.color = worst > 0 ? TEXT_WARNING : TEXT_SUCCESS;
    headline.textContent =
      worst > 0
        ? `${worst} more needed — you hold ${held}`
        : `You hold ${held}; nothing is short of it`;
    inner.append(headline);

    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "3px";

    const addRow = (text: string, href: string | undefined): void => {
      const row = href
        ? document.createElement("a")
        : document.createElement("div");
      if (href && row instanceof HTMLAnchorElement) {
        row.href = href;
      }
      row.style.color = href ? TEXT_WHITE : TEXT_GRAY;
      row.style.fontSize = "12px";
      row.textContent = text;
      list.append(row);
    };

    for (const { quantity, scope } of shortfalls.sort(
      (a, b) => b.quantity - a.quantity
    )) {
      const root = scope.needs.find(
        (status) => status.need.id === scope.rootId
      );
      addRow(`${quantity}x — ${scope.label}`, root?.need.href);
    }
    for (const status of milestones) {
      const percent = Math.round(status.ratio * 100);
      addRow(
        `${status.have}/${
          status.need.kind === "item" ? status.need.quantity : 0
        } toward ${status.need.label} (${percent}%)`,
        status.need.href
      );
    }
    inner.append(list);

    content.append(inner);
    card.append(content);
    const anchor = currentPage.querySelector(".card");
    if (anchor) {
      anchor.after(card);
    } else {
      currentPage.querySelector(".page-content")?.prepend(card);
    }
  },
};
