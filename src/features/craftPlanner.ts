import {
  applyStyles,
  BORDER_GRAY,
  INPUT_STYLES,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import {
  CraftPlan,
  getMaxCraftable,
  planCraft,
  planSourcing,
  RecipeGraph,
} from "~/utils/craftPlanner";
import { Feature, FeatureSetting } from "../utils/feature";
import { gatherRecipeGraph } from "~/api/buddyfarm/recipes";
import { getCardByTitle, getCurrentPage, Page } from "~/utils/page";
import { inventoryState } from "~/api/farmrpg/apis/inventory";
import { locationDataState, LocationRef } from "~/api/buddyfarm/api";
import {
  makeItemLink,
  makeLinkedLine,
  makeLocationLink,
} from "~/utils/gameLinks";
import { orUndefined } from "~/utils/promise";
import { planCraftworksQueue } from "~/utils/craftworks";
import { SettingId } from "~/utils/settings";

const SETTING_CRAFT_PLANNER: FeatureSetting = {
  id: SettingId.CRAFT_PLANNER,
  title: "Item: Craft planner",
  description: `
    On craftable items, work the whole recipe tree out against your inventory:
    how many you can make now, the sub-crafts, what you're short of, and where
    to go get it
  `,
  type: "boolean",
  defaultValue: true,
};

const CONTAINER_ID = "fh-craft-planner";

const makeLine = (color: string, text: string): HTMLDivElement => {
  const line = document.createElement("div");
  line.style.color = color;
  line.style.fontSize = "12px";
  line.style.lineHeight = "1.5";
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

const renderPlan = (
  output: HTMLElement,
  graph: RecipeGraph,
  plan: CraftPlan,
  maxCraftable: number,
  inventory: Record<string, number>,
  cap: number | undefined,
  locations: Map<string, LocationRef>
): void => {
  output.textContent = "";

  output.append(
    makeLine(
      maxCraftable > 0 ? TEXT_SUCCESS : TEXT_GRAY,
      maxCraftable > 0
        ? `You can make ${maxCraftable.toLocaleString()} right now.`
        : "You can't make any right now."
    )
  );

  // sub-crafts, deepest first — that order never needs a later step's output
  const subSteps = plan.steps.filter((step) => step.name !== plan.target);
  if (subSteps.length > 0) {
    output.append(makeHeading("Craft in this order"));
    for (const step of subSteps) {
      output.append(
        makeLinkedLine(TEXT_GRAY, [
          `${step.quantity.toLocaleString()} × `,
          makeItemLink(step.name, graph.nodes.get(step.name)?.id, TEXT_GRAY),
        ])
      );
    }
    output.append(
      makeLine(TEXT_GRAY, `${plan.quantity.toLocaleString()} × ${plan.target}`)
    );
  }

  if (plan.missing.length === 0) {
    output.append(
      makeLine(TEXT_SUCCESS, `You have everything for ${plan.quantity}.`)
    );
  } else {
    output.append(makeHeading("Short of"));
    for (const entry of plan.missing) {
      output.append(
        makeLinkedLine(TEXT_WARNING, [
          `${entry.quantity.toLocaleString()} × `,
          makeItemLink(
            entry.name,
            graph.nodes.get(entry.name)?.id,
            TEXT_WARNING
          ),
        ])
      );
    }

    const sourcing = planSourcing(graph, plan.missing);
    if (sourcing.locations.length > 0) {
      output.append(makeHeading("Where to go"));
      for (const location of sourcing.locations) {
        const parts: (string | Node)[] = [
          makeLocationLink(
            location.location,
            locations.get(location.location),
            TEXT_SUCCESS
          ),
          ` — ~${formatHits(location.hits)} ${
            location.type === "fishing" ? "casts" : "explores"
          } (`,
        ];
        for (const [index, item] of location.items.entries()) {
          if (index > 0) {
            parts.push(", ");
          }
          parts.push(
            `${item.quantity.toLocaleString()} `,
            makeItemLink(
              item.name,
              graph.nodes.get(item.name)?.id,
              TEXT_SUCCESS
            )
          );
        }
        parts.push(")");
        output.append(makeLinkedLine(TEXT_SUCCESS, parts));
      }
    }
    if (sourcing.unsourced.length > 0) {
      output.append(
        makeLine(
          TEXT_GRAY,
          `No drop location on buddy.farm for: ${sourcing.unsourced.join(", ")}`
        )
      );
    }
  }

  // Craftworks holds 8 for Reed (6 base + 2 Patreon); assume the common case
  // rather than fetching the page just to read the number back
  const queue = planCraftworksQueue(plan, inventory, cap, 8);
  if (queue.entries.length > 1) {
    output.append(makeHeading("Craftworks queue for this"));
    for (const entry of queue.entries) {
      output.append(
        makeLinkedLine(TEXT_GRAY, [
          `${entry.position}. `,
          makeItemLink(entry.name, graph.nodes.get(entry.name)?.id, TEXT_GRAY),
          ` (${entry.quantity.toLocaleString()} needed)`,
        ])
      );
    }
    for (const entry of queue.dropped) {
      output.append(
        makeLine(TEXT_GRAY, `skip ${entry.name} — ${entry.reason}`)
      );
    }
    if (queue.targetOmitted) {
      output.append(
        makeLine(
          TEXT_GRAY,
          `${plan.target} itself doesn't fit — craft it by hand once the chain fills.`
        )
      );
    }
  }

  if (plan.truncated) {
    output.append(
      makeLine(TEXT_GRAY, "Recipe tree was cut short; treat this as a floor.")
    );
  }
  if (plan.unknown.length > 0) {
    output.append(
      makeLine(TEXT_GRAY, `No buddy.farm data for: ${plan.unknown.join(", ")}`)
    );
  }
};

export const craftPlanner: Feature = {
  settings: [SETTING_CRAFT_PLANNER],
  onPageLoad: async (settings, page) => {
    if (page !== Page.ITEM) {
      return;
    }
    if (!settings[SettingId.CRAFT_PLANNER]) {
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

    // the item page is re-rendered on navigation; never stack two cards
    currentPage.querySelector(`#${CONTAINER_ID}`)?.remove();

    const graph = await gatherRecipeGraph([itemName]);
    const root = graph.nodes.get(itemName);
    // nothing to plan for something that isn't crafted
    if (!root?.canCraft || root.ingredients.length === 0) {
      return;
    }

    const snapshot = await inventoryState.get();
    const inventory = snapshot?.quantities ?? {};

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
    title.textContent = "Craft plan";
    title.style.color = TEXT_WHITE;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "6px";
    inner.append(title);

    const controls = document.createElement("div");
    controls.style.alignItems = "center";
    controls.style.display = "flex";
    controls.style.gap = "8px";
    controls.style.marginBottom = "6px";
    const label = document.createElement("span");
    label.textContent = "Quantity";
    label.style.color = TEXT_GRAY;
    label.style.fontSize = "12px";
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.value = "1";
    applyStyles(input, {
      ...INPUT_STYLES,
      minWidth: "90px",
    } as CSSStyleDeclaration);
    controls.append(label, input);
    inner.append(controls);

    const output = document.createElement("div");
    inner.append(output);

    content.append(inner);
    card.append(content);

    const details = getCardByTitle("Item Details");
    if (details) {
      details.after(card);
    } else {
      currentPage.querySelector(".content-block")?.append(card);
    }

    // the graph and the inventory are already in hand, so re-planning on every
    // keystroke is pure arithmetic — no requests, no debounce needed
    const maxCraftable = getMaxCraftable(graph, itemName, inventory);

    // resolve every location the plan could name, once, so re-planning on each
    // keystroke stays synchronous
    const locations = new Map<string, LocationRef>();
    const names = new Set(
      planSourcing(
        graph,
        planCraft(graph, itemName, 1, inventory).missing
      ).locations.map((entry) => entry.location)
    );
    await Promise.all(
      [...names].map(async (name) => {
        const ref = await orUndefined(locationDataState.get({ query: name }));
        if (ref) {
          locations.set(name, ref);
        }
      })
    );

    const update = (): void => {
      const quantity = Math.max(1, Math.floor(Number(input.value) || 1));
      renderPlan(
        output,
        graph,
        planCraft(graph, itemName, quantity, inventory),
        maxCraftable,
        inventory,
        snapshot?.cap,
        locations
      );
    };
    input.addEventListener("input", update);
    if (maxCraftable > 1) {
      input.value = String(maxCraftable);
    }
    update();
  },
};
