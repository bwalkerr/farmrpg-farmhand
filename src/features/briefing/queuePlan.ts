import { Context, MissingItem } from "./shared";
import { getDesiredQueueForNeeds } from "~/utils/needs";
import {
  makeHeading,
  makeItemLink,
  makeLinkedLine,
  makeMutedText,
} from "~/utils/gameLinks";
import { planCraftworksQueue, QueueProposal } from "~/utils/craftworks";
import { RecipeGraph } from "~/utils/craftPlanner";
import { saveSet } from "~/api/farmrpg/apis/craftworks";
import {
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
} from "~/utils/theme";

// The Craftworks queue the panel would build for what you are doing, as a
// list you can compare with the live queue and save as a set in one go.
//
// Two scopes, both from the same costed demand (getDesiredQueueForNeeds):
// - the undertakings you have focused (or everything, with no focus), and
// - when you are standing at an explore or fishing spot, only the part of
//   that whose craft chain uses something that drops here -- "what should the
//   queue be while I'm at Mount Banon".
//
// Saving is the game's own share-page action (one request, the live queue is
// untouched); loading the saved set afterwards is the existing confirmed,
// restorable set loader. Neither adds items to the queue for you.

export interface QueuePlan extends QueueProposal {
  // what the plan is for, e.g. "Runestone 12" or "at Mount Banon"
  label: string;
  // what the saved set would be called
  setName: string;
}

// The game's set-name field is short; keep the prefix so the panel's own sets
// are recognisable in "My Item Sets" and can be told from Reed's loadouts.
const SET_NAME_LIMIT = 32;
const SET_NAME_PREFIX = "Plan: ";

export const toSetName = (label: string): string =>
  `${SET_NAME_PREFIX}${label}`
    .replaceAll(/[^\s\w':-]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim()
    .slice(0, SET_NAME_LIMIT)
    .trim();

const describeScope = (
  context: Context,
  focused: ReadonlySet<string>
): string => {
  const labels = context.resolved.scopes
    .filter((scope) => focused.has(scope.rootId))
    .map((scope) => scope.label);
  if (labels.length === 0) {
    return "all goals";
  }
  if (labels.length === 1) {
    return labels[0];
  }
  return `${labels[0]} +${labels.length - 1}`;
};

// Whether anything in `name`'s craft chain drops at the spot in view. Walks
// ingredients depth-first with a seen-set, so a cyclic or unknown recipe
// costs nothing worse than a "no".
export const isFedByDrops = (
  graph: RecipeGraph,
  name: string,
  drops: ReadonlySet<string>,
  seen: Set<string> = new Set()
): boolean => {
  const node = graph.nodes.get(name);
  if (!node) {
    return false;
  }
  for (const ingredient of node.ingredients) {
    if (drops.has(ingredient.name)) {
      return true;
    }
    if (!seen.has(ingredient.name)) {
      seen.add(ingredient.name);
      if (isFedByDrops(graph, ingredient.name, drops, seen)) {
        return true;
      }
    }
  }
  return false;
};

const toProposal = (
  context: Context,
  steps: MissingItem[],
  maxSlots: number
): QueueProposal =>
  planCraftworksQueue(
    { steps, target: steps[0]?.name ?? "" },
    context.inventory,
    context.cap,
    maxSlots,
    context.unlimited
  );

export const buildQueuePlans = (
  context: Context,
  focused: ReadonlySet<string>
): QueuePlan[] => {
  const { craftworks, graph, here, inventory, resolved, unlimited } = context;
  if (!craftworks) {
    return [];
  }
  const maxSlots = craftworks.maxSlots ?? craftworks.slots.length;
  const desired = getDesiredQueueForNeeds(
    graph,
    resolved,
    inventory,
    unlimited,
    focused
  );
  if (desired.length === 0) {
    return [];
  }
  const plans: QueuePlan[] = [];
  const label = describeScope(context, focused);
  plans.push({
    ...toProposal(context, desired, maxSlots),
    label,
    setName: toSetName(label),
  });
  if (here) {
    const { location } = here;
    const drops = new Set(location.drops.map((drop) => drop.name));
    const fed = desired.filter((entry) =>
      isFedByDrops(graph, entry.name, drops)
    );
    // only worth a second list when it is genuinely narrower
    if (fed.length > 0 && fed.length < desired.length) {
      plans.push({
        ...toProposal(context, fed, maxSlots),
        label: `at ${location.name}`,
        setName: toSetName(location.name),
      });
    }
  }
  return plans;
};

// Two presses, like loading a set: the second names exactly what it saves.
const makeSaveControl = (
  plan: QueuePlan,
  context: Context,
  reload: () => void,
  onFailure: (node: Node) => void
): HTMLAnchorElement => {
  const { graph } = context;
  const ids: string[] = [];
  const unknown: string[] = [];
  for (const entry of plan.entries) {
    const id = graph.nodes.get(entry.name)?.id;
    if (id) {
      ids.push(String(id));
    } else {
      unknown.push(entry.name);
    }
  }
  const action = document.createElement("a");
  action.href = "#";
  action.style.color = TEXT_SUCCESS;
  action.style.fontSize = "12px";
  action.style.textDecoration = "underline";
  action.textContent = `save as set “${plan.setName}”`;
  let armed = false;
  action.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!armed) {
      armed = true;
      action.textContent = `confirm — saves ${ids.length} item${
        ids.length === 1 ? "" : "s"
      } as “${plan.setName}”${
        unknown.length > 0 ? ` (no id for ${unknown.join(", ")})` : ""
      }`;
      action.style.color = TEXT_WARNING;
      return;
    }
    action.textContent = "saving…";
    action.style.color = TEXT_GRAY;
    const result = await saveSet(plan.setName, ids);
    if (result.ok) {
      reload();
      return;
    }
    action.textContent = "save failed";
    action.style.color = TEXT_ERROR;
    onFailure(makeMutedText(` ${result.message}`));
  });
  return action;
};

