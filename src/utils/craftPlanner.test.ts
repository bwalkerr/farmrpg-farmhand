import {
  adviseOnSlots,
  parseMaxSlots,
  planCraftworksQueue,
  Slot,
  suggestQueueChanges,
} from "./craftworks";
import {
  findLocationSet,
  getLocationAdvice,
  matchLocationByImage,
  parseStamina,
} from "./locationAdvice";
import {
  getFrozenMastery,
  getMasterySuggestions,
  getQuestSuggestions,
  getRecommendedSet,
  getSetSuggestions,
  matchSetNameToItem,
} from "./suggestions";
import { getGoalProgress } from "./goals";
import {
  getGoalStatuses,
  getNearlyDone,
  Goal,
  mergeMissing,
  rankBottlenecks,
} from "./focus";
import {
  getMaxCraftable,
  planCraft,
  planSourcing,
  RecipeGraph,
  RecipeNode,
} from "./craftPlanner";
import { Item } from "~/api/buddyfarm/types";
import { MasteryEntry } from "~/api/farmrpg/apis/mastery";
import { parseUnlimitedItems } from "./unlimited";

let failures = 0;

const check = (label: string, actual: unknown, expected: unknown): void => {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    console.info(`  ok   ${label}`);
    return;
  }
  failures += 1;
  console.error(`  FAIL ${label}\n       expected ${b}\n       actual   ${a}`);
};

interface Fixture {
  canCraft?: boolean;
  drops?: { location: string; rate: number; type?: "explore" | "fishing" }[];
  ingredients?: [string, number][];
}

const makeGraph = (fixtures: Record<string, Fixture>): RecipeGraph => {
  const nodes = new Map<string, RecipeNode>();
  for (const [name, fixture] of Object.entries(fixtures)) {
    const item = {
      canCraft: fixture.canCraft ?? (fixture.ingredients?.length ?? 0) > 0,
      craftingLevel: 1,
      dropRatesItems: (fixture.drops ?? []).map((drop) => ({
        dropRates: {
          ironDepot: false,
          location: {
            baseDropRate: 0.3,
            image: "",
            name: drop.location,
            type: drop.type ?? "explore",
          },
          manualFishing: null,
          runecube: false,
          seed: null,
        },
        rate: drop.rate,
      })),
      id: 0,
      image: "",
      name,
      recipeItems: (fixture.ingredients ?? []).map(
        ([ingredient, quantity]) => ({
          item: { name: ingredient },
          quantity,
        })
      ),
    } as unknown as Item;
    nodes.set(name, {
      canCraft: item.canCraft,
      craftingLevel: 1,
      id: 0,
      image: "",
      ingredients: (fixture.ingredients ?? []).map(([n, q]) => ({
        name: n,
        quantity: q,
      })),
      item,
      name,
    });
  }
  return { nodes, truncated: false, unknown: new Set() };
};

// Reed's real Craftworks chain, recipes as buddy.farm reports them:
//   Glass Orb            <- Shimmer Stone x2, Stone x1
//   Shimmer Stone        <- Unpolished Shimmer Stone x2
//   Unpolished Shimmer   <- Emberstone x1, Sandstone x1   (also drops)
const glassOrb = makeGraph({
  Emberstone: { drops: [{ location: "Mount Banon", rate: 20 }] },
  "Glass Orb": {
    ingredients: [
      ["Shimmer Stone", 2],
      ["Stone", 1],
    ],
  },
  Sandstone: { drops: [{ location: "Mount Banon", rate: 5 }] },
  "Shimmer Stone": { ingredients: [["Unpolished Shimmer Stone", 2]] },
  Stone: { drops: [{ location: "Small Cave", rate: 2 }] },
  "Unpolished Shimmer Stone": {
    drops: [{ location: "Mount Banon", rate: 10.7 }],
    ingredients: [
      ["Emberstone", 1],
      ["Sandstone", 1],
    ],
  },
});

console.info("planCraft: full expansion from an empty inventory");
{
  const plan = planCraft(glassOrb, "Glass Orb", 1, {});
  // 1 orb -> 2 shimmer -> 4 unpolished -> 4 emberstone + 4 sandstone, + 1 stone
  check(
    "missing",
    plan.missing,
    [
      { name: "Emberstone", quantity: 4 },
      { name: "Sandstone", quantity: 4 },
      { name: "Stone", quantity: 1 },
    ].sort((a, b) => b.quantity - a.quantity)
  );
  check(
    "steps deepest first",
    plan.steps.map((step) => `${step.quantity}x${step.name}`),
    ["4xUnpolished Shimmer Stone", "2xShimmer Stone", "1xGlass Orb"]
  );
}

