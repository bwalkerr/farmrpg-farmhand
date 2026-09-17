import {
  Context,
  formatHits,
  getMissingDemand,
  getReasonsByItem,
  makeCard,
  makeEmpty,
  makeRow,
  makeTag,
  MAX_LISTED,
  MissingItem,
  plural,
  toIconUrl,
} from "./shared";
import { getLocationAdvice } from "~/utils/locationAdvice";
import { locationDataState, LocationDrop } from "~/api/buddyfarm/api";
import {
  makeItemLink,
  makeLocationLink,
  toLocationHref,
} from "~/utils/gameLinks";
import { orUndefined } from "~/utils/promise";
import { planSourcing } from "~/utils/craftPlanner";
import { TEXT_WHITE } from "~/utils/theme";

// The Here tab: the place you are standing, read against what you need.
//
// buddy.farm's location page is the drop table; this is the drop table with
// your inventory, your cap and your backlog laid over it, which is the part no
// site can do. Standing nowhere in particular it turns into "where to go" --
// the trips that would close the most of what you are short of.

const NEAR_CAP_RATIO = 0.9;

const attemptsNoun = (type: "explore" | "fishing"): string =>
  type === "fishing" ? "casts" : "explores";

const makeStat = (label: string, value: string): HTMLElement => {
  const stat = document.createElement("div");
  stat.className = "fh-stat";
  const labelElement = document.createElement("div");
  labelElement.className = "fh-stat-label";
  labelElement.textContent = label;
  const valueElement = document.createElement("div");
  valueElement.className = "fh-stat-value";
  valueElement.textContent = value;
  stat.append(labelElement, valueElement);
  return stat;
};

// Full-table row: one drop, with everything you know about it.
const makeDropRow = (
  drop: LocationDrop,
  context: Context,
  wantedFor: string[] | undefined,
  needed: number | undefined
): HTMLElement => {
  const { cap, inventory } = context;
  const have = inventory[drop.name] ?? 0;
  const isAtCap = cap !== undefined && cap > 0 && have >= cap;
  const isNearCap =
    !isAtCap && cap !== undefined && cap > 0 && have >= cap * NEAR_CAP_RATIO;
  const tags: Node[] = [];
  if (isAtCap) {
    tags.push(makeTag("at cap — wasted", "err"));
  } else if (isNearCap) {
    tags.push(makeTag("near cap", "warn"));
  }
  if (wantedFor && wantedFor.length > 0) {
    for (const reason of wantedFor.slice(0, 2)) {
      tags.push(makeTag(reason, "ok"));
    }
    if (wantedFor.length > 2) {
      tags.push(makeTag(`+${wantedFor.length - 2}`, "ok"));
    }
  }
  let tone: "ok" | "err" | "warn" | undefined;
  if (isAtCap) {
    tone = "err";
  } else if (needed !== undefined) {
    tone = "ok";
  }
  const aside: (string | Node)[] = [];
  const rate = document.createElement("strong");
  rate.textContent = `1 in ${formatHits(drop.rate)}`;
  aside.push(rate);
  if (cap !== undefined && cap > 0) {
    aside.push(
      document.createElement("br"),
      `${have.toLocaleString()} / ${cap.toLocaleString()}`
    );
  }
  const sub: (string | Node)[] = [];
  if (needed !== undefined) {
    sub.push(
      `${needed.toLocaleString()} needed · ~${formatHits(
        needed * drop.rate
      )} tries`
    );
  }
  return makeRow(makeItemLink(drop.name, drop.id, TEXT_WHITE), {
    aside,
    icon: toIconUrl(drop.image),
    sub,
    tags,
    tone,
  });
};

const renderWhereToGo = async (
  body: HTMLElement,
  context: Context,
  missing: MissingItem[],
  title: string
): Promise<void> => {
  const { graph } = context;
  const sourcing = planSourcing(graph, missing);
  if (sourcing.locations.length === 0) {
    return;
  }
  const top = sourcing.locations.slice(0, MAX_LISTED);
  const references = await Promise.all(
    top.map((entry) =>
      orUndefined(locationDataState.get({ query: entry.location }))
    )
  );
  const { card, body: cardBody } = makeCard(title, {
    aside: `${sourcing.locations.length} trips`,
  });
  for (const [index, entry] of top.entries()) {
    const reference = references[index];
    const tags = entry.items
      .slice(0, 4)
      .map((item) =>
        makeTag(
          item.name,
          entry.items.length > 1 ? "ok" : "muted",
          graph.nodes.get(item.name)?.id
            ? `item.php?id=${graph.nodes.get(item.name)?.id}`
            : undefined
        )
      );
    if (entry.items.length > 4) {
      tags.push(makeTag(`+${entry.items.length - 4}`));
    }
    cardBody.append(
      makeRow(makeLocationLink(entry.location, reference, TEXT_WHITE), {
        aside: [
          `~${formatHits(entry.hits)} ${
            entry.type === "fishing" ? "casts" : "explores"
          }`,
        ],
        href: reference ? toLocationHref(reference) : undefined,
        tags,
        tone: entry.items.length > 1 ? "ok" : undefined,
      })
    );
  }
  body.append(card);
};