export const renderQueuePlans = (
  body: HTMLElement,
  context: Context,
  focused: ReadonlySet<string>,
  reload: () => void,
  // the panel's own set loader, so a saved plan loads the same confirmed,
  // restorable way as any other set
  makeLoadControl: (
    set: { id: string; name: string },
    onFailure: (node: Node) => void
  ) => Node
): void => {
  const { craftworks, graph } = context;
  if (!craftworks) {
    return;
  }
  const plans = buildQueuePlans(context, focused);
  for (const plan of plans) {
    body.append(makeHeading(`Queue plan — ${plan.label}`));
    for (const entry of plan.entries) {
      const slot = craftworks.slots.find((s) => s.name === entry.name);
      const color = slot ? TEXT_SUCCESS : TEXT_WARNING;
      const parts: (string | Node)[] = [
        `${entry.position}. `,
        makeItemLink(entry.name, graph.nodes.get(entry.name)?.id, color),
        ` ×${entry.quantity.toLocaleString()}`,
      ];
      if (slot) {
        parts.push(
          slot.position === entry.position
            ? " — queued"
            : ` — queued at ${slot.position}`
        );
      } else {
        parts.push(" — not queued");
      }
      body.append(makeLinkedLine(color, parts));
    }
    if (plan.dropped.length > 0) {
      body.append(
        makeLinkedLine(TEXT_GRAY, [
          `left out: ${plan.dropped
            .map((entry) => `${entry.name} (${entry.reason})`)
            .join(", ")}`,
        ])
      );
    }
    const saved = (craftworks.sets ?? []).find(
      (set) => set.name.toLowerCase() === plan.setName.toLowerCase()
    );
    const line = makeLinkedLine(TEXT_GRAY, [
      saved ? `saved as “${saved.name}” — ` : "",
    ]);
    if (saved) {
      line.append(makeLoadControl(saved, (node) => line.append(node)));
    } else if (plan.entries.length > 0) {
      line.append(
        makeSaveControl(plan, context, reload, (node) => line.append(node))
      );
    }
    body.append(line);
  }
};