console.info("planCraft: spends what's on hand before making more");
{
  // 3 shimmer stones on hand covers 1 orb's 2 outright, so nothing deeper runs
  const plan = planCraft(glassOrb, "Glass Orb", 1, {
    "Shimmer Stone": 3,
    Stone: 5,
  });
  check("nothing missing", plan.missing, []);
  check("spent from inventory", plan.spend, { "Shimmer Stone": 2, Stone: 1 });
  check("no sub-crafts needed", plan.steps.length, 1);
}

console.info("planCraft: a shared ingredient is not counted twice");
{
  const shared = makeGraph({
    Bolt: { drops: [{ location: "Forest", rate: 3 }] },
    Widget: {
      ingredients: [
        ["Left", 1],
        ["Right", 1],
      ],
    },
    Left: { ingredients: [["Bolt", 2]] },
    Right: { ingredients: [["Bolt", 2]] },
  });
  // 4 bolts needed, 3 held -> exactly 1 short, not 2 (which is what you get if
  // both branches each see the full 3)
  const plan = planCraft(shared, "Widget", 1, { Bolt: 3 });
  check("short by one", plan.missing, [{ name: "Bolt", quantity: 1 }]);
  check("spent all three", plan.spend, { Bolt: 3 });
}

console.info("planCraft: a recipe cycle terminates");
{
  const cyclic = makeGraph({
    A: { ingredients: [["B", 1]] },
    B: { ingredients: [["A", 1]] },
  });
  const plan = planCraft(cyclic, "A", 1, {});
  check("flagged truncated", plan.truncated, true);
  check("reports the cycle point as missing", plan.missing, [
    { name: "A", quantity: 1 },
  ]);
}

console.info("planCraft: the target is always crafted in full");
{
  // holding 10 orbs already should not reduce a request to craft 2 more
  const plan = planCraft(glassOrb, "Glass Orb", 2, { "Glass Orb": 10 });
  check("target not spent from inventory", plan.spend["Glass Orb"], undefined);
  check("still plans 2", plan.steps.map((step) => step.quantity).at(-1), 2);
}

console.info("getMaxCraftable");
{
  check("none from nothing", getMaxCraftable(glassOrb, "Glass Orb", {}), 0);
  // 4 unpolished + 1 stone is exactly one orb
  check(
    "exactly one",
    getMaxCraftable(glassOrb, "Glass Orb", {
      "Unpolished Shimmer Stone": 4,
      Stone: 1,
    }),
    1
  );
  check(
    "three",
    getMaxCraftable(glassOrb, "Glass Orb", {
      "Unpolished Shimmer Stone": 13,
      Stone: 3,
    }),
    3
  );
}

console.info("planSourcing: rolls missing items up by location");
{
  const plan = planCraft(glassOrb, "Glass Orb", 1, {});
  const sourcing = planSourcing(glassOrb, plan.missing);
  check(
    "locations by needs covered",
    sourcing.locations.map((entry) => [
      entry.location,
      Math.round(entry.hits * 10) / 10,
    ]),
    [
      // 4 Emberstone x20 + 4 Sandstone x5 = 100 explores at Mount Banon
      ["Mount Banon", 100],
      // 1 Stone x2
      ["Small Cave", 2],
    ]
  );

  // the ordering that matters: a cheap one-item trip must not outrank a
  // pricier trip that clears three shortfalls
  const spread = makeGraph({
    Hub: { drops: [{ location: "Busy Place", rate: 30 }] },
    HubTwo: { drops: [{ location: "Busy Place", rate: 30 }] },
    HubThree: { drops: [{ location: "Busy Place", rate: 30 }] },
    Lonely: { drops: [{ location: "Quiet Place", rate: 1 }] },
  });
  check(
    "three needs at 90 explores beat one need at 1",
    planSourcing(spread, [
      { name: "Lonely", quantity: 1 },
      { name: "Hub", quantity: 1 },
      { name: "HubTwo", quantity: 1 },
      { name: "HubThree", quantity: 1 },
    ]).locations.map((entry) => [entry.location, entry.items.length]),
    [
      ["Busy Place", 3],
      ["Quiet Place", 1],
    ]
  );
  check(
    "ties break toward the cheaper trip",
    planSourcing(
      makeGraph({
        Far: { drops: [{ location: "Far Place", rate: 50 }] },
        Near: { drops: [{ location: "Near Place", rate: 2 }] },
      }),
      [
        { name: "Far", quantity: 1 },
        { name: "Near", quantity: 1 },
      ]
    ).locations.map((entry) => entry.location),
    ["Near Place", "Far Place"]
  );
  check("nothing unsourced", sourcing.unsourced, []);
}

