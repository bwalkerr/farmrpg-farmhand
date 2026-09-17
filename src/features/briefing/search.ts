import {
  KIND_LABEL,
  kindOfHref,
  searchEntries,
  SearchEntry,
} from "./searchIndex";
import { orUndefined } from "~/utils/promise";
import { pageDataState } from "~/api/buddyfarm/api";
import { toIconUrl } from "./shared";

export type { SearchEntry, SearchKind } from "./searchIndex";
export { slugOf } from "./searchIndex";

// Search over everything buddy.farm indexes -- items, quests, questlines,
// townsfolk, locations -- from the panel head, with the keyboard. A hit opens
// as a lookup inside the panel (see lookup.ts): buddy.farm's page, with the
// game's links and your own numbers on it.

let index: SearchEntry[] | undefined;
let indexing: Promise<SearchEntry[]> | undefined;

export const getSearchIndex = (): Promise<SearchEntry[]> => {
  if (index) {
    return Promise.resolve(index);
  }
  if (!indexing) {
    indexing = (async () => {
      const data = await orUndefined(pageDataState.get());
      const entries: SearchEntry[] = [];
      const buckets = [
        ...(data?.items ?? []),
        ...(data?.quests ?? []),
        ...(data?.questlines ?? []),
        ...(data?.townsfolk ?? []),
        ...(data?.pages ?? []),
      ];
      for (const page of buckets) {
        const kind = kindOfHref(page.href);
        // calculators and the like have no in-game counterpart, and a
        // questline has no page to open here (yet)
        if (!kind || kind === "questline") {
          continue;
        }
        entries.push({
          href: page.href,
          image: page.image,
          kind,
          name: page.name,
          searchText: (page.searchText || page.name).toLowerCase(),
        });
      }
      index = entries;
      return entries;
    })();
  }
  return indexing;
};

export interface SearchBox {
  element: HTMLElement;
  focus: () => void;
  clear: () => void;
}

// The input and its results list. `onSelect` gets the chosen entry; the box
// clears itself afterwards. Arrow keys move, Enter picks, Escape closes.
export const makeSearchBox = (
  onSelect: (entry: SearchEntry) => void
): SearchBox => {
  const wrap = document.createElement("div");
  wrap.className = "fh-search";
  const input = document.createElement("input");
  input.className = "fh-search-input";
  input.type = "search";
  input.placeholder = "Search items, quests, places…";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", "Search buddy.farm");
  const hint = document.createElement("kbd");
  hint.className = "fh-search-kbd";
  hint.textContent = "Ctrl K";
  const results = document.createElement("div");
  results.className = "fh-search-results";
  results.dataset.on = "false";
  wrap.append(input, hint, results);

  let current: SearchEntry[] = [];
  let cursor = -1;

  const close = (): void => {
    results.dataset.on = "false";
    results.replaceChildren();
    current = [];
    cursor = -1;
  };

  const paint = (): void => {
    results.replaceChildren();
    if (current.length === 0) {
      results.dataset.on = "false";
      return;
    }
    results.dataset.on = "true";
    for (const [position, entry] of current.entries()) {
      const row = document.createElement("div");
      row.className = "fh-search-row";
      row.dataset.active = String(position === cursor);
      const icon = toIconUrl(entry.image);
      if (icon) {
        const img = document.createElement("img");
        img.src = icon;
        img.alt = "";
        img.loading = "lazy";
        row.append(img);
      }
      const name = document.createElement("span");
      name.className = "fh-search-name";
      name.textContent = entry.name;
      const kind = document.createElement("span");
      kind.className = "fh-search-kind";
      kind.textContent = KIND_LABEL[entry.kind];
      row.append(name, kind);
      // mousedown, not click: the input blurs on click and would close the
      // list before the click lands
      row.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        pick(entry);
      });
      row.dataset.position = String(position);
      results.append(row);
    }
  };

  // hover moves the cursor; one listener on the list rather than one per row
  results.addEventListener("mousemove", (event) => {
    const row = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      ".fh-search-row"
    );
    const position = Number(row?.dataset.position ?? -1);
    if (row && position !== cursor) {
      cursor = position;
      paint();
    }
  });

  const pick = (entry: SearchEntry): void => {
    input.value = "";
    close();
    onSelect(entry);
  };

  let latest = 0;
  input.addEventListener("input", () => {
    latest += 1;
    const stamp = latest;
    const query = input.value;
    if (query.trim().length === 0) {
      close();
      return;
    }
    getSearchIndex()
      .then((entries) => {
        if (stamp !== latest) {
          return;
        }
        current = searchEntries(entries, query);
        cursor = current.length > 0 ? 0 : -1;
        paint();
      })
      .catch((error) => {
        console.error("Search failed", error);
      });
  });
  input.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (current.length === 0) {
          return;
        }
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        cursor = (cursor + step + current.length) % current.length;
        paint();

        break;
      }
      case "Enter": {
        if (cursor >= 0 && current[cursor]) {
          event.preventDefault();
          pick(current[cursor]);
        }

        break;
      }
      case "Escape": {
        event.stopPropagation();
        if (input.value) {
          input.value = "";
          close();
        } else {
          input.blur();
        }

        break;
      }
      // No default
    }
  });
  input.addEventListener("blur", () => {
    // let a mousedown on a row land first
    setTimeout(close, 120);
  });
  input.addEventListener("focus", () => {
    if (input.value.trim().length > 0) {
      input.dispatchEvent(new Event("input"));
    }
  });
  // the panel closes on outside clicks; typing in here is not outside
  wrap.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  return {
    clear: () => {
      input.value = "";
      close();
    },
    element: wrap,
    focus: () => {
      input.focus();
      input.select();
    },
  };
};