// A location's drop table laid over your inventory, cap and backlog. The Here
// tab draws the place you are standing; the lookup draws any place you search
// for, through the same function.
export const renderLocationView = (
  body: HTMLElement,
  context: Context,
  here: NonNullable<Context["here"]>,
  focused: ReadonlySet<string>
): void => {
  const { cap, inventory, mastery, resolved } = context;
  const missing = getMissingDemand(context, focused);
  const { image, location, stamina } = here;
  const reasons = getReasonsByItem(resolved, focused);
  const advice = getLocationAdvice(
    location.drops,
    missing,
    reasons,
    inventory,
    cap,
    mastery
  );
  const neededByName = new Map(
    advice.needed.map((entry) => [entry.name, entry])
  );
  const wastedNames = new Set(advice.wasted.map((entry) => entry.name));

  // header
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
  const name = document.createElement("div");
  name.className = "fh-place-name";
  name.append(makeLocationLink(location.name, location, TEXT_WHITE));
  const sub = document.createElement("div");
  sub.className = "fh-place-sub";
  sub.textContent = `${
    location.type === "fishing" ? "Fishing spot" : "Explore area"
  } · ${plural(location.drops.length, "drop")}`;
  text.append(name, sub);
  place.append(text);
  body.append(place);

  // figures
  const stats = document.createElement("div");
  stats.className = "fh-stats";
  if (stamina !== undefined) {
    stats.append(makeStat("stamina", stamina.toLocaleString()));
  }
  if (location.silverPerHit !== undefined) {
    stats.append(
      makeStat(
        `silver / ${location.type === "fishing" ? "cast" : "explore"}`,
        Math.round(location.silverPerHit).toLocaleString()
      )
    );
  }
  if (location.xpPerHit !== undefined) {
    stats.append(
      makeStat(
        `xp / ${location.type === "fishing" ? "cast" : "explore"}`,
        Math.round(location.xpPerHit).toLocaleString()
      )
    );
  }
  if (stats.childElementCount > 0) {
    body.append(stats);
  }

  // wanted here: cheapest to finish first, with whether the stamina covers it
  if (advice.needed.length > 0) {
    const { card, body: cardBody } = makeCard("Wanted here", {
      aside: String(advice.needed.length),
      tone: "ok",
    });
    for (const entry of advice.needed.slice(0, MAX_LISTED * 2)) {
      const covered =
        stamina !== undefined && stamina >= entry.attempts
          ? " — stamina covers it"
          : "";
      const drop = location.drops.find(
        (candidate) => candidate.name === entry.name
      );
      cardBody.append(
        makeRow(makeItemLink(entry.name, entry.id, TEXT_WHITE), {
          aside: [
            `~${formatHits(entry.attempts)}`,
            document.createElement("br"),
            attemptsNoun(location.type),
          ],
          icon: toIconUrl(drop?.image),
          sub: [`${entry.quantity.toLocaleString()} needed${covered}`],
          tags: entry.reasons
            .slice(0, 3)
            .map((reason) => makeTag(reason, "ok")),
          tone: "ok",
        })
      );
    }
    body.append(card);
  }

  // wasted here: at cap, every drop discarded, and the mastery it costs
  if (advice.wasted.length > 0) {
    const { card, body: cardBody } = makeCard("Thrown away here", {
      aside: String(advice.wasted.length),
      tone: "err",
    });
    for (const entry of advice.wasted.slice(0, MAX_LISTED * 2)) {
      const drop = location.drops.find(
        (candidate) => candidate.name === entry.name
      );
      cardBody.append(
        makeRow(makeItemLink(entry.name, entry.id, TEXT_WHITE), {
          aside: ["at cap"],
          icon: toIconUrl(drop?.image),
          sub: [
            entry.masteryRemaining === undefined
              ? "every one you find is discarded"
              : `discarded — still owes ${entry.masteryRemaining.toLocaleString()} mastery`,
          ],
          tone: "err",
        })
      );
    }
    body.append(card);
  }

  // the whole table, best rate first, everything you know laid over it
  const { card, body: cardBody } = makeCard("Everything that drops here", {
    aside: "1 in N tries",
  });
  for (const drop of location.drops) {
    const needed = neededByName.get(drop.name)?.quantity;
    cardBody.append(
      makeDropRow(
        drop,
        context,
        reasons.get(drop.name) ?? (wastedNames.has(drop.name) ? [] : undefined),
        needed
      )
    );
  }
  body.append(card);
};

export const renderHereTab = async (
  body: HTMLElement,
  context: Context,
  focused: ReadonlySet<string>
): Promise<void> => {
  const missing = getMissingDemand(context, focused);
  if (!context.here) {
    body.append(
      makeEmpty(
        "Not at an explore area or fishing spot. Open the panel on one for its drop table against your needs."
      )
    );
    await renderWhereToGo(body, context, missing, "Where to go");
    return;
  }
  renderLocationView(body, context, context.here, focused);
  await renderWhereToGo(body, context, missing, "Elsewhere");
};
