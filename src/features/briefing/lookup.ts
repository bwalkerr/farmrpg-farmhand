import {
  Context,
  formatHits,
  makeCard,
  makeEmpty,
  makeRow,
  makeTag,
  plural,
  toIconUrl,
  Tone,
} from "./shared";
import {
  findTownsfolkLink,
  townsfolkState,
} from "~/api/farmrpg/apis/townsfolk";
import {
  itemDataState,
  locationDataState,
  questDataState,
  townsfolkDataState,
} from "~/api/buddyfarm/api";
import { makeLink, toLocationHref } from "~/utils/gameLinks";
import { NPCDetail } from "~/api/buddyfarm/types";
import { orUndefined } from "~/utils/promise";
import { renderLocationView } from "./here";
import { SearchEntry, slugOf } from "./search";
import { TEXT_WHITE } from "~/utils/theme";

// buddy.farm's pages, drawn inside the panel with the game's own links and
// your numbers on them. Every name that has a page in the game links there;
// the ▸ at the end of a row opens the same thing here instead, so you can
// walk item → quest → item without leaving the panel.

export type Lookup =
  | { kind: "item"; name: string }
  | { kind: "quest"; name: string }
  | { kind: "townsfolk"; name: string; slug: string }
  | { kind: "location"; name: string };

export const toLookup = (entry: SearchEntry): Lookup | undefined => {
  switch (entry.kind) {
    case "item": {
      return { kind: "item", name: entry.name };
    }
    case "quest": {
      return { kind: "quest", name: entry.name };
    }
    case "townsfolk": {
      return { kind: "townsfolk", name: entry.name, slug: slugOf(entry) };
    }
    case "location": {
      return { kind: "location", name: entry.name };
    }
    default: {
      return undefined;
    }
  }
};

type Open = (lookup: Lookup) => void;

const MAX_ROWS = 8;

// a row's trailing "open here" control
const makeOpenHere = (open: Open, lookup: Lookup): HTMLElement => {
  const button = document.createElement("span");
  button.className = "fh-open-here";
  button.textContent = "▸";
  button.title = "Open in the panel";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    open(lookup);
  });
  return button;
};

const makeMore = (
  total: number,
  shown: number,
  onMore: () => void
): HTMLElement | undefined => {
  if (total <= shown) {
    return undefined;
  }
  const more = document.createElement("div");
  more.className = "fh-foot";
  const link = document.createElement("span");
  link.className = "fh-link";
  link.textContent = `show all ${total}`;
  link.addEventListener("click", (event) => {
    event.stopPropagation();
    onMore();
  });
  more.append(link);
  return more;
};

// A list that shows MAX_ROWS and expands in place.
const fillList = <T>(
  body: HTMLElement,
  entries: readonly T[],
  toRow: (entry: T) => HTMLElement
): void => {
  const paint = (limit: number): void => {
    body.replaceChildren();
    for (const entry of entries.slice(0, limit)) {
      body.append(toRow(entry));
    }
    const more = makeMore(entries.length, limit, () => paint(entries.length));
    if (more) {
      body.append(more);
    }
  };
  paint(MAX_ROWS);
};

const makeHeader = (
  image: string | undefined,
  name: string | Node,
  sub: (string | Node)[]
): HTMLElement => {
  const place = document.createElement("div");
  place.className = "fh-place";
  const icon = toIconUrl(image);
  if (icon) {
    const img = document.createElement("img");
    img.src = icon;
    img.alt = "";
    place.append(img);
  }
  const text = document.createElement("div");
  const title = document.createElement("div");
  title.className = "fh-place-name";
  title.append(name);
  const subline = document.createElement("div");
  subline.className = "fh-place-sub";
  subline.append(...sub);
  text.append(title, subline);
  place.append(text);
  return place;
};

const haveOf = (context: Context, name: string): number =>
  context.inventory[name] ?? 0;

// which of your undertakings are short of this item
const wantedBy = (context: Context, name: string): string[] =>
  context.resolved.scopes
    .filter((scope) => scope.missing.some((entry) => entry.name === name))
    .map((scope) => scope.label);

const itemHref = (id: number | undefined): string | undefined =>
  id ? `item.php?id=${id}` : undefined;