console.info("adviseOnSlots: Reed's real Craftworks queue (cap 1032)");
{
  const slot = (
    position: number,
    name: string,
    inventory: number,
    blockedOn: string[] = [],
    isPaused = false
  ): Slot => ({
    blockedOn: blockedOn.map((blocker) => ({ id: "", name: blocker })),
    id: String(position),
    inventory,
    isCapRed: inventory >= 1032,
    isPaused,
    name,
    position,
  });
  const slots = [
    slot(1, "Twine", 1032),
    slot(2, "Iron Ring", 1032),
    slot(3, "Mushroom Paste", 0, ["Mushroom"]),
    slot(4, "Shimmer Stone", 1, ["Unpolished Shimmer Stone"]),
    slot(5, "Glass Orb", 627, ["Shimmer Stone"]),
    slot(6, "Steel", 1032, ["Carbon Sphere"], true),
    slot(7, "Steel Wire", 215, ["Carbon Sphere"]),
  ];
  const advice = adviseOnSlots(slots, 1032);
  check(
    "dead slots are the at-cap ones",
    advice.dead.map((entry) => entry.name),
    ["Twine", "Iron Ring", "Steel"]
  );
  check("nothing is actually producing", advice.working.length, 0);
  check("every blocker the game reported", [...advice.blockers.keys()].sort(), [
    "Carbon Sphere",
    "Mushroom",
    "Shimmer Stone",
    "Unpolished Shimmer Stone",
  ]);
  // Shimmer Stone is made by #4, which sits above the #5 that wants it, so it
  // resolves itself; the other three are what the queue is really waiting on.
  // Carbon Sphere counts as a root even though #6 Steel is in the queue,
  // because #6 is at cap and paused and so will never deliver.
  check(
    "root blockers are the ones to go get",
    advice.roots.map((blocker) => blocker.name).sort(),
    ["Carbon Sphere", "Mushroom", "Unpolished Shimmer Stone"]
  );
  check(
    "upstream blockers clear on their own",
    advice.upstream.map((blocker) => blocker.name),
    ["Shimmer Stone"]
  );
  // Shimmer Stone (#4) is above Glass Orb (#5), which is the right way round
  check("no ordering complaints", advice.ordering.length, 0);
}

console.info("adviseOnSlots: catches a producer sitting below its consumer");
{
  const slots: Slot[] = [
    {
      blockedOn: [{ id: "", name: "Shimmer Stone" }],
      id: "1",
      inventory: 0,
      isCapRed: false,
      isPaused: false,
      name: "Glass Orb",
      position: 1,
    },
    {
      blockedOn: [],
      id: "2",
      inventory: 0,
      isCapRed: false,
      isPaused: false,
      name: "Shimmer Stone",
      position: 2,
    },
  ];
  const advice = adviseOnSlots(slots, 1032);
  check("one ordering problem", advice.ordering.length, 1);
  check(
    "names the producer",
    advice.ordering[0]?.producer.name,
    "Shimmer Stone"
  );
}

console.info(
  "planCraftworksQueue: producers above consumers, cap-blocked dropped"
);
{
  const plan = planCraft(glassOrb, "Glass Orb", 1, {});
  const queue = planCraftworksQueue(plan, {}, 1032, 8);
  check(
    "ordered deepest first",
    queue.entries.map((entry) => `${entry.position}.${entry.name}`),
    ["1.Unpolished Shimmer Stone", "2.Shimmer Stone", "3.Glass Orb"]
  );
  check("target included", queue.targetOmitted, false);

  // an at-cap item would sit in a slot and never craft
  const capped = planCraftworksQueue(plan, { "Shimmer Stone": 1032 }, 1032, 8);
  check("at-cap item dropped", capped.dropped, [
    { name: "Shimmer Stone", reason: "already at cap" },
  ]);

  // with too few slots the shallow end goes, because the deep items are what
  // unblock everything above them
  const tight = planCraftworksQueue(plan, {}, 1032, 2);
  check(
    "kept the deep end",
    tight.entries.map((entry) => entry.name),
    ["Unpolished Shimmer Stone", "Shimmer Stone"]
  );
  check("flags the missing target", tight.targetOmitted, true);
  check("says why it was cut", tight.dropped, [
    { name: "Glass Orb", reason: "no free slot" },
  ]);
}

