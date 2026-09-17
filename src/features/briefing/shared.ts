import { Advice } from "~/utils/craftworks";
import { CraftworksSnapshot } from "~/api/farmrpg/apis/craftworks";
import { getGoalStatuses, mergeMissing, rankBottlenecks } from "~/utils/focus";
import { getQuestGoals } from "~/api/farmrpg/apis/quests";
import { GoalProgress, TrackedGoal } from "~/utils/goals";
import { LocationRef } from "~/api/buddyfarm/api";
import { makeLinkedLine } from "~/utils/gameLinks";
import { MasteryEntry } from "~/api/farmrpg/apis/mastery";
import { RecipeGraph } from "~/utils/craftPlanner";
import { ResolvedNeeds } from "~/utils/needs";
import { TEXT_GRAY } from "~/utils/theme";
import { UnlimitedItems } from "~/utils/unlimited";

// What the panel and its tabs share: the ids the styles hang off, the context
// every tab reasons from, and the small primitives that make the tabs look
// like one panel rather than five.

export const BUTTON_ID = "fh-briefing-button";
export const PANEL_ID = "fh-briefing-panel";
export const STYLE_ID = "fh-briefing-style";
export const MAX_LISTED = 5;

// Everything the tabs need, gathered once. Switching tabs re-renders from this
// rather than re-fetching, so only the refresh control costs requests.
export interface Context {
  advice?: Advice;
  cap?: number;
  craftworks?: CraftworksSnapshot;
  goalProgress: GoalProgress[];
  goals: TrackedGoal[];
  graph: RecipeGraph;
  inventory: Record<string, number>;
  // the explore or fishing spot in view, when there is one
  here?: { image?: string; location: LocationRef; stamina?: number };
  itemNames: string[];
  mastery: MasteryEntry[];
  questGoals?: Awaited<ReturnType<typeof getQuestGoals>>;
  // every demand on you -- tracked goals, open requests, stalled queue slots --
  // resolved once, so each tab reasons from the same numbers
  resolved: ResolvedNeeds;
  statuses: ReturnType<typeof getGoalStatuses>;
  unlimited: UnlimitedItems;
}

export interface MissingItem {
  name: string;
  quantity: number;
}

// Everything you are short of, merged across every demand -- or, when
// undertakings are focused, only what those want. This is the ONE list focus
// narrows: alerts are never filtered, but "what do I go and get" is exactly
// the question focus exists to answer.
//
// Craftworks says what a slot is out of but never how many it is short by, so
// a blocker counts as one unit; a request's shortfall is exact. Both are the
// same trip, which is why they merge rather than being listed twice.
export const getMissingDemand = (
  context: Context,
  focused: ReadonlySet<string>
): MissingItem[] => {
  const { advice, goalProgress, resolved, statuses } = context;
  const focusedScopes = resolved.scopes.filter((scope) =>
    focused.has(scope.rootId)
  );
  if (focusedScopes.length > 0) {
    return mergeMissing(...focusedScopes.map((scope) => scope.missing));
  }
  return mergeMissing(
    rankBottlenecks(statuses).map((entry) => ({
      name: entry.name,
      quantity: entry.maxNeeded,
    })),
    (advice?.roots ?? []).map((root) => ({ name: root.name, quantity: 1 })),
    // tracked goals steer this list too, so setting a goal changes where the
    // panel sends you rather than only what the Goals tab says
    ...goalProgress.map((entry) => entry.missing)
  );
};

// Why the scope wants an item -- standing in a place, the question is which of
// your undertakings this drop is actually for.
export const getReasonsByItem = (
  resolved: ResolvedNeeds,
  only: ReadonlySet<string>
): Map<string, string[]> => {
  const reasons = new Map<string, string[]>();
  for (const scope of resolved.scopes) {
    if (only.size > 0 && !only.has(scope.rootId)) {
      continue;
    }
    for (const entry of scope.missing) {
      reasons.set(entry.name, [
        ...(reasons.get(entry.name) ?? []),
        scope.label,
      ]);
    }
  }
  return reasons;
};

export const plural = (count: number, noun: string): string =>
  `${count.toLocaleString()} ${noun}${count === 1 ? "" : "s"}`;

export const formatHits = (hits: number): string =>
  hits >= 100 ? Math.round(hits).toLocaleString() : hits.toFixed(1);

