import { getListByTitle } from "~/utils/page";
import { Goal } from "~/utils/focus";
import { questDataState } from "~/api/buddyfarm/api";

export interface ActiveQuest {
  href: string;
  id: string;
  title: string;
}

// Read the player's open requests off the quests page. Same selectors the quest
// tagging feature has used since upstream, so this is proven markup rather than
// a fresh guess: each request is an `li` whose link carries the quest id and
// whose `.item-title strong` is the title.
export const parseActiveQuests = (): ActiveQuest[] => {
  const list = getListByTitle(/Active Requests/);
  if (!list) {
    return [];
  }
  const quests: ActiveQuest[] = [];
  for (const element of list.querySelectorAll("li")) {
    const link = element.querySelector("a");
    const href = link?.getAttribute("href") ?? "";
    const id = href.split("?id=")[1];
    const title = element
      .querySelector(".item-title strong")
      ?.textContent?.trim();
    if (!id || !title) {
      continue;
    }
    quests.push({ href, id, title });
  }
  return quests;
};

export interface QuestGoals {
  goals: Goal[];
  // titles buddy.farm had no page for, so their requirements are unknown
  unmatched: string[];
}

// Turn open requests into goals by looking their requirements up on buddy.farm.
//
// The game's quest list gives ids and titles but not requirements, and the
// title is the only key the two sources share — so a quest buddy.farm has not
// indexed (a brand new or event request) simply drops out rather than being
// reported as needing nothing.
export const getQuestGoals = async (
  quests: ActiveQuest[]
): Promise<QuestGoals> => {
  const details = await Promise.all(
    quests.map(async (quest) => {
      try {
        return await questDataState.get({ query: quest.title });
      } catch {}
    })
  );
  const goals: Goal[] = [];
  const unmatched: string[] = [];
  for (const [index, detail] of details.entries()) {
    const quest = quests[index];
    if (!detail) {
      unmatched.push(quest.title);
      continue;
    }
    const needs = (detail.requiredItems ?? []).map((entry) => ({
      name: entry.item.name,
      quantity: entry.quantity,
    }));
    if (needs.length === 0) {
      // a request that wants only silver or a level has no item bottleneck
      continue;
    }
    goals.push({
      href: quest.href,
      kind: "quest",
      label: quest.title,
      needs,
    });
  }
  return { goals, unmatched };
};
