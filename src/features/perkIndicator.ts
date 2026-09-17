import {
  getPerkStatus,
  onPerkStatusChange,
  PerkStatus,
} from "~/api/farmrpg/apis/perks";
import { getSettingValues, SettingId } from "~/utils/settings";
import { isMobileLayout, onLayoutChange } from "~/utils/layout";
import { TEXT_GRAY, TEXT_SUCCESS, TEXT_WARNING } from "~/utils/theme";

// A small "● Crafting" pill in the bottom stats bar, right of the currency
// counts and the cap tracker, showing which perk set is equipped right now.
//
// It replaces the old "…perks activated" notification banner, which was
// inserted into the page's own content — so it shoved everything below it down,
// including the button under your finger on a quick-sell — and which announced
// an *intent* to switch rather than a switch that happened (it was sent
// unconditionally, so during the cache-drift bug it claimed "Selling perks
// activated" while the sale rolled under Default). This reads the live switch
// state instead, so it can only say Crafting once the game has really been
// driven there.
//
// The bottom bar is the one placement in this game that has survived testing:
// mid-screen right and top collide with the chat panel, bottom-left is the
// game's own help tracker, and the left nav never rendered.

const INDICATOR_ID = "fh-perk-indicator";

// The same colours, with the same meaning, as the chip in the briefing panel's
// header: green when we drove the game to the set and watched it land, amber
// while a switch is in flight, grey when the name is only what the (optimistic)
// cache says. The pill used to colour by KIND of set instead -- orange for an
// activity set, grey for Default -- which looked identical whether the set was
// verified or not, so the panel read as the truthful one and this as
// decoration. One vocabulary now, so the two can't disagree.
const colourFor = (status: PerkStatus): string => {
  if (status.isConfirmed) {
    return TEXT_SUCCESS;
  }
  if (status.isPending) {
    return TEXT_WARNING;
  }
  return TEXT_GRAY;
};

// The game boots with <body class="f7-booting"> and only clears it in
// index-app.js, on the line right after `new Framework7()` and its addView()
// calls — the same line that sets window.farmAppReady. Adding our own elements
// to the page inside that window is what took the whole game down in 1.0.68:
// the game's init threw, farmAppReady stayed false, and its boot handler then
// swallowed every click on the page.
//
// So we wait. This is also why the cap tracker has never caused trouble in this
// same bar — its data arrives from a fetch, so it always mounts well after boot.
// Nothing here is on a critical path; being a moment late costs nothing.
const isGameBooted = (): boolean =>
  !document.body.classList.contains("f7-booting");

const BOOT_POLL_MS = 250;
const BOOT_POLL_LIMIT = 40; // ~10s, then give up until the next page load
let bootPollsLeft = BOOT_POLL_LIMIT;
let bootPoll: ReturnType<typeof setTimeout> | undefined;

// The pill shares the stats bar with the cap tracker, and both simply append
// themselves — so which one ends up on the left came down to who mounted first.
// The tracker waits on an inventory fetch, so on a cold load we win the race and
// sit left of it; on a reload with cached data it wins and we sit right. Rather
// than depend on that timing, we keep "last child" as a maintained property: fix
// the position on every render, and watch the bar so a later arrival (the
// tracker mounting, or the game rewriting the toolbar) is corrected at once.
const keepRightmost = (statsZone: Element, pill: HTMLElement): void => {
  if (statsZone.lastElementChild !== pill) {
    statsZone.append(pill);
  }
};

let observedStatsZone: Element | undefined;
let orderObserver: MutationObserver | undefined;

const watchOrder = (statsZone: Element): void => {
  // the game rebuilds the toolbar as you navigate, so re-observe when the bar
  // we're watching is no longer the one on screen
  if (observedStatsZone === statsZone) {
    return;
  }
  orderObserver?.disconnect();
  orderObserver = new MutationObserver(() => {
    const pill = document.querySelector<HTMLElement>(`#${INDICATOR_ID}`);
    // only ever move ourselves, and only while we're actually in this bar —
    // if the game dropped the pill, the next render remounts it
    if (pill?.parentElement === statsZone) {
      keepRightmost(statsZone, pill);
    }
  });
  // childList only: this fires when something is added to or removed from the
  // bar, and our own move settles on the next callback (we're last, so no-op)
  orderObserver.observe(statsZone, { childList: true });
  observedStatsZone = statsZone;
};

const buildIndicator = (): HTMLElement => {
  const pill = document.createElement("span");
  pill.id = INDICATOR_ID;
  pill.style.display = "inline-flex";
  pill.style.alignItems = "center";
  pill.style.gap = "4px";
  pill.style.marginLeft = "10px";
  pill.style.verticalAlign = "middle";
  pill.style.fontSize = "11px";
  pill.style.whiteSpace = "nowrap";

  const dot = document.createElement("span");
  dot.dataset.fhRole = "dot";
  dot.style.width = "8px";
  dot.style.height = "8px";
  dot.style.borderRadius = "50%";
  dot.style.flexShrink = "0";
  pill.append(dot);

  const label = document.createElement("span");
  label.dataset.fhRole = "label";
  pill.append(label);

  return pill;
};

