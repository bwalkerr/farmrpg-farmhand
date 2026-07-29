import { BORDER_GRAY } from "~/utils/theme";
import { getPage } from "~/utils/page";
import {
  getPerkStatus,
  onPerkStatusChange,
  primePerkStatus,
} from "~/api/farmrpg/apis/perks";
import { getSettingValues, SettingId } from "~/utils/settings";
import { showPopup } from "~/utils/popup";

// A tiny "● C" marker in the bottom stats bar, after the currency counts,
// showing which perk set is equipped right now: a coloured dot plus the set's
// first letter. It's deliberately one character wide — the bar is narrow on a
// phone, and a full set name plus the counts and the game's own buttons left the
// marker clipped or pushed out of sight. The full name is in the tooltip, and
// the debug setting can put more detail in the label when you ask for it.
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

// gray for the resting/default set, orange for an activity set that's on
const COLOR_RESTING = "#9e9e9e";
const COLOR_ACTIVE = "#f0932b";

const isRestingSet = (name: string): boolean =>
  name.trim().toLowerCase() === "default";

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

// The pill shares the stats bar with the cap tracker, and both simply add
// themselves — so position came down to who mounted first. The tracker waits on
// an inventory fetch, so on a cold load we win the race and on a cached reload we
// don't. Rather than depend on that timing, position is a maintained property:
// re-asserted on every render, and watched so a later arrival (the tracker
// mounting, or the game rewriting the toolbar) is corrected at once.
//
// Last child works on a phone too: #statszone_main holds only the currency
// counts, while the Menu, home and chat buttons are inserted next to #homebtn in
// the toolbar outside it — so the end of this container is the gap between the
// counts and those buttons, which is where the pill belongs on both layouts.
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

// Tapping the marker explains itself. This is the only diagnostic surface that
// works on a phone: there's no console to open, no room in the bar for a longer
// label, and no hover for the tooltip. It reports which set is on and how
// certain we are, plus what the perk manager last decided and which page it
// thinks you're on — enough to tell "this page isn't an activity" from "the page
// wasn't recognised" from "the switch failed".
const showPerkDetails = async (): Promise<void> => {
  const status = getPerkStatus();
  const [page] = getPage();
  let state = "selected in the game, not verified this session";
  if (status.isPending) {
    state = "switching now";
  } else if (status.isConfirmed) {
    state = "equipped (verified this session)";
  }
  await showPopup({
    title: "Perk set",
    align: "left",
    contentHTML: `
      <div><strong>Set:</strong> ${status.name ?? "unknown"}</div>
      <div><strong>State:</strong> ${state}</div>
      <div><strong>This page:</strong> ${page ?? "not recognised"}</div>
      <div><strong>Last decision:</strong> ${
        status.note ?? "nothing yet this session"
      }</div>
    `,
  });
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
  // a dot and one letter is a small target on a phone, so pad out the tap area
  // without making the marker itself any bigger
  pill.style.padding = "6px 4px";
  pill.style.cursor = "pointer";
  pill.addEventListener("click", () => {
    showPerkDetails().catch((error) => {
      console.error("Failed to show perk details", error);
    });
  });

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

  // Some pages don't carry the stats bar at all — arriving at a fishing spot is
  // where this shows up — and the marker used to simply vanish there, which reads
  // as "the perk manager stopped working" exactly when you're heading into an
  // activity. The cap tracker has always had a floating fallback for this; the
  // marker now uses the same one, so it stays on screen everywhere.
  const statsZone = document.querySelector("#statszone_main");

  // sweep any strays from that race before deciding what to draw
  const [pillElement, ...duplicates] = document.querySelectorAll<HTMLElement>(
    `#${INDICATOR_ID}`
  );
  for (const duplicate of duplicates) {
    duplicate.remove();
  }
  let pill = pillElement;

  if (!settings[SettingId.PERK_MANAGER]) {
    pill?.remove();
    return;
  }

  // Nothing has read the perk sets yet, so there's no set name to show. Ask for
  // them; the read notifies status listeners, which brings us straight back here
  // with a name. Without this the marker stayed absent until the session's first
  // switch — a harvest, or landing on an activity page — which is exactly the
  // "it didn't come up immediately" behaviour.
  if (!status.name) {
    pill?.remove();
    primePerkStatus().catch((error) => {
      console.error("Failed to read perk sets", error);
    });
    return;
  }

  // mount once and reuse, exactly like the cap tracker in this same bar. The
  // game rebuilds the toolbar as you navigate, so re-attach an orphaned pill
  // rather than building a second one
  if (!pill) {
    pill = buildIndicator();
  }
  if (statsZone) {
    // in the bar: sit at the end of the counts, whichever order we mounted in
    // (this also re-attaches a pill orphaned by the game rebuilding the toolbar)
    pill.style.position = "static";
    pill.style.border = "none";
    pill.style.backgroundColor = "transparent";
    keepRightmost(statsZone, pill);
    watchOrder(statsZone);
  } else {
    // no bar on this page: float above where it normally sits, matching the cap
    // tracker's fallback so the two look like the same system
    pill.style.position = "fixed";
    pill.style.right = "8px";
    pill.style.bottom = "34px";
    pill.style.zIndex = "5000";
    pill.style.padding = "4px 8px";
    pill.style.borderRadius = "6px";
    pill.style.border = `1px solid ${BORDER_GRAY}`;
    pill.style.backgroundColor = "rgba(20, 20, 20, 0.92)";
    if (pill.parentElement !== document.body) {
      document.body.append(pill);
    }
  }

  const signature = `${status.name}|${status.isPending}|${status.isConfirmed}`;
  if (pill.dataset.fhSignature === signature) {
    return;
  }
  pill.dataset.fhSignature = signature;

  const color = isRestingSet(status.name) ? COLOR_RESTING : COLOR_ACTIVE;
  const dot = pill.querySelector<HTMLElement>("[data-fh-role='dot']");
  const label = pill.querySelector<HTMLElement>("[data-fh-role='label']");
  if (!dot || !label) {
    return;
  }

  // in flight: hollow dot + faded label, so a real switch is visible while it
  // happens (the settle wait makes it ~1s — long enough to see it land)
  dot.style.backgroundColor = status.isPending ? "transparent" : color;
  dot.style.border = status.isPending ? `1px solid ${color}` : "none";
  // first letter only. The dot carries the state (hollow while switching), so
  // the label doesn't need to grow to say the same thing. Everything else is a
  // tap away — see showPerkDetails.
  label.textContent = status.name.trim().slice(0, 1).toUpperCase();
  label.style.color = color;
  pill.style.opacity = status.isPending ? "0.6" : "1";
  if (status.isPending) {
    pill.title = `Switching to the ${status.name} perk set…`;
  } else if (status.isConfirmed) {
    pill.title = `${status.name} perks equipped`;
  } else {
    pill.title = `${status.name} perk set selected (not verified this session)`;
  }
};

// re-render whenever a switch starts or finishes
onPerkStatusChange(() => {
  renderPerkIndicator().catch((error) => {
    console.error("Failed to render perk indicator", error);
  });
});
