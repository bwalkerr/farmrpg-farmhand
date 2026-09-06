import { Item } from "./types";
import { itemDataState } from "./api";
import { MAX_DEPTH, RecipeGraph, RecipeNode } from "~/utils/craftPlanner";

// Walking the graph is kept apart from planning against it on purpose: the
// planner is pure arithmetic and unit-testable with no DOM and no network,
// while this half is the only piece that talks to buddy.farm.
const MAX_NODES = 250;

const toNode = (item: Item): RecipeNode => ({
  canCraft: item.canCraft,
  craftingLevel: item.craftingLevel,
  id: item.id,
  image: item.image,
  ingredients: (item.recipeItems ?? []).map((entry) => ({
    name: entry.item.name,
    quantity: entry.quantity,
  })),
  item,
  name: item.name,
});

// Walk the recipe tree from `roots` down to items with no recipe, fetching each
// item's buddy.farm page exactly once. Breadth-first and batched so a deep tree
// costs one round of parallel requests per level rather than one per node. Item
// data is cached in GM storage for a week, so this is nearly free after the
// first walk.
export const gatherRecipeGraph = async (
  roots: string[]
): Promise<RecipeGraph> => {
  const nodes = new Map<string, RecipeNode>();
  const unknown = new Set<string>();
  let truncated = false;
  let frontier = [...new Set(roots)];

  for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
    const batch = frontier.filter(
      (name) => !nodes.has(name) && !unknown.has(name)
    );
    if (batch.length === 0) {
      break;
    }
    if (nodes.size + batch.length > MAX_NODES) {
      truncated = true;
      break;
    }
    const items = await Promise.all(
      batch.map(async (name) => {
        try {
          return await itemDataState.get({ query: name });
        } catch {}
      })
    );
    const next: string[] = [];
    for (const [index, item] of items.entries()) {
      const name = batch[index];
      if (!item) {
        unknown.add(name);
        continue;
      }
      const node = toNode(item);
      // key by the name we asked for as well as the canonical one, so lookups
      // by either spelling hit (buddy.farm renames a few, see NAME_OVERRIDES)
      nodes.set(name, node);
      nodes.set(node.name, node);
      if (node.canCraft) {
        next.push(...node.ingredients.map((entry) => entry.name));
      }
    }
    frontier = next;
  }
  if (frontier.length > 0) {
    truncated = true;
  }
  return { nodes, unknown, truncated };
};
