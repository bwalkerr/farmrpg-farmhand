import { adviseOnSlots } from "~/utils/craftworks";
import { craftworksState } from "~/api/farmrpg/apis/craftworks";
import { Feature, FeatureSetting } from "../utils/feature";
import {
  findLocationSet,
  getLocationAdvice,
  matchLocationByImage,
  parseStamina,
} from "~/utils/locationAdvice";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import { getCurrentPage, Page } from "~/utils/page";
import { getGoalProgress, getGoals } from "~/utils/goals";
import { getLocationEntries, locationDataState } from "~/api/buddyfarm/api";
import { inventoryState } from "~/api/farmrpg/apis/inventory";
import { masteryState } from "~/api/farmrpg/apis/mastery";
import { mergeMissing } from "~/utils/focus";
import { orUndefined } from "~/utils/promise";
import { parseUnlimitedItems } from "~/utils/unlimited";
import { SettingId } from "~/utils/settings";
import {
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
} from "~/utils/theme";

const SETTING_LOCATION_ADVISOR: FeatureSetting = {
  id: SettingId.LOCATION_ADVISOR,
  title: "Explore: What's here for you",
  description: `
    On explore and fishing pages, show which of your needs drop here and which
    items you are at cap on, whose drops are being discarded
  `,
  type: "boolean",
  defaultValue: true,
};

const CONTAINER_ID = "fh-location-advisor";
const MAX_ROWS = 5;

const formatRate = (rate: number): string =>
  rate >= 100 ? Math.round(rate).toLocaleString() : rate.toFixed(1);

// Built in the game's own list idiom -- media icon, title, right-aligned value
// -- so it reads as part of the page rather than as something bolted on.
const makeRow = (
  image: string | undefined,
  title: string,
  detail: string,
  after: string,
  color: string
): HTMLLIElement => {
  const row = document.createElement("li");
  const content = document.createElement("div");
  content.className = "item-content";
  const media = document.createElement("div");
  media.className = "item-media";
  if (image) {
    const icon = document.createElement("img");
    icon.src = image;
    icon.style.width = "32px";
    media.append(icon);
  }
  const inner = document.createElement("div");
  inner.className = "item-inner";
  const titleElement = document.createElement("div");
  titleElement.className = "item-title";
  titleElement.style.color = color;
  titleElement.textContent = title;
  if (detail) {
    const sub = document.createElement("div");
    sub.style.color = TEXT_GRAY;
    sub.style.fontSize = "11px";
    sub.textContent = detail;
    titleElement.append(sub);
  }
  const afterElement = document.createElement("div");
  afterElement.className = "item-after";
  afterElement.textContent = after;
  inner.append(titleElement, afterElement);
  content.append(media, inner);
  row.append(content);
  return row;
};