const questHref = (id: number | undefined): string | undefined =>
  id ? `quest.php?id=${id}` : undefined;

const makeCountAside = (
  context: Context,
  name: string,
  needed?: number
): (string | Node)[] => {
  const have = haveOf(context, name);
  const strong = document.createElement("strong");
  strong.textContent = have.toLocaleString();
  if (needed !== undefined) {
    strong.style.color = have >= needed ? "var(--fh-ok)" : "var(--fh-warn)";
    return [strong, ` / ${needed.toLocaleString()}`];
  }
  if (context.cap) {
    return [strong, ` / ${context.cap.toLocaleString()}`];
  }
  return [strong];
};

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const renderItem = async (
  body: HTMLElement,
  context: Context,
  name: string,
  open: Open
): Promise<void> => {
  const item = await orUndefined(itemDataState.get({ query: name }));
  if (!item) {
    body.append(makeEmpty(`buddy.farm has no page for “${name}”.`));
    return;
  }
  const have = haveOf(context, item.name);
  const { cap } = context;
  const isAtCap = cap !== undefined && cap > 0 && have >= cap;

  const sub: (string | Node)[] = [];
  const gameLink = itemHref(item.id);
  if (gameLink) {
    sub.push(makeLink(gameLink, "open item page ↗", "var(--fh-accent)"));
  }
  body.append(makeHeader(item.image, item.name, sub));

  // your standing with it, in one strip
  const tags = document.createElement("div");
  tags.className = "fh-row-tags";
  tags.style.marginBottom = "8px";
  tags.append(
    makeTag(
      `you have ${have.toLocaleString()}${
        cap ? ` / ${cap.toLocaleString()}` : ""
      }`,
      isAtCap ? "err" : "muted"
    )
  );
  for (const label of wantedBy(context, item.name).slice(0, 3)) {
    tags.append(makeTag(`wanted: ${label}`, "ok"));
  }
  if (item.canBuy && item.buyPrice > 0) {
    tags.append(
      makeTag(`store ${item.buyPrice.toLocaleString()} silver`, "muted")
    );
  }
  if (item.fleaMarketPrice > 0) {
    tags.append(
      makeTag(
        `flea market ${item.fleaMarketPrice.toLocaleString()} gold`,
        "muted"
      )
    );
  }
  if (item.craftingLevel > 0) {
    tags.append(makeTag(`crafting ${item.craftingLevel}`, "accent"));
  }
  if (item.cookingLevel > 0) {
    tags.append(makeTag(`cooking ${item.cookingLevel}`, "accent"));
  }
  body.append(tags);
  if (item.description) {
    const description = document.createElement("div");
    description.className = "fh-empty";
    description.style.padding = "0 2px 8px";
    description.textContent = item.description;
    body.append(description);
  }

  // where it comes from
  const sources = makeCard("Obtainable from");
  let sourceCount = 0;
  const byLocation = new Map<
    string,
    { rate: number; type: "explore" | "fishing"; image: string }
  >();
  for (const entry of item.dropRatesItems ?? []) {
    const location = entry.dropRates?.location;
    if (!location?.name || !entry.rate) {
      continue;
    }
    const existing = byLocation.get(location.name);
    if (!existing || entry.rate < existing.rate) {
      byLocation.set(location.name, {
        image: location.image,
        rate: entry.rate,
        type: location.type,
      });
    }
  }
  const locationNames = [...byLocation.keys()];
  const references = await Promise.all(
    locationNames.map((locationName) =>
      orUndefined(locationDataState.get({ query: locationName }))
    )
  );
  const { resolved } = context;
  const wanted = Math.max(
    0,
    ...resolved.scopes
      .flatMap((scope) => scope.missing)
      .filter((entry) => entry.name === item.name)
      .map((entry) => entry.quantity)
  );
  for (const [index, locationName] of locationNames
    .sort(
      (a, b) => (byLocation.get(a)?.rate ?? 0) - (byLocation.get(b)?.rate ?? 0)
    )
    .entries()) {
    const drop = byLocation.get(locationName);
    const reference = references[locationNames.indexOf(locationName)];
    if (!drop) {
      continue;
    }
    const rate = document.createElement("strong");
    rate.textContent = `1 in ${formatHits(drop.rate)}`;
    const subParts: (string | Node)[] = [
      drop.type === "fishing" ? "fishing" : "exploring",
    ];
    if (wanted > 0) {
      subParts.push(
        ` · ~${formatHits(wanted * drop.rate)} ${
          drop.type === "fishing" ? "casts" : "explores"
        } for the ${wanted.toLocaleString()} you need`
      );
    }
    sources.body.append(
      makeRow(
        reference
          ? makeLink(toLocationHref(reference), locationName, TEXT_WHITE)
          : locationName,
        {
          aside: [
            rate,
            makeOpenHere(open, { kind: "location", name: locationName }),
          ],
          icon: toIconUrl(drop.image),
          sub: subParts,
          tone: index === 0 ? "ok" : undefined,
        }
      )
    );
    sourceCount += 1;
  }
  for (const production of item.manualProductions ?? []) {
    sources.body.append(
      makeRow(production.lineOne, {
        aside: [production.value],
        icon: toIconUrl(production.image),
        sub: [production.lineTwo],
      })
    );
    sourceCount += 1;
  }
  for (const entry of item.petItems ?? []) {
    sources.body.append(
      makeRow(entry.pet.name, {
        aside: [`level ${entry.level}`],
        icon: toIconUrl(entry.pet.image),
        sub: ["pet"],
      })
    );
    sourceCount += 1;
  }
  for (const entry of item.locksmithOutputItems ?? []) {
    sources.body.append(
      makeRow(
        makeLink(itemHref(entry.item.id) ?? "#", entry.item.name, TEXT_WHITE),
        {
          aside: [
            entry.quantityMin === entry.quantityMax
              ? `×${entry.quantityMax}`
              : `×${entry.quantityMin}–${entry.quantityMax}`,
            makeOpenHere(open, { kind: "item", name: entry.item.name }),
          ],
          icon: toIconUrl(entry.item.image),
          sub: ["locksmith"],
        }
      )
    );
    sourceCount += 1;
  }
  for (const entry of item.npcRewards ?? []) {
    sources.body.append(
      makeRow(entry.npc.name, {
        aside: [`×${entry.quantity}`],
        icon: toIconUrl(entry.npc.image),
        sub: [`friendship level ${entry.level}`],
      })
    );
    sourceCount += 1;
  }
  for (const entry of item.rewardForQuests ?? []) {
    sources.body.append(
      makeRow(
        makeLink(
          questHref(entry.quest.id) ?? "#",
          entry.quest.name,
          TEXT_WHITE
        ),
        {
          aside: [
            `×${entry.quantity}`,
            makeOpenHere(open, { kind: "quest", name: entry.quest.name }),
          ],
          icon: toIconUrl(entry.quest.image),
          sub: ["quest reward"],
        }
      )
    );
    sourceCount += 1;
  }
  for (const entry of item.towerRewards ?? []) {
    sources.body.append(
      makeRow(`Tower floor ${entry.level}`, {
        aside: [`×${entry.itemQuantity.toLocaleString()}`],
        sub: ["tower"],
      })
    );
    sourceCount += 1;
  }
  for (const entry of item.skillLevelRewards ?? []) {
    sources.body.append(
      makeRow(`${entry.skill} level ${entry.level}`, {
        aside: [`×${entry.itemQuantity.toLocaleString()}`],
        sub: ["level reward"],
      })
    );
    sourceCount += 1;
  }
  for (const entry of item.exchangeCenterOutputs ?? []) {
    sources.body.append(
      makeRow(
        makeLink(
          itemHref(entry.inputItem.id) ?? "#",
          entry.inputItem.name,
          TEXT_WHITE
        ),
        {
          aside: [`${entry.inputQuantity} → ${entry.outputQuantity}`],
          icon: toIconUrl(entry.inputItem.image),
          sub: ["exchange center"],
        }
      )
    );
    sourceCount += 1;
  }
  if (sourceCount === 0) {
    sources.body.append(makeEmpty("No listed source."));
  }
  body.append(sources.card);

  // its recipe, with your counts against it
  if (item.recipeItems?.length) {
    const recipe = makeCard(item.canCook ? "Cooked from" : "Crafted from", {
      aside: plural(item.recipeItems.length, "ingredient"),
    });
    for (const entry of item.recipeItems) {
      const ingredientHave = haveOf(context, entry.item.name);
      recipe.body.append(
        makeRow(
          makeLink(itemHref(entry.item.id) ?? "#", entry.item.name, TEXT_WHITE),
          {
            aside: [
              ...makeCountAside(context, entry.item.name, entry.quantity),
              makeOpenHere(open, { kind: "item", name: entry.item.name }),
            ],
            icon: toIconUrl(entry.item.image),
            tone: ingredientHave >= entry.quantity ? "ok" : "warn",
          }
        )
      );
    }
    body.append(recipe.card);
  }

  // what it goes into
  if (item.recipeIngredientItems?.length) {
    const usedIn = makeCard("Used in", {
      aside: plural(item.recipeIngredientItems.length, "recipe"),
    });
    fillList(usedIn.body, item.recipeIngredientItems, (entry) =>
      makeRow(
        makeLink(itemHref(entry.item.id) ?? "#", entry.item.name, TEXT_WHITE),
        {
          aside: [
            `×${entry.quantity}`,
            makeOpenHere(open, { kind: "item", name: entry.item.name }),
          ],
          icon: toIconUrl(entry.item.image),
        }
      )
    );
    body.append(usedIn.card);
  }

  // the quests that want it, most demanding first
  if (item.requiredForQuests?.length) {
    const quests = [...item.requiredForQuests].sort(
      (a, b) => b.quantity - a.quantity
    );
    const total = quests.reduce((sum, entry) => sum + entry.quantity, 0);
    const needed = makeCard("Needed for quests", {
      aside: `${plural(
        quests.length,
        "quest"
      )} · ${total.toLocaleString()} total`,
    });
    fillList(needed.body, quests, (entry) =>
      makeRow(
        makeLink(
          questHref(entry.quest.id) ?? "#",
          entry.quest.name,
          TEXT_WHITE
        ),
        {
          aside: [
            `×${entry.quantity.toLocaleString()}`,
            makeOpenHere(open, { kind: "quest", name: entry.quest.name }),
          ],
          icon: toIconUrl(entry.quest.image),
          tone: have >= entry.quantity ? "ok" : undefined,
        }
      )
    );
    body.append(needed.card);
  }

  // who wants it as a gift
  if (item.npcItems?.length) {
    const snapshot = await orUndefined(townsfolkState.get());
    const links = snapshot?.links ?? [];
    const townsfolk = makeCard("Townsfolk");
    const order: Record<string, number> = { loves: 0, likes: 1, hates: 2 };
    const tone: Record<string, Tone> = {
      hates: "err",
      likes: "muted",
      loves: "accent",
    };
    const glyph: Record<string, string> = {
      hates: "✕",
      likes: "♡",
      loves: "♥",
    };
    const tagRow = document.createElement("div");
    tagRow.className = "fh-row-tags";
    for (const entry of [...item.npcItems].sort(
      (a, b) => order[a.relationship] - order[b.relationship]
    )) {
      const link = findTownsfolkLink(links, entry.npc.name);
      const tag = makeTag(
        `${glyph[entry.relationship]} ${entry.npc.name}`,
        tone[entry.relationship],
        link?.href
      );
      tag.title = `${entry.npc.name} ${entry.relationship} this`;
      tagRow.append(tag);
    }
    townsfolk.body.append(tagRow);
    body.append(townsfolk.card);
  }

  // what it can be traded for
  if (item.exchangeCenterInputs?.length) {
    const exchange = makeCard("Exchange center", {
      aside: plural(item.exchangeCenterInputs.length, "trade"),
    });
    fillList(exchange.body, item.exchangeCenterInputs, (entry) =>
      makeRow(
        makeLink(
          itemHref(entry.outputItem.id) ?? "#",
          entry.outputItem.name,
          TEXT_WHITE
        ),
        {
          aside: [
            `${entry.inputQuantity} → ${entry.outputQuantity}`,
            makeOpenHere(open, { kind: "item", name: entry.outputItem.name }),
          ],
          icon: toIconUrl(entry.outputItem.image),
          sub: [`last seen ${entry.lastSeen}`],
        }
      )
    );
    body.append(exchange.card);
  }
};

