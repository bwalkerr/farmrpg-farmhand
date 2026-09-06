import {
  AbridgedItem,
  BasicEntity,
  BuddyFarmPage,
  Item,
  BuddyFarmPageData as PageData,
  QuestDetail,
} from "./types";
import { CachedState, StorageKey } from "../../utils/state";
import { NAME_OVERRIDES, nameToSlug } from "./requests";

interface PageDataResponse {
  componentChunkName: string;
  path: string;
  result: {
    data: {
      farmrpg: {
        items: Item[];
      };
    };
    pageContext: {
      id: number;
      name: string;
    };
  };
  slicesMap: unknown;
  staticQueryHashes: unknown;
}

export const itemDataState = new CachedState<Item, string>(
  StorageKey.ITEM_DATA,
  async (state, itemName) => {
    if (!itemName) {
      return;
    }
    const previous = state.state[itemName];
    if (previous) {
      return previous;
    }
    if (!itemName) {
      return;
    }
    const response = await fetch(
      `https://buddy.farm/page-data/i/${nameToSlug(itemName)}/page-data.json`
    );
    const data = (await response.json()) as PageDataResponse;
    const item = data?.result?.data?.farmrpg?.items?.[0];
    if (!item) {
      console.error(`Item ${itemName} not found`);
      return previous;
    }
    return item;
  },
  {
    // seconds — this was under 3 hours despite saying a week; item data on
    // buddy.farm barely changes, so honour the week that was intended
    timeout: 60 * 60 * 24 * 7, // 1 week
  }
);

export const getAbridgedItem = async (
  itemName: string
): Promise<AbridgedItem> => {
  const item = await itemDataState.get({ query: itemName, lazy: true });
  return item
    ? {
        __typename: item.__typename,
        id: item.id,
        image: item.image,
        name: item.name,
      }
    : {
        __typename: "FarmRPG_Item",
        id: 0,
        image:
          "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2aWV3Qm94PScwIDAgMTIwIDEyMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+PGRlZnM+PGxpbmUgaWQ9J2wnIHgxPSc2MCcgeDI9JzYwJyB5MT0nNycgeTI9JzI3JyBzdHJva2U9JyM2YzZjNmMnIHN0cm9rZS13aWR0aD0nMTEnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcvPjwvZGVmcz48Zz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMjcnLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMjcnIHRyYW5zZm9ybT0ncm90YXRlKDMwIDYwLDYwKScvPjx1c2UgeGxpbms6aHJlZj0nI2wnIG9wYWNpdHk9Jy4yNycgdHJhbnNmb3JtPSdyb3RhdGUoNjAgNjAsNjApJy8+PHVzZSB4bGluazpocmVmPScjbCcgb3BhY2l0eT0nLjI3JyB0cmFuc2Zvcm09J3JvdGF0ZSg5MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMjcnIHRyYW5zZm9ybT0ncm90YXRlKDEyMCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMjcnIHRyYW5zZm9ybT0ncm90YXRlKDE1MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMzcnIHRyYW5zZm9ybT0ncm90YXRlKDE4MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuNDYnIHRyYW5zZm9ybT0ncm90YXRlKDIxMCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuNTYnIHRyYW5zZm9ybT0ncm90YXRlKDI0MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuNjYnIHRyYW5zZm9ybT0ncm90YXRlKDI3MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuNzUnIHRyYW5zZm9ybT0ncm90YXRlKDMwMCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuODUnIHRyYW5zZm9ybT0ncm90YXRlKDMzMCA2MCw2MCknLz48L2c+PC9zdmc+",
        name: itemName,
      };
};

export const getBasicItems = async (): Promise<BasicEntity[]> => {
  const { items } = (await pageDataState.get()) ?? {};
  return items?.map(({ name, image }) => ({ name, image })) ?? [];
};

export const isItem = async (name: string): Promise<boolean> => {
  const items = await getBasicItems();
  const searchName = NAME_OVERRIDES[name] ?? name;
  return items.some((item) => item.name === searchName);
};

export const pageDataState = new CachedState<PageData>(
  StorageKey.PAGE_DATA,
  async () => {
    const pages: PageData = {
      townsfolk: [],
      questlines: [],
      quizzes: [],
      quests: [],
      items: [],
      pages: [],
    };
    const response = await fetch("https://buddy.farm/search.json");
    const data = (await response.json()) as BuddyFarmPage[];
    for (const page of data) {
      // eslint-disable-next-line unicorn/prefer-switch
      if (page.type === "Townsfolk") {
        pages.townsfolk.push(page);
      } else if (page.type === "Questline") {
        pages.questlines.push(page);
      } else if (page.type === "Schoolhouse Quiz") {
        pages.quizzes.push(page);
      } else if (page.href.startsWith("/q/")) {
        pages.quests.push(page);
      } else if (page.href.startsWith("/i/")) {
        pages.items.push(page);
      } else {
        pages.pages.push(page);
      }
    }
    return pages;
  },
  {
    timeout: 60 * 60 * 24, // 1 day
    defaultState: {
      townsfolk: [],
      questlines: [],
      quizzes: [],
      quests: [],
      items: [],
      pages: [],
    },
  }
);