const render = async (
  currentPage: HTMLElement,
  settings: Parameters<NonNullable<Feature["onPageLoad"]>>[0]
): Promise<void> => {
  // the page prints no location name; the header picture is the only identifier
  const header = currentPage.querySelector<HTMLImageElement>(
    "img[src*='/img/items/']"
  );
  if (!header) {
    return;
  }
  const locations = await getLocationEntries();
  const name = matchLocationByImage(
    header.getAttribute("src") ?? "",
    locations
  );
  if (!name) {
    return;
  }
  const location = await orUndefined(locationDataState.get({ query: name }));
  if (!location || location.drops.length === 0) {
    return;
  }

  const unlimited = parseUnlimitedItems(
    String(settings[SettingId.UNLIMITED_ITEMS] ?? "")
  );
  // Everything here is cached or local. Quests are deliberately left out: this
  // page is clicked over and over, and costing them means fetching quests.php
  // each time, which the briefing panel already does on demand.
  const [snapshot, craftworks, mastery, goals] = await Promise.all([
    orUndefined(inventoryState.get()),
    orUndefined(craftworksState.get({ doNotFetch: true })),
    orUndefined(masteryState.get({ doNotFetch: true })),
    getGoals(),
  ]);
  const inventory = snapshot?.quantities ?? {};
  const cap = snapshot?.cap;

  const advice = craftworks
    ? adviseOnSlots(craftworks.slots, cap, unlimited)
    : undefined;
  const blockers = advice?.roots ?? [];
  const graph = await gatherRecipeGraph([
    ...goals.map((goal) => goal.name),
    ...blockers.map((blocker) => blocker.name),
  ]);

  const reasons = new Map<string, string[]>();
  const goalMissing = goals.map((goal) => {
    const progress = getGoalProgress(graph, goal, inventory, unlimited);
    for (const entry of progress.missing) {
      reasons.set(entry.name, [
        ...(reasons.get(entry.name) ?? []),
        `for ${goal.name}`,
      ]);
    }
    return progress.missing;
  });
  for (const blocker of blockers) {
    reasons.set(blocker.name, [
      ...(reasons.get(blocker.name) ?? []),
      `blocks ${blocker.slots.map((slot) => slot.name).join(", ")}`,
    ]);
  }

  const { needed, wasted } = getLocationAdvice(
    location.drops,
    mergeMissing(
      ...goalMissing,
      blockers.map((blocker) => ({ name: blocker.name, quantity: 1 }))
    ),
    reasons,
    inventory,
    cap,
    mastery?.entries ?? []
  );
  if (needed.length === 0 && wasted.length === 0) {
    return;
  }

  // the page gives the banked figure its own element; the text form is the
  // fallback for anywhere that does not
  const staminaText = currentPage.querySelector("#stamina")?.textContent ?? "";
  const stamina =
    Number(staminaText.replaceAll(",", "").trim()) ||
    parseStamina(currentPage.textContent ?? "");
  // mirror the page's own card > card-content > list-block > ul nesting so this
  // sits in the layout rather than on top of it
  const block = document.createElement("div");
  block.className = "card";
  block.id = CONTAINER_ID;
  const cardContent = document.createElement("div");
  cardContent.className = "card-content";
  const listBlock = document.createElement("div");
  listBlock.className = "list-block disable-select";
  const list = document.createElement("ul");
  listBlock.append(list);
  cardContent.append(listBlock);
  block.append(cardContent);

  for (const entry of needed.slice(0, MAX_ROWS)) {
    // an estimate you cannot afford today is worth saying out loud
    const affordable = stamina === undefined || entry.attempts <= stamina;
    list.append(
      makeRow(
        undefined,
        entry.name,
        entry.reasons.join(" · "),
        `1 per ${formatRate(entry.rate)}${
          entry.quantity > 1
            ? ` · ${Math.round(
                entry.attempts
              ).toLocaleString()} for ${entry.quantity.toLocaleString()}`
            : ""
        }`,
        affordable ? TEXT_SUCCESS : TEXT_WARNING
      )
    );
  }
  for (const entry of wasted.slice(0, MAX_ROWS)) {
    list.append(
      makeRow(
        undefined,
        `${entry.name} — at cap, drops discarded`,
        entry.masteryRemaining
          ? `mastery frozen at ${entry.masteryValue?.toLocaleString()}/${entry.masteryRequired?.toLocaleString()}`
          : "",
        entry.count.toLocaleString(),
        TEXT_ERROR
      )
    );
  }

  const heading = document.createElement("div");
  heading.className = "content-block-title";
  heading.id = `${CONTAINER_ID}-title`;
  heading.textContent = stamina
    ? `Here for you (${stamina.toLocaleString()} stamina)`
    : "Here for you";

  const set = findLocationSet(
    name,
    craftworks?.sets ?? [],
    locations.map((entry) => entry.name)
  );
  if (set && !set.isActive) {
    list.append(
      makeRow(
        undefined,
        `Your “${set.name}” set isn't loaded`,
        "open the briefing panel's Sets tab to switch",
        "",
        TEXT_GRAY
      )
    );
  }

  // sit directly under the Continue / Eat / Drink card
  const actions = currentPage
    .querySelector("#exploreoptions")
    ?.closest(".card");
  if (actions) {
    actions.after(heading, block);
  } else {
    currentPage.querySelector(".content-block")?.append(heading, block);
  }
};

export const locationAdvisor: Feature = {
  settings: [SETTING_LOCATION_ADVISOR],
  onPageLoad: async (settings, page) => {
    if (page !== Page.AREA && page !== Page.FISHING) {
      return;
    }
    if (!settings[SettingId.LOCATION_ADVISOR]) {
      return;
    }
    const currentPage = getCurrentPage();
    if (!currentPage) {
      return;
    }
    // the explore page rerenders on every click; never stack a second block
    currentPage.querySelector(`#${CONTAINER_ID}`)?.remove();
    currentPage.querySelector(`#${CONTAINER_ID}-title`)?.remove();
    await render(currentPage, settings);
  },
};