// ---------------------------------------------------------------------------
// Quest
// ---------------------------------------------------------------------------

const renderQuest = async (
  body: HTMLElement,
  context: Context,
  name: string,
  open: Open
): Promise<void> => {
  const quest = await orUndefined(questDataState.get({ query: name }));
  if (!quest) {
    body.append(makeEmpty(`buddy.farm has no page for “${name}”.`));
    return;
  }
  const sub: (string | Node)[] = [];
  if (quest.npc) {
    sub.push(quest.npc, " · ");
  }
  const href = questHref(quest.id);
  if (href) {
    sub.push(makeLink(href, "open quest ↗", "var(--fh-accent)"));
  }
  body.append(makeHeader(quest.image, quest.name, sub));

  const tags = document.createElement("div");
  tags.className = "fh-row-tags";
  tags.style.marginBottom = "8px";
  const levels: [string, number][] = [
    ["farming", quest.requiredFarmingLevel],
    ["fishing", quest.requiredFishingLevel],
    ["crafting", quest.requiredCraftingLevel],
    ["exploring", quest.requiredExploringLevel],
    ["cooking", quest.requiredCookingLevel],
    ["tower", quest.requiredTowerLevel],
  ];
  for (const [skill, level] of levels) {
    if (level > 0) {
      tags.append(makeTag(`${skill} ${level}`, "accent"));
    }
  }
  if (quest.endDate) {
    tags.append(makeTag(`ends ${quest.endDate}`, "warn"));
  }
  if (tags.childElementCount > 0) {
    body.append(tags);
  }
  if (quest.cleanDescription) {
    const description = document.createElement("div");
    description.className = "fh-empty";
    description.style.padding = "0 2px 8px";
    description.textContent = quest.cleanDescription;
    body.append(description);
  }

  const required = makeCard("Requires");
  let shortfalls = 0;
  for (const entry of quest.requiredItems ?? []) {
    const have = haveOf(context, entry.item.name);
    if (have < entry.quantity) {
      shortfalls += 1;
    }
    required.body.append(
      makeRow(entry.item.name, {
        aside: [
          ...makeCountAside(context, entry.item.name, entry.quantity),
          makeOpenHere(open, { kind: "item", name: entry.item.name }),
        ],
        icon: toIconUrl(entry.item.image),
        tone: have >= entry.quantity ? "ok" : "warn",
      })
    );
  }
  if (quest.requiredSilver > 0) {
    required.body.append(
      makeRow("Silver", { aside: [quest.requiredSilver.toLocaleString()] })
    );
  }
  if (required.body.childElementCount === 0) {
    required.body.append(makeEmpty("Nothing listed."));
  }
  const requiredHead = required.card.querySelector(".fh-card-head");
  if (requiredHead) {
    const aside = document.createElement("span");
    aside.className = "fh-card-aside";
    aside.textContent =
      shortfalls === 0 ? "you have it all" : `${shortfalls} short`;
    aside.style.color = shortfalls === 0 ? "var(--fh-ok)" : "var(--fh-warn)";
    requiredHead.append(aside);
  }
  body.append(required.card);

  const rewards = makeCard("Rewards");
  for (const entry of quest.rewardItems ?? []) {
    rewards.body.append(
      makeRow(entry.item.name, {
        aside: [
          `×${entry.quantity.toLocaleString()}`,
          makeOpenHere(open, { kind: "item", name: entry.item.name }),
        ],
        icon: toIconUrl(entry.item.image),
      })
    );
  }
  if (quest.rewardSilver > 0) {
    rewards.body.append(
      makeRow("Silver", { aside: [quest.rewardSilver.toLocaleString()] })
    );
  }
  if (quest.rewardGold > 0) {
    rewards.body.append(
      makeRow("Gold", { aside: [quest.rewardGold.toLocaleString()] })
    );
  }
  if (rewards.body.childElementCount === 0) {
    rewards.body.append(makeEmpty("Nothing listed."));
  }
  body.append(rewards.card);
};