console.info("focus: goal statuses and bottleneck ranking");
{
  const goals: Goal[] = [
    {
      kind: "quest",
      label: "Orb Delivery",
      needs: [{ name: "Glass Orb", quantity: 2 }],
    },
    {
      kind: "quest",
      label: "Stone Collection",
      needs: [{ name: "Stone", quantity: 5 }],
    },
    {
      kind: "quest",
      label: "Ember Errand",
      needs: [{ name: "Emberstone", quantity: 3 }],
    },
  ];
  // holds every stone it needs, so Stone Collection is done; the other two are
  // short, and Emberstone is wanted by both of them
  const inventory = { Stone: 50, Emberstone: 1 };
  const statuses = getGoalStatuses(glassOrb, goals, inventory);
  check(
    "ready goals",
    statuses.filter((entry) => entry.isReady).map((entry) => entry.goal.label),
    ["Stone Collection"]
  );
  // 2 orbs -> 4 shimmer -> 8 unpolished -> 8 emberstone + 8 sandstone, less the
  // 1 emberstone on hand
  check("orb shortfall", statuses[0].missing, [
    { name: "Sandstone", quantity: 8 },
    { name: "Emberstone", quantity: 7 },
  ]);
  check("Ember Errand is one item away", getNearlyDone(statuses).length, 1);

  const bottlenecks = rankBottlenecks(statuses);
  check(
    "Emberstone gates the most",
    bottlenecks.map((entry) => [entry.name, entry.goalsGated, entry.maxNeeded]),
    [
      ["Emberstone", 2, 7],
      ["Sandstone", 1, 8],
    ]
  );
}

console.info("parseMaxSlots: the upgrade card must not win");
{
  // both sentences appear on the real page, in this order
  const pageText = [
    "Your Patreon subscription grants you 2 extra items to Craftworks.",
    "You can add up to 8 items total to the Craftworks.",
    "You can add up to 6 items to the Craftworks (Excluding Patreon extra slots).",
    "The cost to increase this is 300 Gold.",
  ].join(" ");
  check(
    "takes the real cap, not the base allowance",
    parseMaxSlots(pageText),
    8
  );
  check("no match is undefined", parseMaxSlots("nothing here"), undefined);
}

console.info("mergeMissing: overlapping asks are one trip, not two");
{
  check(
    "takes the larger ask, never the sum",
    mergeMissing(
      [
        { name: "Steel", quantity: 40 },
        { name: "Mushroom", quantity: 3 },
      ],
      [
        { name: "Steel", quantity: 12 },
        { name: "Carbon Sphere", quantity: 5 },
      ]
    ),
    [
      { name: "Steel", quantity: 40 },
      { name: "Carbon Sphere", quantity: 5 },
      { name: "Mushroom", quantity: 3 },
    ]
  );
  check("empty in, empty out", mergeMissing([], []), []);
}

console.info("unlimited items are never a shortfall");
{
  // Reed's perk auto-buys Iron and Nails
  const unlimited = parseUnlimitedItems("iron, Nails");
  const gadget = makeGraph({
    Iron: { drops: [{ location: "Small Cave", rate: 4 }] },
    Nails: {},
    Rivet: { drops: [{ location: "Small Cave", rate: 9 }] },
    Gadget: {
      ingredients: [
        ["Iron", 10],
        ["Nails", 4],
        ["Rivet", 2],
      ],
    },
  });
  const plan = planCraft(gadget, "Gadget", 1, {}, unlimited);
  check("only the real shortfall is reported", plan.missing, [
    { name: "Rivet", quantity: 2 },
  ]);
  check(
    "and no trip is planned for them",
    planSourcing(gadget, plan.missing).locations.map((entry) => [
      entry.location,
      entry.items.map((item) => item.name),
    ]),
    [["Small Cave", ["Rivet"]]]
  );
  // without the perk the same craft is short of all three
  check(
    "still counted when the perk is off",
    planCraft(gadget, "Gadget", 1, {}).missing.length,
    3
  );
  check(
    "max craftable ignores the auto-bought parts",
    getMaxCraftable(gadget, "Gadget", { Rivet: 6 }, unlimited),
    3
  );
}