// Deliberately coarse: the question this answers is "is this still true?",
// and a number ticking by the second invites reading it as precision.
export const formatAge = (readAt: number): string => {
  const seconds = Math.max(0, Math.round((Date.now() - readAt) / 1000));
  if (seconds < 60) {
    return "just now";
  }
  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`;
};

// The alert sections cut at MAX_LISTED, but the button's badge counts them all,
// so a truncated list reads as the panel disagreeing with itself. Say what was
// left out instead.
export const appendMore = (body: HTMLElement, total: number): void => {
  if (total <= MAX_LISTED) {
    return;
  }
  body.append(makeLinkedLine(TEXT_GRAY, [`+${total - MAX_LISTED} more`]));
};

// ---------------------------------------------------------------------------
// Primitives. A card is a titled block; a row is icon | text | aside. Every
// tab is built from these two so the panel reads as one surface.
// ---------------------------------------------------------------------------

export type Tone = "ok" | "warn" | "err" | "muted" | "accent";

export interface CardOptions {
  // a count or short figure shown at the right of the title
  aside?: string | Node;
  tone?: Tone;
}

export const makeCard = (
  title: string,
  options: CardOptions = {}
): { card: HTMLElement; body: HTMLElement } => {
  const card = document.createElement("section");
  card.className = "fh-card";
  if (options.tone) {
    card.dataset.tone = options.tone;
  }
  const head = document.createElement("header");
  head.className = "fh-card-head";
  const label = document.createElement("span");
  label.textContent = title;
  head.append(label);
  if (options.aside !== undefined) {
    const aside = document.createElement("span");
    aside.className = "fh-card-aside";
    aside.append(options.aside);
    head.append(aside);
  }
  const body = document.createElement("div");
  body.className = "fh-card-body";
  card.append(head, body);
  return { card, body };
};

export interface RowOptions {
  // a game link the whole row goes to
  href?: string;
  icon?: string;
  // what sits at the right edge: a count, a figure
  aside?: (string | Node)[];
  // the line under the title, muted
  sub?: (string | Node)[];
  tags?: Node[];
  tone?: Tone;
}

export const makeRow = (
  title: string | Node,
  options: RowOptions = {}
): HTMLElement => {
  const row = document.createElement(options.href ? "a" : "div");
  row.className = "fh-row";
  if (options.href) {
    (row as HTMLAnchorElement).href = options.href;
  }
  if (options.tone) {
    row.dataset.tone = options.tone;
  }
  const iconSlot = document.createElement("span");
  iconSlot.className = "fh-row-icon";
  if (options.icon) {
    const img = document.createElement("img");
    img.src = options.icon;
    img.alt = "";
    img.loading = "lazy";
    iconSlot.append(img);
  }
  const main = document.createElement("span");
  main.className = "fh-row-main";
  const titleLine = document.createElement("span");
  titleLine.className = "fh-row-title";
  titleLine.append(title);
  main.append(titleLine);
  if (options.sub && options.sub.length > 0) {
    const sub = document.createElement("span");
    sub.className = "fh-row-sub";
    sub.append(...options.sub);
    main.append(sub);
  }
  if (options.tags && options.tags.length > 0) {
    const tags = document.createElement("span");
    tags.className = "fh-row-tags";
    tags.append(...options.tags);
    main.append(tags);
  }
  const aside = document.createElement("span");
  aside.className = "fh-row-aside";
  if (options.aside) {
    aside.append(...options.aside);
  }
  row.append(iconSlot, main, aside);
  return row;
};

export const makeTag = (
  text: string,
  tone: Tone = "muted",
  href?: string
): HTMLElement => {
  const tag = document.createElement(href ? "a" : "span");
  tag.className = "fh-tag";
  tag.dataset.tone = tone;
  tag.textContent = text;
  if (href) {
    (tag as HTMLAnchorElement).href = href;
  }
  return tag;
};

export const makeEmpty = (text: string): HTMLElement => {
  const empty = document.createElement("div");
  empty.className = "fh-empty";
  empty.textContent = text;
  return empty;
};

// The buddy.farm image path is site-relative; the game serves the same icons.
export const toIconUrl = (image: string | undefined): string | undefined => {
  if (!image) {
    return undefined;
  }
  if (/^(?:https?:)?\/\//.test(image) || image.startsWith("data:")) {
    return image;
  }
  return image.startsWith("/") ? image : `/${image}`;
};
