import {
  adviseOnSlots,
  getMaxSlots,
  parseSavedSets,
  parseSlots,
  Slot,
} from "~/utils/craftworks";
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
import {
  getBaselineSource,
  getDropSources,
  RecipeGraph,
} from "~/utils/craftPlanner";
import { getBasicItems, locationDataState } from "~/api/buddyfarm/api";
import { getCurrentPage, Page } from "~/utils/page";
import { getGoals } from "~/utils/goals";
import { getRecommendedSet } from "~/utils/suggestions";
import { inventoryState } from "~/api/farmrpg/apis/inventory";
import {
  makeItemLink,
  makeLinkedLine,
  makeLocationLink,
} from "~/utils/gameLinks";
import { orUndefined } from "~/utils/promise";
import { parseUnlimitedItems } from "~/utils/unlimited";
import { SettingId } from "~/utils/settings";

const SETTING_CRAFTWORKS_ADVISOR: FeatureSetting = {
  id: SettingId.CRAFTWORKS_ADVISOR,
  title: "Craftworks: Queue advisor",
  description: `
    Summarize the Craftworks queue: slots that can't craft, what each stalled
    slot is waiting on, ordering mistakes, and where to go get the blockers
  `,
  type: "boolean",
  defaultValue: true,
};

const CONTAINER_ID = "fh-craftworks-advisor";

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

// Recommend the saved set that matches a tracked goal, and offer to load it by
// clicking the game's own button.
//
// The activation is deliberately NOT reimplemented. The game fires
// `worker.php?go=removeallcw` -- which wipes the whole queue -- then activates
// the set 500ms later, and the wipe has no failure handler: if the second call
// never lands, the queue is simply gone. Driving the real button runs the
// game's own sequence, timing and refresh instead of a copy that could drift.
const renderSetRecommendation = async (
  container: HTMLElement
): Promise<void> => {
  const currentPage = getCurrentPage();
  if (!currentPage) {
    return;
  }
  const sets = parseSavedSets(currentPage);
  if (sets.length === 0) {
    return;
  }
  const [goals, items] = await Promise.all([getGoals(), getBasicItems()]);
  const recommended = getRecommendedSet(
    goals.map((goal) => goal.name),
    sets,
    items.map((item) => item.name)
  );
  if (!recommended) {
    return;
  }
  const button = currentPage.querySelector<HTMLElement>(
    `.activatecwsetbtn[data-id="${recommended.id}"]`
  );
  const line = makeLinkedLine(TEXT_SUCCESS, [
    `Your “${recommended.name}” set matches your ${recommended.goalName} goal.`,
  ]);
  container.append(line);
  if (!button) {
    return;
  }
  const load = document.createElement("a");
  load.href = "#";
  load.textContent = "Load that set";
  load.style.color = TEXT_SUCCESS;
  load.style.fontSize = "12px";
  load.style.textDecoration = "underline";
  load.addEventListener("click", (event) => {
    event.preventDefault();
    // one deliberate press, forwarded to the game's own control
    button.click();
  });
  const warning = makeLinkedLine(TEXT_GRAY, [
    "— loading a set clears the current queue first ",
  ]);
  warning.append(load);
  container.append(warning);
};