console.info("adviseOnSlots: an auto-bought blocker is not a trip");
{
  const slots: Slot[] = [
    {
      blockedOn: [
        { id: "", name: "Iron" },
        { id: "", name: "Carbon Sphere" },
      ],
      id: "1",
      inventory: 5,
      isCapRed: false,
      isPaused: false,
      name: "Steel Wire",
      position: 1,
    },
  ];
  const advice = adviseOnSlots(slots, 1032, parseUnlimitedItems("Iron"));
  check(
    "only the real blocker is a root",
    advice.roots.map((entry) => entry.name),
    ["Carbon Sphere"]
  );
  check(
    "the auto-bought one is set aside",
    advice.supplied.map((entry) => entry.name),
    ["Iron"]
  );
}

console.info("suggestQueueChanges");
{
  const slots: Slot[] = [
    {
      blockedOn: [],
      id: "1",
      inventory: 1032,
      isCapRed: true,
      isPaused: false,
      name: "Twine",
      position: 1,
    },
  ];
  const desired = [
    { name: "Unpolished Shimmer Stone", quantity: 4 },
    { name: "Shimmer Stone", quantity: 2 },
    { name: "Glass Orb", quantity: 1 },
  ];
  const suggestions = suggestQueueChanges(desired, slots, {}, 1032, 2);
  check(
    "drops the dead slot and fills the room that frees",
    suggestions.map((entry) => `${entry.action}:${entry.name}`),
    ["drop:Twine", "add:Unpolished Shimmer Stone", "add:Shimmer Stone"]
  );
  check(
    "additions keep the deepest-first order",
    suggestions
      .filter((entry) => entry.action === "add")
      .map((entry) => entry.position),
    [1, 2]
  );
  check(
    "an already-queued item is not suggested again",
    suggestQueueChanges(
      [{ name: "Twine", quantity: 5 }],
      slots,
      {},
      1032,
      8
    ).filter((entry) => entry.action === "add").length,
    0
  );
}

console.info("mastery suggestions: Reed's real mastery page, cap 1032");
{
  const entry = (
    name: string,
    value: number,
    required: number
  ): MasteryEntry => ({
    name,
    remaining: required - value,
    required,
    tier: "t2",
    value,
  });
  // taken from the live page: Twine is a hair from tier V but sits at the cap
  const entries = [
    entry("Cave Paste", 99, 100),
    entry("Twine", 93_093, 100_000),
    entry("Sunflower Oil", 9, 10),
    entry("Iron Ring", 160_964, 1_000_000),
  ];
  const inventory = { "Iron Ring": 1032, Twine: 1032 };

  // Twine is 93% done and Iron Ring 16%, but Twine needs 6,907 more and Iron
  // Ring 839,036 — ranking on percentage would put Twine behind Cave Paste's
  // single remaining unit, which is the wrong advice
  check(
    "ranked by units left, not percentage",
    getMasterySuggestions(entries, inventory, 1032, []).map(
      (suggestion) => suggestion.name
    ),
    ["Cave Paste", "Sunflower Oil", "Twine", "Iron Ring"]
  );
  check(
    "capped items are flagged frozen",
    getMasterySuggestions(entries, inventory, 1032, [])
      .filter((suggestion) => suggestion.isFrozen)
      .map((suggestion) => suggestion.name),
    ["Twine", "Iron Ring"]
  );
  check(
    "already-tracked items are not suggested again",
    getMasterySuggestions(entries, inventory, 1032, [
      { addedAt: 0, name: "Cave Paste", quantity: 1 },
    ]).some((suggestion) => suggestion.name === "Cave Paste"),
    false
  );
  check(
    "frozen mastery is the at-cap intersection, nearest first",
    getFrozenMastery(entries, inventory, 1032).map((item) => item.name),
    ["Twine", "Iron Ring"]
  );
  check(
    "without a known cap nothing is called frozen",
    getFrozenMastery(entries, inventory, undefined).length,
    0
  );
}

