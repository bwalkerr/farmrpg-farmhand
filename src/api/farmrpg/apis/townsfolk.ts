import { CachedState, StorageKey } from "~/utils/state";
import { getHTML } from "../utils/requests";
import { Page } from "~/utils/page";

// Where each townsperson's page is in the game, by name.
//
// buddy.farm knows who loves and likes an item but not the game's id for the
// person, and its own ids are its own. The game's townsfolk list (npclevels)
// links every one of them, so the map is read off that page once a day and the
// panel can send you straight to the give page rather than to a name.
export interface TownsfolkLink {
  href: string;
  image?: string;
  name: string;
}

export interface TownsfolkSnapshot {
  links: TownsfolkLink[];
  updatedAt: number;
}

export const parseTownsfolkPage = (root: HTMLElement): TownsfolkLink[] => {
  const seen = new Map<string, TownsfolkLink>();
  for (const anchor of root.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    const href = anchor.getAttribute("href") ?? "";
    // a townsperson's own page, whatever the game calls it, carries an id;
    // navigation and the tab bar do not
    if (!/\?.*\bid=\d+/.test(href)) {
      continue;
    }
    // the visible name is the first line of the link's text; levels and
    // hearts follow it on their own lines
    const name = (anchor.textContent ?? "")
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0);
    if (!name || seen.has(name.toLowerCase())) {
      continue;
    }
    seen.set(name.toLowerCase(), {
      href,
      image: anchor.querySelector("img")?.getAttribute("src") ?? undefined,
      name,
    });
  }
  return [...seen.values()];
};

export const townsfolkState = new CachedState<TownsfolkSnapshot>(
  StorageKey.TOWNSFOLK,
  async () => {
    const response = await getHTML(Page.FRIENDSHIP, new URLSearchParams());
    const links = parseTownsfolkPage(response.body);
    if (links.length === 0) {
      console.warn("[Farmhand] no townsfolk links found on the townsfolk page");
    }
    return { links, updatedAt: Date.now() };
  },
  {
    timeout: 60 * 60 * 24, // 1 day
    defaultState: { links: [], updatedAt: 0 },
  }
);

// Case-insensitive, and tolerant of the honorifics buddy.farm keeps that the
// game's list might not ("Charles Horsington III" vs "Charles").
export const findTownsfolkLink = (
  links: readonly TownsfolkLink[],
  name: string
): TownsfolkLink | undefined => {
  const wanted = name.trim().toLowerCase();
  return (
    links.find((link) => link.name.toLowerCase() === wanted) ??
    links.find(
      (link) =>
        wanted.startsWith(link.name.toLowerCase()) ||
        link.name.toLowerCase().startsWith(wanted)
    )
  );
};
