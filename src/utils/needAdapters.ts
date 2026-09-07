import { Blocker } from "./craftworks";
import { Goal } from "./focus";
import { ItemNeed, Need } from "./needs";
import { TrackedGoal } from "./goals";

// Bridges from the two goal models onto `Need`, so the panel and the item page
// can move over one surface at a time. These go away once nothing reads
// `Goal` or `TrackedGoal` directly.

// A declared goal is its own undertaking: the player asked for this thing on
// purpose, and it competes with the others for the same shelf.
export const needFromTrackedGoal = (goal: TrackedGoal): ItemNeed => ({
  id: `declared:${goal.name}`,
  item: goal.name,
  kind: "item",
  label: goal.name,
  measure: goal.kind === "mastery" ? "acquire" : "hold",
  quantity: goal.quantity,
  source: goal.kind === "mastery" ? "mastery" : "declared",
});

export const needsFromTrackedGoals = (goals: TrackedGoal[]): Need[] =>
  goals.map((goal) => needFromTrackedGoal(goal));

// A derived goal becomes a group with one child per item it consumes.
//
// The group is what makes this different from `getGoalStatuses`: a quest that
// wants two items both made of Steel used to cost each against the full
// inventory and so claimed the same Steel twice. As children of one scope they
// share a pool and the quest's shortfall is what it would actually take.
// The id has to be STABLE across sessions, because focus is persisted against
// it. It was the goal's position in the list, which shifts the moment a request
// is finished -- focus would silently jump to a different quest. The label is
// what actually identifies the undertaking; `suffix` only exists to keep two
// identically-named ones apart.
export const needsFromGoal = (goal: Goal, suffix = ""): Need[] => {
  const id = `${goal.kind}:${goal.label}${suffix}`;
  const source = goal.kind === "quest" ? "quest" : "craftworks";
  const group: Need = {
    href: goal.href,
    id,
    kind: "group",
    label: goal.label,
    source,
  };
  return [
    group,
    ...goal.needs.map(
      (need): Need => ({
        href: goal.href,
        id: `${id}/${need.name}`,
        item: need.name,
        kind: "item",
        label: need.name,
        measure: "hold",
        parent: id,
        quantity: need.quantity,
        source,
      })
    ),
  ];
};

export const needsFromGoals = (goals: Goal[]): Need[] => {
  const seen = new Map<string, number>();
  return goals.flatMap((goal) => {
    const key = `${goal.kind}:${goal.label}`;
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return needsFromGoal(goal, count === 0 ? "" : `#${count}`);
  });
};

// Make one need the child of another: the composition the panel's "goalise"
// action performs. Returns a new list; the tree is only ever a parent id, so
// re-parenting is a field assignment and never a data migration.
export const composeNeed = (
  needs: Need[],
  childId: string,
  parentId: string | undefined
): Need[] =>
  needs.map((need) =>
    need.id === childId ? { ...need, parent: parentId } : need
  );

// A Craftworks slot stalled on something nothing else in the queue makes.
//
// The queue reports what a slot is waiting for but never how many, so this is
// deliberately a need for one: enough to say "the queue is stuck on this and
// going out for it unsticks it", which is the whole claim the data supports.
export const needFromBlocker = (blocker: Blocker): Need => ({
  id: `craftworks:${blocker.name}`,
  item: blocker.name,
  kind: "item",
  label:
    blocker.slots.length > 0
      ? `Craftworks: ${blocker.slots.length} slot${
          blocker.slots.length === 1 ? "" : "s"
        } stalled`
      : "Craftworks",
  measure: "hold",
  quantity: 1,
  source: "craftworks",
});

// Every demand on the player, from every source, as one list.
//
// This is the single entry point the surfaces should use: the item page, the
// panel and the location advisor all asking the same question of the same data
// is the point of the model.
export const buildNeeds = ({
  craftworksRoots = [],
  questGoals = [],
  trackedGoals = [],
}: {
  craftworksRoots?: Blocker[];
  questGoals?: Goal[];
  trackedGoals?: TrackedGoal[];
}): Need[] => [
  ...needsFromTrackedGoals(trackedGoals),
  ...needsFromGoals(questGoals),
  ...craftworksRoots.map((blocker) => needFromBlocker(blocker)),
];