console.info("quest suggestions ask for the shortfall, not the requirement");
{
  const questGoals: Goal[] = [
    {
      kind: "quest",
      label: "Green Alchemy XIII",
      needs: [{ name: "Emerald", quantity: 500 }],
    },
    {
      kind: "quest",
      label: "Gem Hunt",
      needs: [{ name: "Emerald", quantity: 900 }],
    },
    {
      kind: "quest",
      label: "Covered Already",
      needs: [{ name: "Wood", quantity: 5 }],
    },
  ];
  const suggestions = getQuestSuggestions(
    questGoals,
    { Emerald: 200, Wood: 50 },
    []
  );
  check(
    "covered requests drop out, and the larger ask wins",
    suggestions.map((entry) => [entry.name, entry.quantity]),
    [["Emerald", 700]]
  );
}

console.info("saved set names: Reed's real 12 sets");
{
  // every item name the sets could plausibly refer to
  const items = [
    "Explosive",
    "Fancy Guitar",
    "Fancy Pipe",
    "Fancy Table",
    "Pickaxe",
    "Lantern",
    "Glass Orb",
  ];
  check(
    "exact match",
    matchSetNameToItem("Fancy Guitar", items),
    "Fancy Guitar"
  );
  // players are casual about capitalisation
  check(
    "case-insensitive",
    matchSetNameToItem("Fancy table", items),
    "Fancy Table"
  );
  // a trailing qualifier still resolves to the thing being built
  check(
    "trailing qualifier stripped",
    matchSetNameToItem("Lantern prereqs", items),
    "Lantern"
  );
  // location loadouts are not goals
  check(
    "location sets do not resolve",
    matchSetNameToItem("Explore - Mount Banon", items),
    undefined
  );
  check(
    "nor do descriptive ones",
    matchSetNameToItem("Exploration - Misty Forest - Dyes", items),
    undefined
  );

  const sets = [
    { isActive: false, name: "Explore - Mount Banon" },
    { isActive: false, name: "Fancy Pipe" },
    { isActive: true, name: "Fancy Guitar" },
    { isActive: false, name: "Lantern prereqs" },
    { isActive: false, name: "Misty Forest" },
  ];
  const suggestions = getSetSuggestions(sets, items, [], {});
  check(
    "only item-named sets, active one first",
    suggestions.map((entry) => entry.name),
    ["Fancy Guitar", "Fancy Pipe", "Lantern"]
  );
  check(
    "the active set says so",
    suggestions[0].reason.includes("active set"),
    true
  );
  check(
    "already-tracked goals are skipped",
    getSetSuggestions(
      sets,
      items,
      [{ addedAt: 0, name: "Fancy Guitar", quantity: 1 }],
      {}
    ).map((entry) => entry.name),
    ["Fancy Pipe", "Lantern"]
  );
}

console.info("getRecommendedSet");
{
  const items = ["Fancy Guitar", "Fancy Table", "Lantern"];
  const sets = [
    { id: "341449", isActive: true, name: "Fancy Guitar" },
    { id: "341447", isActive: false, name: "Fancy table" },
    { id: "336011", isActive: false, name: "explore - highland hills" },
  ];
  check(
    "a goal picks the set named after it",
    getRecommendedSet(
      [{ addedAt: 0, name: "Fancy Table", quantity: 1 }],
      sets,
      items
    ),
    { goalName: "Fancy Table", id: "341447", name: "Fancy table" }
  );
  // recommending the loaded set would be advice to re-run a destructive
  // activation for no change
  check(
    "the active set is never recommended",
    getRecommendedSet(
      [{ addedAt: 0, name: "Fancy Guitar", quantity: 1 }],
      sets,
      items
    ),
    undefined
  );
  check(
    "no goal, no recommendation",
    getRecommendedSet([], sets, items),
    undefined
  );
}

