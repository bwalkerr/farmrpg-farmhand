import { CapItem, getCapTrackerView } from "../inventoryCapWarnings";
import {
  findTownsfolkLink,
  TownsfolkLink,
  townsfolkState,
} from "~/api/farmrpg/apis/townsfolk";
import {
  formatAge,
  makeCard,
  makeEmpty,
  makeRow,
  makeTag,
  plural,
  toIconUrl,
} from "./shared";
import { itemDataState } from "~/api/buddyfarm/api";
import { orUndefined } from "~/utils/promise";
import { TEXT_WHITE } from "~/utils/theme";

// The Cap tab: what is at or near the inventory cap, and what to DO about it.
//
// The tracker's row of icons said "these are full" and stopped there. The
// useful half is the way out: buddy.farm knows which townsperson loves or
// likes each item, and the game's own townsfolk page knows where each of them
// lives, so a full stack becomes a gift rather than a discarded drop.

// how many rows get the loves/likes lookup on one draw: each is one cached
// buddy.farm read, and the list is at-cap first so the ones that matter come
// first
const RELATIONSHIP_LOOKUPS = 16;

interface Affinity {
  name: string;
  relationship: "loves" | "likes";
}

const getAffinities = async (itemName: string): Promise<Affinity[]> => {
  const item = await orUndefined(itemDataState.get({ query: itemName }));
  const entries = (item?.npcItems ?? []) as {
    relationship?: string;
    npc?: { name?: string };
  }[];
  const affinities: Affinity[] = [];
  for (const entry of entries) {
    const name = entry.npc?.name;
    if (!name) {
      continue;
    }
    if (entry.relationship === "loves" || entry.relationship === "likes") {
      affinities.push({ name, relationship: entry.relationship });
    }
  }
  // loves before likes: it is the better gift, so it is the one to show first
  const rank = (affinity: Affinity): number =>
    affinity.relationship === "loves" ? 0 : 1;
  return affinities.sort((a, b) => rank(a) - rank(b));
};

const makeAffinityTags = (
  affinities: Affinity[],
  links: readonly TownsfolkLink[]
): Node[] =>
  affinities.slice(0, 4).map((affinity) => {
    const link = findTownsfolkLink(links, affinity.name);
    const tag = makeTag(
      `${affinity.relationship === "loves" ? "♥" : "♡"} ${affinity.name}`,
      affinity.relationship === "loves" ? "accent" : "muted",
      link?.href
    );
    tag.title = `${affinity.name} ${affinity.relationship} this${
      link ? " — open their page to give it" : ""
    }`;
    return tag;
  });

const makeCapRow = (item: CapItem, cap: number): HTMLElement =>
  makeRow(item.name, {
    aside: [`${item.count.toLocaleString()} / ${cap.toLocaleString()}`],
    href: item.href,
    icon: toIconUrl(item.image),
    tone: item.isAtCap ? "err" : "warn",
  });

export const renderCapTab = (
  body: HTMLElement,
  onRefresh: () => void
): void => {
  const view = getCapTrackerView();
  if (!view.isEnabled) {
    body.append(
      makeEmpty(
        "The cap tracker is off — turn on “Inventory: Cap tracker” in settings."
      )
    );
    return;
  }
  if (view.updatedAt === 0) {
    body.append(
      makeEmpty(
        view.isFetching ? "Reading your inventory…" : "Inventory not read yet."
      )
    );
    return;
  }

  if (view.here) {
    const { card, body: cardBody } = makeCard("Drops here at or near cap", {
      aside: view.here.length > 0 ? String(view.here.length) : undefined,
      tone: view.here.some((item) => item.isAtCap) ? "err" : undefined,
    });
    if (view.here.length === 0) {
      cardBody.append(makeEmpty("Nothing — everything here still counts."));
    } else {
      const grid = document.createElement("div");
      grid.className = "fh-grid";
      for (const item of view.here) {
        const tile = document.createElement("a");
        tile.className = "fh-grid-item";
        tile.dataset.atCap = String(item.isAtCap);
        tile.href = item.href;
        tile.title = `${
          item.name
        }: ${item.count.toLocaleString()} / ${view.cap.toLocaleString()}${
          item.isAtCap ? " — at cap, thrown away" : " — near cap"
        }`;
        const icon = toIconUrl(item.image);
        if (icon) {
          const img = document.createElement("img");
          img.src = icon;
          img.alt = item.name;
          tile.append(img);
        } else {
          tile.textContent = item.name;
          tile.style.lineHeight = "30px";
          tile.style.padding = "0 6px";
          tile.style.fontSize = "12px";
          tile.style.color = TEXT_WHITE;
        }
        grid.append(tile);
      }
      cardBody.append(grid);
    }
    body.append(card);
  }

  const atCap = view.items.filter((item) => item.isAtCap);
  const nearCap = view.items.filter((item) => !item.isAtCap);
  const rows = new Map<string, HTMLElement>();

  if (atCap.length > 0) {
    const { card, body: cardBody } = makeCard("At cap", {
      aside: plural(atCap.length, "item"),
      tone: "err",
    });
    for (const item of atCap) {
      const row = makeCapRow(item, view.cap);
      rows.set(item.name, row);
      cardBody.append(row);
    }
    body.append(card);
  }
  if (nearCap.length > 0) {
    const { card, body: cardBody } = makeCard("Near cap", {
      aside: plural(nearCap.length, "item"),
      tone: "warn",
    });
    for (const item of nearCap) {
      const row = makeCapRow(item, view.cap);
      rows.set(item.name, row);
      cardBody.append(row);
    }
    body.append(card);
  }
  if (view.items.length === 0) {
    body.append(makeEmpty("Nothing at or near cap."));
  }

  const foot = document.createElement("div");
  foot.className = "fh-foot";
  const refresh = document.createElement("span");
  refresh.className = "fh-link";
  refresh.textContent = view.isFetching ? "reading…" : "refresh";
  refresh.addEventListener("click", (event) => {
    event.stopPropagation();
    onRefresh();
  });
  foot.append(
    `cap ${view.cap.toLocaleString()} · inventory read ${formatAge(
      view.updatedAt
    )} · `,
    refresh
  );
  body.append(foot);

  // Who would want each of these, filled in as the lookups land. The rows are
  // already on screen; a redraw in the meantime simply orphans these and the
  // next draw asks again (from cache, so it is instant the second time).
  const lookups = [...atCap, ...nearCap].slice(0, RELATIONSHIP_LOOKUPS);
  if (lookups.length === 0) {
    return;
  }
  const fill = async (): Promise<void> => {
    const [links, ...affinities] = await Promise.all([
      orUndefined(townsfolkState.get()).then(
        (snapshot) => snapshot?.links ?? []
      ),
      ...lookups.map((item) => getAffinities(item.name)),
    ]);
    for (const [index, item] of lookups.entries()) {
      const row = rows.get(item.name);
      const found = affinities[index];
      if (!row?.isConnected || found.length === 0) {
        continue;
      }
      const main = row.querySelector(".fh-row-main");
      if (!main || main.querySelector(".fh-row-tags")) {
        continue;
      }
      const tags = document.createElement("span");
      tags.className = "fh-row-tags";
      tags.append(...makeAffinityTags(found, links));
      main.append(tags);
    }
  };
  fill().catch((error) => {
    console.error("Failed to look up who wants the capped items", error);
  });
};