export const renderPerkIndicator = async (): Promise<void> => {
  // never touch the DOM while the game is still initializing (see isGameBooted)
  if (!isGameBooted()) {
    if (!bootPoll && bootPollsLeft > 0) {
      bootPollsLeft -= 1;
      bootPoll = setTimeout(() => {
        bootPoll = undefined;
        renderPerkIndicator().catch((error) => {
          console.error("Failed to render perk indicator", error);
        });
      }, BOOT_POLL_MS);
    }
    return;
  }
  bootPollsLeft = BOOT_POLL_LIMIT;

  // Read everything asynchronous FIRST. Past this point the function is
  // synchronous, which is what keeps it single-mount: renders are triggered
  // from several places at once (page load, quest load, every switch), and when
  // an await sat between "is there a pill?" and "append one" two of them could
  // interleave, both see none, and both mount one — two pills side by side.
  const settings = await getSettingValues();
  const status = getPerkStatus();

  const statsZone = document.querySelector("#statszone_main");
  if (!statsZone) {
    return;
  }

  // sweep any strays from that race before deciding what to draw
  const [pillElement, ...duplicates] = document.querySelectorAll<HTMLElement>(
    `#${INDICATOR_ID}`
  );
  for (const duplicate of duplicates) {
    duplicate.remove();
  }
  let pill = pillElement;

  // Not on a phone. The bottom bar there holds the currency counts and the
  // game's own home and chat buttons and nothing more, and the panel shows the
  // equipped set already -- in a surface we control, which is the better place
  // for it. Same call the cap tracker in this bar already makes.
  //
  // An unknown set is shown as "no set", as the panel shows it, rather than
  // hiding the pill: a pill that vanishes looks like the feature is off, and
  // "no set" before the first switch of a session is information.
  if (!settings[SettingId.PERK_MANAGER] || isMobileLayout()) {
    pill?.remove();
    return;
  }

  // mount once and reuse, exactly like the cap tracker in this same bar. The
  // game rebuilds the toolbar as you navigate, so re-attach an orphaned pill
  // rather than building a second one
  if (!pill) {
    pill = buildIndicator();
    statsZone.append(pill);
  }
  // stay to the right of the currency counts and the cap tracker, whichever
  // order we happened to mount in (also re-attaches an orphaned pill)
  keepRightmost(statsZone, pill);
  watchOrder(statsZone);

  paintIndicator(pill, status);
};

// Synchronous, like the panel's paint: a status change repaints the pill in the
// same tick it happens. Going through the full render for every change put an
// await (the settings read) between the change and the paint, so the pill was
// always a beat behind the panel chip on the same event.
const paintIndicator = (pill: HTMLElement, status: PerkStatus): void => {
  const name = status.name ?? "no set";
  const signature = [
    name,
    status.isPending,
    status.isConfirmed,
    status.note ?? "",
  ].join("|");
  if (pill.dataset.fhSignature === signature) {
    return;
  }
  pill.dataset.fhSignature = signature;

  const colour = colourFor(status);
  const dot = pill.querySelector<HTMLElement>("[data-fh-role='dot']");
  const label = pill.querySelector<HTMLElement>("[data-fh-role='label']");
  if (!dot || !label) {
    return;
  }
  // in flight: hollow dot + trailing ellipsis, so a real switch is visible
  // while it happens (the settle wait makes it ~1s — long enough to see)
  dot.style.backgroundColor = status.isPending ? "transparent" : colour;
  dot.style.border = status.isPending ? `1px solid ${colour}` : "none";
  label.textContent = status.isPending ? `${name}…` : name;
  label.style.color = colour;
  // the panel shows the manager's last note under its chip; here the bar has
  // no room, so it rides in the tooltip in the same shape
  pill.title = status.note
    ? `Perks: ${name} — ${status.note}`
    : `Perks: ${name}`;
};

// rotating a phone or dragging a window across the breakpoint has to repaint,
// or the pill keeps whatever shape it happened to mount in
onLayoutChange(() => {
  renderPerkIndicator().catch((error) => {
    console.error("Failed to render perk indicator", error);
  });
});

// Repaint whenever a switch starts, lands, or logs. A mounted pill is painted
// right here, synchronously; only when there is none yet (first status of the
// session, or the game rebuilt the bar) does this go through the full render.
onPerkStatusChange(() => {
  const pill = document.querySelector<HTMLElement>(`#${INDICATOR_ID}`);
  if (pill?.isConnected) {
    paintIndicator(pill, getPerkStatus());
    return;
  }
  renderPerkIndicator().catch((error) => {
    console.error("Failed to render perk indicator", error);
  });
});
