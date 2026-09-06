import {
  adviseOnSlots,
  parseMaxSlots,
  planCraftworksQueue,
  Slot,
} from "./craftworks";
import { getGoalStatuses, getNearlyDone, Goal, rankBottlenecks } from "./focus";
import {
  getMaxCraftable,
  planCraft,
  planSourcing,
  RecipeGraph,
  RecipeNode,
} from "./craftPlanner";
import { Item } from "~/api/buddyfarm/types";

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
    "locations by hits",
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

if (failures > 0) {
  throw new Error(`${failures} check(s) failed`);
}
console.info("\nAll craft planner checks passed");