console.info("location advisor: Mount Banon, cap 1044");
{
  const locations = [
    { image: "/img/items/mountain.png", name: "Mount Banon" },
    { image: "/img/items/desert.png", name: "Jundland Desert" },
    // pond.png belongs to two places, so it identifies neither
    { image: "/img/items/pond.png", name: "Small Pond" },
    { image: "/img/items/pond.png", name: "Farm Pond" },
  ];
  check(
    "identified from the header picture",
    matchLocationByImage("/img/items/mountain.png", locations),
    "Mount Banon"
  );
  check(
    "an ambiguous picture identifies nothing",
    matchLocationByImage("/img/items/pond.png", locations),
    undefined
  );
  check(
    "an unknown picture identifies nothing",
    matchLocationByImage("/img/items/tractor.png", locations),
    undefined
  );

  // the left figure is banked stamina and runs well past the natural maximum
  check(
    "stamina is the left figure",
    parseStamina("23,034 / 85 Stamina"),
    23_034
  );
  check("no stamina text, no number", parseStamina("644 left"), undefined);

  const drops = [
    { id: 144, name: "Carbon Sphere", rate: 47.7 },
    { id: 76, name: "Unpolished Shimmer Stone", rate: 13.8 },
    { id: 163, name: "Twine", rate: 30 },
    { id: 21, name: "Board", rate: 5 },
  ];
  const advice = getLocationAdvice(
    drops,
    [
      { name: "Carbon Sphere", quantity: 2 },
      { name: "Unpolished Shimmer Stone", quantity: 4 },
      // does not drop here, so it is not this location's business
      { name: "Mushroom", quantity: 9 },
    ],
    new Map([["Carbon Sphere", ["blocks Steel Wire"]]]),
    { Twine: 1044, Board: 10 },
    1044,
    [
      {
        name: "Twine",
        remaining: 6907,
        required: 100_000,
        tier: "t4",
        value: 93_093,
      },
    ]
  );
  // 4 x 13.8 = 55.2 beats 2 x 47.7 = 95.4, so the cheaper finish leads
  check(
    "needs sorted by what it costs to finish them",
    advice.needed.map((entry) => entry.name),
    ["Unpolished Shimmer Stone", "Carbon Sphere"]
  );
  check("reasons carried through", advice.needed[1].reasons, [
    "blocks Steel Wire",
  ]);
  // Twine is at cap and drops here, so every Twine drop is discarded -- and
  // its mastery is stalled as a result
  check(
    "at-cap drops here are flagged as waste",
    advice.wasted.map((entry) => [entry.name, entry.masteryRemaining]),
    [["Twine", 6907]]
  );
  check(
    "Board is below cap, so not waste",
    advice.wasted.some((entry) => entry.name === "Board"),
    false
  );

  const sets = [
    { isActive: false, name: "Explore - Mount Banon" },
    { isActive: false, name: "Misty Forest" },
  ];
  const allNames = ["Mount Banon", "Misty Forest", "Forest", "Ember Lagoon"];
  check(
    "the location's own set is found by name",
    findLocationSet("Mount Banon", sets, allNames)?.name,
    "Explore - Mount Banon"
  );
  check(
    "no set for a location without one",
    findLocationSet("Forest", sets, allNames),
    undefined
  );
}

console.info("a mastery goal is measured by acquisition, not by the shelf");
{
  // Cave Paste: 99 of 100 toward the tier, and 99 already on the shelf
  const mastery = [
    { name: "Cave Paste", remaining: 1, required: 100, value: 99 },
  ];
  const graph = makeGraph({
    "Cave Paste": { drops: [{ location: "Small Cave", rate: 3 }] },
  });
  const goal = {
    addedAt: 0,
    kind: "mastery" as const,
    name: "Cave Paste",
    quantity: 1,
  };
  const progress = getGoalProgress(
    graph,
    goal,
    { "Cave Paste": 99 },
    undefined,
    mastery
  );
  // holding 99 says nothing about the tier: one more still has to be acquired
  check(
    "not finished just because the shelf is full",
    progress.ratio < 1,
    true
  );
  check("progress is the mastery figure", progress.have, 99);
  check(
    "still short of the last one",
    progress.missing.map((entry) => `${entry.quantity}x${entry.name}`),
    ["1xCave Paste"]
  );

  // the same goal without the mastery flag is a plain "hold N", and 99 >= 1
  const plain = getGoalProgress(
    graph,
    { addedAt: 0, name: "Cave Paste", quantity: 1 },
    { "Cave Paste": 99 }
  );
  check("a plain goal for 1 is satisfied by 99 on hand", plain.ratio, 1);
}

if (failures > 0) {
  throw new Error(`${failures} check(s) failed`);
}
console.info("\nAll craft planner checks passed");
