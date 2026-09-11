import { LocationRef } from "~/api/buddyfarm/api";
import { TEXT_GRAY, TEXT_WHITE } from "~/utils/theme";

// Framework7 only routes a click through its own navigation when the anchor
// declares which view to load into. Without this the link does a full page
// load, which drops the SPA state and takes seconds — the same attribute the
// quick-craft linkifier sets.
const VIEW = ".view-main";

export const applyLinkStyle = (
  link: HTMLAnchorElement,
  color: string
): void => {
  link.dataset.view = VIEW;
  link.style.color = color;
  link.style.textDecoration = "underline";
  link.style.textDecorationStyle = "dotted";
  link.style.textUnderlineOffset = "2px";
};

export const makeLink = (
  href: string,
  text: string,
  color: string
): HTMLAnchorElement => {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  applyLinkStyle(link, color);
  return link;
};

// An item's own page. buddy.farm's item ids are the game's item ids, so an id
// from a recipe lookup addresses the game page directly.
export const makeItemLink = (
  name: string,
  id: number | undefined,
  color: string
): HTMLElement => {
  if (!id) {
    const span = document.createElement("span");
    span.textContent = name;
    span.style.color = color;
    return span;
  }
  return makeLink(`item.php?id=${id}`, name, color);
};

// Explore areas and fishing spots are different pages in the game.
export const toLocationHref = (location: LocationRef): string =>
  location.type === "fishing"
    ? `fishing.php?id=${location.id}`
    : `area.php?id=${location.id}`;

export const makeLocationLink = (
  name: string,
  location: LocationRef | undefined,
  color: string
): HTMLElement => {
  if (!location) {
    const span = document.createElement("span");
    span.textContent = name;
    span.style.color = color;
    return span;
  }
  return makeLink(toLocationHref(location), name, color);
};

export const makeQuestLink = (
  title: string,
  href: string | undefined,
  color: string
): HTMLElement => {
  if (!href) {
    const span = document.createElement("span");
    span.textContent = title;
    span.style.color = color;
    return span;
  }
  return makeLink(href, title, color);
};

// A line of mixed text and links. Plain strings become text nodes, so callers
// build "4 x Emberstone — Mount Banon" without hand-assembling spans.
export const makeLinkedLine = (
  color: string,
  parts: (string | Node)[]
): HTMLDivElement => {
  const line = document.createElement("div");
  line.style.color = color;
  line.style.fontSize = "12px";
  line.style.lineHeight = "1.5";
  line.style.marginBottom = "3px";
  for (const part of parts) {
    line.append(part);
  }
  return line;
};

export const makeMutedText = (text: string): HTMLSpanElement => {
  const span = document.createElement("span");
  span.textContent = text;
  span.style.color = TEXT_GRAY;
  return span;
};

// Section label inside the briefing panel. Shared so anything that renders a
// block into that body -- or into a panel built like it -- looks the same.
export const makeHeading = (text: string): HTMLDivElement => {
  const heading = document.createElement("div");
  heading.textContent = text;
  heading.style.color = TEXT_WHITE;
  heading.style.fontSize = "11px";
  heading.style.fontWeight = "bold";
  heading.style.letterSpacing = "0.4px";
  heading.style.textTransform = "uppercase";
  heading.style.margin = "12px 0 4px";
  return heading;
};
