import { FeatureSetting } from "~/utils/feature";
import { getPerkStatus, onPerkStatusChange } from "~/api/farmrpg/apis/perks";
import { getSettingValues, SettingId } from "~/utils/settings";

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

// Off by default. When on, the pill reports what the perk manager last decided
// alongside the set name — which page it recognised, which set that called for,
// and whether the switch went through. It exists because a phone has no console:
// the pill is the only surface there that can tell you why perks didn't change.
export const SETTING_PERK_INDICATOR_DEBUG: FeatureSetting = {
  id: SettingId.PERK_INDICATOR_DEBUG,
  title: "Perks: Debug indicator",
  description:
    "Show what the perk manager last decided next to the set name in the bottom bar",
  type: "boolean",
  defaultValue: false,
};

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

  if (!settings[SettingId.PERK_MANAGER] || !status.name) {
    pill?.remove();
    return;
  }

  // mount once and reuse, exactly like the cap tracker in this same bar. The
  // game rebuilds the toolbar as you navigate, so re-attach an orphaned pill
  // rather than building a second one
  if (!pill) {
    pill = buildIndicator();
  }
  // sit at the end of the counts, whichever order we mounted in (this also
  // re-attaches an orphaned pill)
  keepRightmost(statsZone, pill);
  watchOrder(statsZone);

  const isDebug = Boolean(settings[SettingId.PERK_INDICATOR_DEBUG]);
  const note = isDebug ? status.note ?? "no decision yet" : undefined;
  const signature = `${status.name}|${status.isPending}|${status.isConfirmed}|${note}`;
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
  // the label doesn't need to grow to say the same thing.
  const initial = status.name.trim().slice(0, 1).toUpperCase();
  label.textContent = note ? `${initial} · ${note}` : initial;
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
