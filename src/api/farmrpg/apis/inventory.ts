import { CachedState, StorageKey } from "~/utils/state";
import { getHTML } from "../utils/requests";
import { Page } from "~/utils/page";

// e.g. "you cannot store more than 200 of any one item"
const INVENTORY_CAP_PATTERN = /more than ([\d,]+) of any/g;

export interface InventoryRow {
  count: number;
  href: string;
  image?: string;
  name: string;
}

export interface InventoryPage {
  cap: number;
  rows: InventoryRow[];
}

export interface InventorySnapshot {
  cap: number;
  // item name -> count on hand. Only items the page actually lists, so a
  // missing key means zero, not unknown.
  quantities: Record<string, number>;
  updatedAt: number;
}

// count text of an inventory row, excluding any badge the cap warnings appended
export const getRowCount = (after: HTMLElement): number => {
  const countText = [...after.childNodes]
    .filter(
      (node) =>
        !(
          node instanceof HTMLElement && node.classList.contains("fh-cap-badge")
        )
    )
    .map((node) => node.textContent ?? "")
    .join("");
  return Number(countText.replaceAll(",", "").trim());
};

// An inventory row's title is the item name followed by a description and
// sometimes a status flag:
//
//   <div class="item-title">Iron<br><span>A pressing need</span>MAX ON HAND</div>
//
// so reading its textContent yields "Iron\n A pressing needMAX ON HAND". That
// was cosmetic while only the cap tracker used it, but these names are the keys
// of the inventory snapshot the planner looks items up by, and a mangled key
// matches nothing — every lookup for such an item silently reported zero on
// hand. The name is the leading text node, before any markup.
const getRowName = (title: HTMLElement | null): string | undefined => {
  if (!title) {
    return undefined;
  }
  for (const node of title.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        return text;
      }
      continue;
    }
    // stop at the first element: anything past it is description or status
    break;
  }
  return title.textContent?.trim().split("\n")[0].trim();
};

// Parse every item row out of an inventory page DOM, plus the storage cap.
// This is the whole inventory, unfiltered — the cap tracker narrows it down to
// the at/near-cap rows, the craft planner wants all of it. Returns undefined
// when the page carries no cap text at all, which is how a fetch that landed
// somewhere else (a login redirect, an error page) is told apart from a
// genuinely empty inventory.
export const parseInventoryPage = (
  root: HTMLElement
): InventoryPage | undefined => {
  // the page can mention several caps (e.g. the wagon upgrade pitch quotes
  // the next tier's number), so use the smallest match: that is always the
  // player's current cap
  const caps = [...(root.textContent ?? "").matchAll(INVENTORY_CAP_PATTERN)]
    .map((match) => Number(match[1].replaceAll(",", "")))
    .filter((value) => value > 0);
  if (caps.length === 0) {
    return undefined;
  }
  const cap = Math.min(...caps);
  const rows: InventoryRow[] = [];
  for (const row of root.querySelectorAll<HTMLLIElement>(".list-group li")) {
    if (row.classList.contains("item-divider")) {
      continue;
    }
    const after = row.querySelector<HTMLElement>(".item-after");
    const link =
      row.querySelector<HTMLAnchorElement>("a.item-link") ??
      row.querySelector<HTMLAnchorElement>("a");
    if (!after || !link) {
      continue;
    }
    const count = getRowCount(after);
    if (Number.isNaN(count)) {
      continue;
    }
    const image = row.querySelector<HTMLImageElement>(".item-media img");
    const name = getRowName(row.querySelector<HTMLElement>(".item-title"));
    if (!name) {
      continue;
    }
    rows.push({
      count,
      href: link.getAttribute("href") ?? "inventory.php",
      image: image?.getAttribute("src") ?? undefined,
      name,
    });
  }
  return { cap, rows };
};

export const toInventorySnapshot = (page: InventoryPage): InventorySnapshot => {
  const quantities: Record<string, number> = {};
  for (const row of page.rows) {
    // the page lists an item once, but sum defensively rather than let a
    // duplicate row silently overwrite the real count
    quantities[row.name] = (quantities[row.name] ?? 0) + row.count;
  }
  return { cap: page.cap, quantities, updatedAt: Date.now() };
};

// The player's current inventory, as a name -> count map.
//
// No `defaultState`: with an object default, `set` merges over the previous
// value, which for a full snapshot is wrong — an item spent down to zero drops
// off the page entirely and a merge would keep asserting the stale count. With
// no default, a fresh snapshot replaces the old one wholesale, and `set(undefined)`
// (a parse that produced nothing) keeps the last good one instead of asserting
// an empty inventory.
export const inventoryState = new CachedState<InventorySnapshot>(
  StorageKey.INVENTORY,
  async () => {
    const response = await getHTML(Page.INVENTORY, new URLSearchParams());
    const page = parseInventoryPage(response.body);
    return page ? toInventorySnapshot(page) : undefined;
  },
  {
    timeout: 10 * 60, // 10 minutes
  }
);

// Publish an already-parsed page into the snapshot. Callers that fetched or
// rendered the inventory for their own reasons use this so the planner rides
// along on a request that already happened instead of issuing its own.
export const publishInventoryPage = (page: InventoryPage): void => {
  inventoryState.set(toInventorySnapshot(page));
};