interface QuestPageDataResponse {
  result: {
    data: {
      farmrpg: {
        quests: QuestDetail[];
      };
    };
  };
}

// Quest requirements, keyed by the quest's display name — the game's quest list
// gives ids and titles, buddy.farm indexes by slug, and the title is the only
// thing the two share. Cached for a week alongside item data; quest definitions
// change about as often.
export const questDataState = new CachedState<QuestDetail, string>(
  StorageKey.QUEST_DATA,
  async (state, questName) => {
    if (!questName) {
      return;
    }
    const previous = state.state[questName];
    if (previous) {
      return previous;
    }
    const response = await fetch(
      `https://buddy.farm/page-data/q/${nameToSlug(questName)}/page-data.json`
    );
    if (!response.ok) {
      return previous;
    }
    const data = (await response.json()) as QuestPageDataResponse;
    const quest = data?.result?.data?.farmrpg?.quests?.[0];
    if (!quest) {
      console.error(`Quest ${questName} not found`);
      return previous;
    }
    return quest;
  },
  {
    timeout: 60 * 60 * 24 * 7, // 1 week
  }
);

interface LocationDropProfile {
  ironDepot: boolean | null;
  items: { item: { id: number; name: string }; rate: number }[];
  runecube: boolean | null;
}

interface LocationPageDataResponse {
  result: {
    data: {
      farmrpg: {
        locations: {
          dropRates: LocationDropProfile[];
          name: string;
          type: "explore" | "fishing";
        }[];
      };
    };
    pageContext: { id: number; name: string };
  };
}

export interface LocationDrop {
  id: number;
  name: string;
  // expected attempts for one unit, buddy.farm's "1 in N"
  rate: number;
}

export interface LocationRef {
  // everything that drops here, best rate first
  drops: LocationDrop[];
  id: number;
  name: string;
  type: "explore" | "fishing";
}

// A location's in-game id, so drop advice can link straight to the place
// rather than just naming it.
//
// buddy.farm mirrors the game's own database ids -- verified against ten items
// whose ids Reed's Craftworks page reported independently, all exact -- and the
// id lives on the page's `pageContext`, not on the location record itself.
export const locationDataState = new CachedState<LocationRef, string>(
  StorageKey.LOCATION_DATA,
  async (state, locationName) => {
    if (!locationName) {
      return;
    }
    const previous = state.state[locationName];
    if (previous) {
      return previous;
    }
    const response = await fetch(
      `https://buddy.farm/page-data/l/${nameToSlug(
        locationName
      )}/page-data.json`
    );
    if (!response.ok) {
      return previous;
    }
    const data = (await response.json()) as LocationPageDataResponse;
    const location = data?.result?.data?.farmrpg?.locations?.[0];
    const id = data?.result?.pageContext?.id;
    if (!location || !id) {
      return previous;
    }
    // Prefer the profile that assumes no perks, so a quoted rate is one the
    // player can definitely hit; fall back to whatever exists if every profile
    // needs one. Rates are per item, so the best across profiles is kept.
    const profiles = location.dropRates ?? [];
    const plain = profiles.filter(
      (profile) => !profile.ironDepot && !profile.runecube
    );
    const best = new Map<string, LocationDrop>();
    for (const profile of plain.length > 0 ? plain : profiles) {
      for (const entry of profile.items ?? []) {
        if (!entry.item?.name || !entry.rate) {
          continue;
        }
        const existing = best.get(entry.item.name);
        if (!existing || entry.rate < existing.rate) {
          best.set(entry.item.name, {
            id: entry.item.id,
            name: entry.item.name,
            rate: entry.rate,
          });
        }
      }
    }
    return {
      drops: [...best.values()].sort((a, b) => a.rate - b.rate),
      id,
      name: location.name,
      type: location.type,
    };
  },
  {
    timeout: 60 * 60 * 24 * 7, // 1 week
  }
);

// Every location buddy.farm knows, for matching a page title against. They land
// in the catch-all `pages` bucket, identified by their /l/ href.
export const getLocationEntries = async (): Promise<
  { image: string; name: string }[]
> => {
  const { pages } = (await pageDataState.get()) ?? {};
  return (pages ?? [])
    .filter((page) => page.href.startsWith("/l/"))
    .map((page) => ({ image: page.image, name: page.name }));
};

export const getLocationNames = async (): Promise<string[]> => {
  const entries = await getLocationEntries();
  return entries.map((entry) => entry.name);
};