const renderAdvice = async (
  container: HTMLElement,
  slots: Slot[],
  maxSlots: number | undefined,
  unlimited: ReturnType<typeof parseUnlimitedItems>
): Promise<void> => {
  const snapshot = await inventoryState.get();
  const cap = snapshot?.cap;
  const advice = adviseOnSlots(slots, cap, unlimited);
  await renderSetRecommendation(container);

  const summary = document.createElement("div");
  summary.style.color = TEXT_GRAY;
  summary.style.fontSize = "12px";
  summary.style.marginBottom = "6px";
  const freeSlots = maxSlots ? maxSlots - slots.length : 0;
  summary.textContent = `${advice.working.length} of ${
    slots.length
  } slots are crafting${
    freeSlots > 0 ? `, ${freeSlots} slot${freeSlots === 1 ? "" : "s"} free` : ""
  }.`;
  container.append(summary);

  if (advice.dead.length > 0) {
    container.append(makeHeading("At cap — these slots can't craft"));
    for (const slot of advice.dead) {
      container.append(
        makeLine(
          TEXT_ERROR,
          `#${slot.position} ${slot.name} — ${slot.inventory.toLocaleString()}${
            cap ? ` / ${cap.toLocaleString()}` : ""
          }. Free the slot or spend some down.`
        )
      );
    }
  }

  if (advice.ordering.length > 0) {
    container.append(makeHeading("Wrong order"));
    for (const { blocker, producer, slot } of advice.ordering) {
      container.append(
        makeLine(
          TEXT_WARNING,
          `#${slot.position} ${slot.name} waits on ${blocker}, but #${producer.position} ${producer.name} makes it — the queue runs top-down, so move #${producer.position} above #${slot.position}.`
        )
      );
    }
  }

  if (advice.paused.length > 0) {
    container.append(
      makeLine(
        TEXT_GRAY,
        `Paused: ${advice.paused
          .map((slot) => `#${slot.position} ${slot.name}`)
          .join(", ")}`
      )
    );
  }

  if (advice.blockers.size === 0) {
    if (advice.dead.length === 0) {
      container.append(makeLine(TEXT_SUCCESS, "Nothing is stalled."));
    }
    return;
  }

  if (advice.upstream.length > 0) {
    container.append(
      makeLine(
        TEXT_GRAY,
        `Clears on its own: ${advice.upstream
          .map(
            (blocker) =>
              `${blocker.name} (#${blocker.producer?.position} makes it)`
          )
          .join(", ")}`
      )
    );
  }

  if (advice.roots.length === 0) {
    return;
  }

  // only the root blockers are worth looking up: the rest are already being
  // made by a slot above the one waiting on them
  const names = advice.roots.map((blocker) => blocker.name);
  let graph: RecipeGraph;
  try {
    graph = await gatherRecipeGraph(names);
  } catch {
    container.append(
      makeLine(TEXT_GRAY, "Could not reach buddy.farm for drop locations.")
    );
    return;
  }

  container.append(makeHeading("Stalled on"));
  const byLocation = new Map<
    string,
    { blockers: string[]; hits: number; type: string }
  >();
  const craftable: string[] = [];
  const queued = new Set(slots.map((slot) => slot.name));

  for (const blocker of advice.roots) {
    const { name } = blocker;
    const node = graph.nodes.get(name);
    const consumers = blocker.slots
      .map((slot) => `#${slot.position} ${slot.name}`)
      .join(", ");
    const source = getBaselineSource(getDropSources(node?.item));
    const details: string[] = [];
    if (source) {
      details.push(
        `${source.location} — 1 per ${formatHits(source.rate)} ${
          source.type === "fishing" ? "casts" : "explores"
        }`
      );
      const existing = byLocation.get(source.location) ?? {
        blockers: [],
        hits: 0,
        type: source.type,
      };
      existing.blockers.push(name);
      // one unit's worth, since the game never says how many it is short by
      existing.hits += source.rate;
      byLocation.set(source.location, existing);
    }
    if (node?.canCraft && !queued.has(name)) {
      craftable.push(name);
      details.push("craftable — could take the free slot");
    }
    container.append(
      makeLinkedLine(TEXT_WARNING, [
        makeItemLink(name, node?.id, TEXT_WARNING),
        ` → blocks ${consumers}`,
        details.length > 0 ? ` · ${details.join(" · ")}` : " · no known source",
      ])
    );
  }

  // same ordering as the planner: most blockers cleared first, cheapest trip
  // breaking ties
  const locations = [...byLocation.entries()].sort(
    (a, b) =>
      b[1].blockers.length - a[1].blockers.length || a[1].hits - b[1].hits
  );
  if (locations.length > 0) {
    container.append(makeHeading("Where to go"));
    const references = await Promise.all(
      locations.map(([location]) =>
        orUndefined(locationDataState.get({ query: location }))
      )
    );
    for (const [index, [location, entry]] of locations.entries()) {
      const color = entry.blockers.length > 1 ? TEXT_SUCCESS : TEXT_GRAY;
      const parts: (string | Node)[] = [
        makeLocationLink(location, references[index], color),
        " — ",
      ];
      for (const [blockerIndex, blocker] of entry.blockers.entries()) {
        if (blockerIndex > 0) {
          parts.push(", ");
        }
        parts.push(makeItemLink(blocker, graph.nodes.get(blocker)?.id, color));
      }
      parts.push(
        ` (${formatHits(entry.hits)} ${
          entry.type === "fishing" ? "casts" : "explores"
        } for one of each)`
      );
      container.append(makeLinkedLine(color, parts));
    }
  }

  if (craftable.length > 0 && (maxSlots ?? 0) > slots.length) {
    container.append(
      makeLine(
        TEXT_SUCCESS,
        `Free slot: adding ${craftable[0]} above the slot that needs it would unstall it without exploring.`
      )
    );
  }
};

export const craftworksAdvisor: Feature = {
  settings: [SETTING_CRAFTWORKS_ADVISOR],
  onPageLoad: async (settings, page) => {
    if (page !== Page.CRAFTWORKS) {
      return;
    }
    if (!settings[SettingId.CRAFTWORKS_ADVISOR]) {
      return;
    }
    const currentPage = getCurrentPage();
    if (!currentPage) {
      return;
    }
    // the page re-renders on every add/remove/pause, so drop a stale card
    // rather than stack a second one on top of it
    currentPage.querySelector(`#${CONTAINER_ID}`)?.remove();

    const slots = parseSlots(currentPage);
    if (slots.length === 0) {
      return;
    }

    const card = document.createElement("div");
    card.id = CONTAINER_ID;
    card.className = "card fh-craftworks-advisor";
    const content = document.createElement("div");
    content.className = "card-content";
    const inner = document.createElement("div");
    inner.className = "card-content-inner";
    inner.style.borderLeft = `3px solid ${BORDER_GRAY}`;
    inner.style.paddingLeft = "10px";
    const title = document.createElement("div");
    title.textContent = "Queue advisor";
    title.style.color = TEXT_WHITE;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "6px";
    inner.append(title);
    content.append(inner);
    card.append(content);

    // sit directly above the queue it is describing
    const list = currentPage.querySelector(".cwitems")?.closest(".card");
    if (list?.parentElement) {
      list.parentElement.insertBefore(card, list);
    } else {
      currentPage.querySelector(".content-block")?.append(card);
    }

    await renderAdvice(
      inner,
      slots,
      getMaxSlots(currentPage),
      parseUnlimitedItems(String(settings[SettingId.UNLIMITED_ITEMS] ?? ""))
    );
  },
};