// ---------------------------------------------------------------------------
// Townsperson
// ---------------------------------------------------------------------------

const renderTownsfolk = async (
  body: HTMLElement,
  context: Context,
  name: string,
  slug: string,
  open: Open
): Promise<void> => {
  const [npc, snapshot] = await Promise.all([
    orUndefined(townsfolkDataState.get({ query: slug })),
    orUndefined(townsfolkState.get()),
  ]);
  if (!npc) {
    body.append(makeEmpty(`buddy.farm has no page for “${name}”.`));
    return;
  }
  const link = findTownsfolkLink(snapshot?.links ?? [], npc.name);
  const sub: (string | Node)[] = [];
  if (link) {
    sub.push(makeLink(link.href, "open their page ↗", "var(--fh-accent)"));
  }
  body.append(makeHeader(npc.image, npc.name, sub));

  const groups: {
    relationship: NPCDetail["npcItems"][number]["relationship"];
    title: string;
  }[] = [
    { relationship: "loves", title: "Loves" },
    { relationship: "likes", title: "Likes" },
    { relationship: "hates", title: "Hates" },
  ];
  for (const group of groups) {
    const entries = npc.npcItems
      .filter((entry) => entry.relationship === group.relationship)
      // what you actually have to give, first
      .sort(
        (a, b) => haveOf(context, b.item.name) - haveOf(context, a.item.name)
      );
    if (entries.length === 0) {
      continue;
    }
    const inHand = entries.filter(
      (entry) => haveOf(context, entry.item.name) > 0
    ).length;
    const isHates = group.relationship === "hates";
    const card = makeCard(group.title, {
      aside: isHates ? String(entries.length) : `${inHand} in hand`,
      tone: group.relationship === "loves" ? "ok" : undefined,
    });
    fillList(card.body, entries, (entry) => {
      const have = haveOf(context, entry.item.name);
      let tone: Tone = "muted";
      if (isHates) {
        tone = "err";
      } else if (have > 0) {
        tone = "ok";
      }
      return makeRow(
        makeLink(itemHref(entry.item.id) ?? "#", entry.item.name, TEXT_WHITE),
        {
          aside: [
            ...makeCountAside(context, entry.item.name),
            makeOpenHere(open, { kind: "item", name: entry.item.name }),
          ],
          icon: toIconUrl(entry.item.image),
          tone,
        }
      );
    });
    body.append(card.card);
  }
  if (npc.quests?.length) {
    const quests = makeCard("Quests", { aside: String(npc.quests.length) });
    fillList(quests.body, npc.quests, (quest) =>
      makeRow(quest.name, {
        aside: [makeOpenHere(open, { kind: "quest", name: quest.name })],
        icon: toIconUrl(quest.image),
      })
    );
    body.append(quests.card);
  }
};

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

const renderLocation = async (
  body: HTMLElement,
  context: Context,
  name: string,
  focused: ReadonlySet<string>
): Promise<void> => {
  const location = await orUndefined(locationDataState.get({ query: name }));
  if (!location?.drops?.length) {
    body.append(makeEmpty(`buddy.farm has no drop table for “${name}”.`));
    return;
  }
  const image =
    context.here?.location.name === name ? context.here.image : undefined;
  renderLocationView(body, context, { image, location }, focused);
};

export const renderLookup = async (
  body: HTMLElement,
  context: Context,
  lookup: Lookup,
  focused: ReadonlySet<string>,
  open: Open
): Promise<void> => {
  switch (lookup.kind) {
    case "item": {
      await renderItem(body, context, lookup.name, open);
      break;
    }
    case "quest": {
      await renderQuest(body, context, lookup.name, open);
      break;
    }
    case "townsfolk": {
      await renderTownsfolk(body, context, lookup.name, lookup.slug, open);
      break;
    }
    default: {
      await renderLocation(body, context, lookup.name, focused);
    }
  }
};

export const lookupTitle = (lookup: Lookup): string => lookup.name;

// so an unused import doesn't trip the linter while Item is only used as a type

export { type Item } from "~/api/buddyfarm/types";
