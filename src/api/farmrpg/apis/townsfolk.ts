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

// The townsperson the game is giving extra friendship XP for today. It rotates
// daily and the townsfolk page highlights them; `reason` is whatever text the
// highlight carried ("2x XP today"), and `matchedBy` says which of the guesses
// below recognised it, so a wrong pick can be traced to the rule.
export interface DailyFriend extends TownsfolkLink {
  matchedBy: string;
  reason: string;
}

export interface TownsfolkSnapshot {
  dailyFriend?: DailyFriend;
  links: TownsfolkLink[];
  updatedAt: number;
}

export interface TownsfolkPage {
  dailyFriend?: DailyFriend;
  links: TownsfolkLink[];
}

// Words the game is likely to use next to the bonus townsperson. The page
// shape has never been captured, so this is a GUESS with a wide net: a hit is
// logged with the rule that fired, and a miss is logged asking for the markup.
const BONUS_TEXT =
  /\b(bonus|double|2x|extra|boost(?:ed)?|today(?:'s)?|daily|featured)\b/i;

// The visible lines of an element, one text node at a time: the game separates
// a name from its level and hearts with <br>, which textContent runs together,
// and whether its markup carries newlines between them is not something to
// depend on.
const textLines = (element: Element): string[] => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const lines: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const line = node.textContent?.trim() ?? "";
    if (line.length > 0) {
      lines.push(line);
    }
  }
  return lines;
};

const BADGE_CLASS = /star|bonus|daily|highlight|featured/i;
const BADGE_SELECTOR =
  '[class*="star"], [class*="bonus"], [class*="daily"], [class*="highlight"], [class*="featured"]';

const findHighlight = (
  anchor: HTMLAnchorElement,
  name: string
): { matchedBy: string; reason: string } | undefined => {
  const container = anchor.closest("li") ?? anchor;
  // (1) the row says so in words
  const said = textLines(container).find(
    (line) => line !== name && BONUS_TEXT.test(line)
  );
  if (said) {
    return { matchedBy: "text", reason: said.slice(0, 60) };
  }
  // (2) a badge-like element: a star icon, or a class that names the bonus
  const badge = container.querySelector(BADGE_SELECTOR);
  if (badge) {
    const className = [...badge.classList].find((entry) =>
      BADGE_CLASS.test(entry)
    );
    return {
      matchedBy: `badge .${className ?? badge.className}`,
      reason: "featured today",
    };
  }
  // (3) the row is painted: an inline background or border on the row, the
  // link or its title, which the plain rows do not carry
  for (const element of [
    container,
    anchor,
    anchor.querySelector(".item-title"),
    anchor.querySelector(".item-inner"),
  ]) {
    const style = element?.getAttribute("style") ?? "";
    if (/background|border|box-shadow|outline/i.test(style)) {
      return {
        matchedBy: `style ${style.slice(0, 40)}`,
        reason: "featured today",
      };
    }
  }
  return undefined;
};

export const parseTownsfolkPage = (root: HTMLElement): TownsfolkPage => {
  const seen = new Map<string, TownsfolkLink>();
  let dailyFriend: DailyFriend | undefined;
  for (const anchor of root.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    const href = anchor.getAttribute("href") ?? "";
    // a townsperson's own page, whatever the game calls it, carries an id;
    // navigation and the tab bar do not
    if (!/\?.*\bid=\d+/.test(href)) {
      continue;
    }
    // the visible name is the first line of the link's text; levels and
    // hearts follow it on their own lines
    const [name] = textLines(anchor);
    if (!name || seen.has(name.toLowerCase())) {
      continue;
    }
    const link: TownsfolkLink = {
      href,
      image: anchor.querySelector("img")?.getAttribute("src") ?? undefined,
      name,
    };
    seen.set(name.toLowerCase(), link);
    if (!dailyFriend) {
      const highlight = findHighlight(anchor, name);
      if (highlight) {
        dailyFriend = { ...link, ...highlight };
      }
    }
  }
  return { dailyFriend, links: [...seen.values()] };
};

export const townsfolkState = new CachedState<TownsfolkSnapshot>(
  StorageKey.TOWNSFOLK,
  async () => {
    const response = await getHTML(Page.FRIENDSHIP, new URLSearchParams());
    const { dailyFriend, links } = parseTownsfolkPage(response.body);
    if (links.length === 0) {
      console.warn("[Farmhand] no townsfolk links found on the townsfolk page");
    } else if (dailyFriend) {
      console.info(
        `[Farmhand] daily friend: ${dailyFriend.name} (${dailyFriend.matchedBy}: ${dailyFriend.reason})`
      );
    } else {
      console.info(
        "[Farmhand] no daily-friend highlight recognised on the townsfolk page — the row's markup is needed to pin it"
      );
    }
    return { dailyFriend, links, updatedAt: Date.now() };
  },
  {
    // the links change never, the daily friend changes at the game's reset;
    // an hour keeps the badge honest for the cost of one read per hour of play
    timeout: 60 * 60,
    defaultState: { links: [], updatedAt: 0 },
  }
);

// Case-insensitive, and tolerant of the honorifics buddy.farm keeps that the
// game's list might not ("Charles Horsington III" vs "Charles").
export const isSamePerson = (a: string, b: string): boolean => {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  return left === right || left.startsWith(right) || right.startsWith(left);
};

export const findTownsfolkLink = (
  links: readonly TownsfolkLink[],
  name: string
): TownsfolkLink | undefined => {
  const wanted = name.trim().toLowerCase();
  return (
    links.find((link) => link.name.toLowerCase() === wanted) ??
    links.find((link) => isSamePerson(link.name, wanted))
  );
};
