import {
  BORDER_GRAY,
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
  TEXT_WHITE,
} from "~/utils/theme";
import { BUTTON_ID, PANEL_ID, STYLE_ID } from "./shared";
import { MOBILE_MAX_WIDTH } from "~/utils/layout";

// Bottom-left, clear of the bottom bar. env() keeps the button clear of the
// iOS home indicator and any notch; the fallbacks make it identical to before
// on anything that does not report insets.
const EDGE_OFFSET = "calc(8px + env(safe-area-inset-left, 0px))";
const BOTTOM_OFFSET = "calc(62px + env(safe-area-inset-bottom, 0px))";
// On a phone the button moves to the RIGHT, at Reed's request: that is where a
// thumb rests.
const RIGHT_OFFSET = "calc(8px + env(safe-area-inset-right, 0px))";

export const injectPanelStyles = (): void => {
  if (document.querySelector(`#${STYLE_ID}`)) {
    return;
  }
  document.head.insertAdjacentHTML(
    "beforeend",
    `<style id="${STYLE_ID}">
      #${BUTTON_ID} {
        position: fixed;
        left: ${EDGE_OFFSET};
        bottom: ${BOTTOM_OFFSET};
        z-index: 5000;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid ${BORDER_GRAY};
        background: rgba(20, 20, 20, 0.92);
        color: ${TEXT_GRAY};
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        transition: transform 140ms ease, color 140ms ease,
          border-color 140ms ease;
        -webkit-backdrop-filter: blur(6px);
        backdrop-filter: blur(6px);
      }
      #${BUTTON_ID}:hover { color: ${TEXT_WHITE}; border-color: #5a5a5a; }
      #${BUTTON_ID}:active { transform: scale(0.94); }
      #${BUTTON_ID}[data-open="true"] {
        color: ${TEXT_WHITE};
        transform: rotate(90deg);
      }
      #${BUTTON_ID} .fh-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9px;
        background: ${TEXT_WARNING};
        color: #111;
        font-size: 11px;
        font-weight: bold;
        line-height: 18px;
        text-align: center;
      }
      /* The cap tracker's count, on the other shoulder of the button: red for
         items AT cap where you are (every drop of those is thrown away), amber
         when the worst of it is only near. It is what the row of icons in the
         stats bar used to be for -- a glance, without opening anything. */
      #${BUTTON_ID} .fh-cap-badge {
        position: absolute;
        top: -2px;
        left: -2px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9px;
        background: ${TEXT_ERROR};
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        line-height: 18px;
        text-align: center;
      }
      #${BUTTON_ID} .fh-cap-badge[data-level="near"] {
        background: ${TEXT_WARNING};
        color: #111;
      }
      #${PANEL_ID} .fh-cap-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin: 4px 0 8px;
      }
      #${PANEL_ID} .fh-cap-item {
        display: block;
        line-height: 0;
        border-radius: 6px;
        border: 2px solid ${TEXT_WARNING};
      }
      #${PANEL_ID} .fh-cap-item[data-at-cap="true"] { border-color: ${TEXT_ERROR}; }
      #${PANEL_ID} .fh-cap-item img {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        display: block;
      }
      #${PANEL_ID} .fh-cap-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        padding: 2px 0;
      }
      #${PANEL_ID} .fh-cap-row img {
        width: 18px;
        height: 18px;
        border-radius: 3px;
        flex-shrink: 0;
      }
      #${PANEL_ID} .fh-cap-row .fh-cap-count {
        margin-left: auto;
        color: ${TEXT_GRAY};
        white-space: nowrap;
      }
      /* Design tokens. Every colour and radius in the panel comes from here,
         so a tab built later matches without copying hex values around, and
         the tints (a warning row's wash, a tag's border) are mixed from the
         same base rather than hand-picked. */
      #${PANEL_ID} {
        --fh-bg: rgba(16, 17, 19, 0.94);
        --fh-surface: rgba(255, 255, 255, 0.035);
        --fh-surface-2: rgba(255, 255, 255, 0.07);
        --fh-border: rgba(255, 255, 255, 0.08);
        --fh-border-2: rgba(255, 255, 255, 0.14);
        --fh-text: #eceef0;
        --fh-muted: #9aa0a6;
        --fh-ok: ${TEXT_SUCCESS};
        --fh-warn: ${TEXT_WARNING};
        --fh-err: #ff5c5c;
        --fh-accent: #7cc4ff;
        --fh-radius: 12px;
        --fh-radius-s: 8px;
        --fh-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif;

        position: fixed;
        left: ${EDGE_OFFSET};
        bottom: calc(${BOTTOM_OFFSET} + 52px);
        z-index: 5001;
        width: 380px;
        max-width: calc(100vw - 16px);
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        padding: 12px 14px;
        border-radius: var(--fh-radius);
        border: 1px solid var(--fh-border-2);
        background:
          radial-gradient(120% 80% at 0% 0%, rgba(124, 196, 255, 0.06), transparent 60%),
          var(--fh-bg);
        color: var(--fh-text);
        font-family: var(--fh-font);
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        -webkit-backdrop-filter: blur(14px) saturate(1.2);
        backdrop-filter: blur(14px) saturate(1.2);
        opacity: 0;
        transform: translateY(8px) scale(0.985);
        transform-origin: bottom left;
        pointer-events: none;
        transition: opacity 160ms ease, transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
        container-type: inline-size;
        container-name: panel;
      }
      #${PANEL_ID}[data-open="true"] {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      /* Holds the tabs and the body. A column on a phone, exactly as before;
         a row on a wide screen, which turns the tab strip into a vertical
         rail. min-height:0 on both is what lets the body scroll inside a flex
         parent instead of pushing the panel taller. */
      #${PANEL_ID} .fh-briefing-main {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }
      #${PANEL_ID} .fh-briefing-body {
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
        flex: 1 1 auto;
        min-height: 0;
        padding-right: 2px;
      }
      #${PANEL_ID} .fh-briefing-body::-webkit-scrollbar { width: 8px; }
      #${PANEL_ID} .fh-briefing-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.18);
        border-radius: 4px;
      }
      #${PANEL_ID} .fh-briefing-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .fh-briefing-refresh {
        cursor: pointer;
        color: ${TEXT_GRAY};
        font-size: 11px;
      }
      #${PANEL_ID} .fh-briefing-refresh:hover { color: ${TEXT_WHITE}; }
      /* The way to the Farmhand settings from anywhere. On a desktop the
         menu gets you there; on a phone it is the one route that keeps
         going missing, and the panel is always on screen. */
      #${PANEL_ID} .fh-briefing-settings {
        color: ${TEXT_GRAY};
        font-size: 13px;
        line-height: 1;
        text-decoration: none;
      }
      #${PANEL_ID} .fh-briefing-settings:hover { color: ${TEXT_WHITE}; }
      /* How old the numbers are. The panel outlives navigation, so without
         this there is no telling whether it is showing this minute or whatever
         was true when it was opened. Muted: it is a caveat, not a reading. */
      #${PANEL_ID} .fh-briefing-age {
        color: ${TEXT_GRAY};
        font-size: 11px;
        opacity: 0.75;
      }
      #${PANEL_ID} .fh-briefing-controls {
        align-items: center;
        display: flex;
        gap: 8px;
      }
      /* The perk indicator is a button, not a label: its tooltip is the only
         perk diagnostic there is, and a phone cannot show a tooltip. */
      #${PANEL_ID} .fh-perk-chip {
        align-items: center;
        border-radius: 7px;
        cursor: pointer;
        display: flex;
        gap: 5px;
        padding: 3px 5px;
      }
      #${PANEL_ID} .fh-perk-chip:hover,
      #${PANEL_ID} .fh-perk-chip[data-on="true"] {
        background: rgba(255, 255, 255, 0.09);
      }
      #${PANEL_ID} .fh-perk-note {
        display: none;
        color: ${TEXT_GRAY};
        font-size: 11px;
        line-height: 1.4;
        margin: -2px 0 8px;
      }
      #${PANEL_ID} .fh-perk-note[data-on="true"] { display: block; }
      /* The log under the note: one line per perk decision, newest last, so an
         ordering problem (a reconcile landing between a harvest's switch and
         the harvest) is visible as two entries a second apart. */
      #${PANEL_ID} .fh-perk-log {
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 6px;
        margin-top: 4px;
        opacity: 0.85;
      }
      #${PANEL_ID} .fh-perk-log-time {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      #${PANEL_ID} .fh-briefing-tabs {
        display: flex;
        gap: 2px;
        margin-bottom: 10px;
        padding: 3px;
        border-radius: var(--fh-radius-s);
        background: var(--fh-surface);
        border: 1px solid var(--fh-border);
      }
      #${PANEL_ID} .fh-tab {
        flex: 1 1 0;
        text-align: center;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        color: var(--fh-muted);
        background: transparent;
        transition: background 120ms ease, color 120ms ease;
        user-select: none;
        white-space: nowrap;
      }
      #${PANEL_ID} .fh-tab:hover { color: var(--fh-text); }
      #${PANEL_ID} .fh-tab[data-active="true"] {
        color: var(--fh-text);
        background: var(--fh-surface-2);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
      }
      /* The count of things wanting attention in that tab. Muted, because it
         is there to be scanned rather than read. */
      #${PANEL_ID} .fh-tab-count {
        margin-left: 5px;
        font-size: 11px;
        color: ${TEXT_WARNING};
      }
      #${PANEL_ID} .fh-tab[data-active="true"] .fh-tab-count {
        color: ${TEXT_WARNING};
      }

      /* What you are focused on, and the way out of each one. Sits under the
         title so it is present on every tab, not only the one focus was set
         from. Wraps because focus is a list now -- two or three undertakings
         that share a material are the normal case. */
      #${PANEL_ID} .fh-focus-chip {
        display: none;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 8px;
        font-size: 11px;
      }
      #${PANEL_ID} .fh-focus-chip[data-on="true"] { display: flex; }
      #${PANEL_ID} .fh-focus-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        border-radius: 7px;
        border: 1px solid ${TEXT_WARNING};
        color: ${TEXT_WARNING};
        max-width: 100%;
      }
      #${PANEL_ID} .fh-focus-tag > span:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${PANEL_ID} .fh-chip-clear {
        cursor: pointer;
        opacity: 0.75;
        flex: 0 0 auto;
      }
      #${PANEL_ID} .fh-chip-clear:hover { opacity: 1; }
      /* Only appears once focus is a list: clearing three chips one at a time
         is the sort of thing that stops people using focus at all. */
      #${PANEL_ID} .fh-focus-all {
        cursor: pointer;
        color: ${TEXT_GRAY};
        padding: 3px 4px;
      }
      #${PANEL_ID} .fh-focus-all:hover { color: ${TEXT_WHITE}; }
      /* Dimmed, never hidden: a quest that disappeared because you focused
         another is exactly what you would forget about. */
      #${PANEL_ID} .fh-dim {
        opacity: 0.38;
        transition: opacity 160ms ease;
      }
      #${PANEL_ID} .fh-dim:hover { opacity: 0.75; }

      /* Wide screens get a two-pane panel: a vertical rail of sections and a
         content pane. The rail is what removes the four-tab ceiling -- a
         column takes as many entries as we want, where the horizontal strip
         could not fit a fifth at 380px. Below this width nothing changes. */
      @media (min-width: 1024px) {
        #${PANEL_ID} {
          width: 920px;
          max-height: 82vh;
        }
        #${PANEL_ID} .fh-briefing-main {
          flex-direction: row;
          gap: 14px;
        }
        #${PANEL_ID} .fh-briefing-tabs {
          flex: 0 0 148px;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 0;
          padding: 0 12px 0 0;
          background: transparent;
          border: none;
          border-right: 1px solid var(--fh-border);
          border-radius: 0;
        }
        #${PANEL_ID} .fh-tab {
          flex: 0 0 auto;
          text-align: left;
          padding: 7px 10px;
          font-size: 13px;
        }
      }
      /* Phone layout. Everything here is either a thumb target or a
         consequence of there being no hover on touch -- the desktop panel is
         driven by hover states a finger never produces. */
      @media (max-width: ${MOBILE_MAX_WIDTH}px) {
        /* Bottom RIGHT on a phone: that is where the thumb is, and the cap
           tracker (the only other floating thing on that side) is not drawn
           below this width, so the corner is free. */
        #${BUTTON_ID} {
          left: auto;
          right: ${RIGHT_OFFSET};
          width: 48px;
          height: 48px;
        }
        #${PANEL_ID} {
          left: auto;
          right: ${RIGHT_OFFSET};
          width: calc(100vw - 16px);
          /* vh on iOS Safari is the LARGEST viewport, so 70vh can run under the
             URL bar; dvh is the visible one. The fallback above still applies
             where dvh is unsupported. */
          max-height: min(70vh, calc(100dvh - 150px));
        }
        /* 5px of padding is a 22px-tall target. This makes the tab strip
           thumb-sized without changing anything on a desktop. */
        #${PANEL_ID} .fh-tab {
          padding: 10px 8px;
          font-size: 13px;
        }
        #${PANEL_ID} .fh-briefing-refresh {
          font-size: 12px;
          padding: 6px 2px 6px 10px;
        }
        #${PANEL_ID} .fh-briefing-settings {
          font-size: 16px;
          padding: 6px 4px;
        }
        /* The perk chip is the note's only way open on a phone, which is the
           one place the note matters, so it gets a thumb-sized box. */
        #${PANEL_ID} .fh-perk-chip {
          padding: 7px 8px;
        }
        #${PANEL_ID} .fh-perk-note {
          font-size: 12px;
        }
        /* A 14px glyph is not a target. Padding grows the hit box without
           moving the glyph. */
        #${PANEL_ID} .fh-goal-remove,
        #${PANEL_ID} .fh-goal-action,
        #${PANEL_ID} .fh-chip-clear {
          padding: 6px 8px;
          margin: -6px -8px -6px 0;
        }
        #${PANEL_ID} .fh-chip {
          padding: 6px 12px;
          font-size: 12px;
        }
        #${PANEL_ID} .fh-search-input { padding: 10px 12px; font-size: 14px; }
        #${PANEL_ID} .fh-search-kbd { display: none; }
        #${PANEL_ID} .fh-search-row { padding: 9px 8px; font-size: 13px; }
        #${PANEL_ID} .fh-open-here { padding: 4px 9px; font-size: 14px; }
        #${PANEL_ID} .fh-lookup-back { padding: 8px 8px 8px 2px; }
        /* 0.38 relies on hover to read a dimmed row, and touch has no hover.
           Dimmed still reads as secondary at 0.55 but stays legible. */
        #${PANEL_ID} .fh-dim { opacity: 0.55; }
      }
      #${PANEL_ID} .fh-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin: 2px 0 8px;
      }
      #${PANEL_ID} .fh-chip {
        padding: 2px 8px;
        border-radius: 10px;
        border: 1px solid ${BORDER_GRAY};
        font-size: 11px;
        cursor: pointer;
        color: ${TEXT_GRAY};
        user-select: none;
        transition: background 120ms ease, color 120ms ease,
          border-color 120ms ease;
      }
      #${PANEL_ID} .fh-chip:hover { color: ${TEXT_WHITE}; }
      #${PANEL_ID} .fh-chip[data-active="true"] {
        color: ${TEXT_WHITE};
        background: rgba(255, 255, 255, 0.11);
        border-color: #5a5a5a;
      }
      #${PANEL_ID} .fh-goal { margin-bottom: 10px; }
      #${PANEL_ID} .fh-goal-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }
      #${PANEL_ID} .fh-goal-remove {
        cursor: pointer;
        color: #6a6a6a;
        font-size: 14px;
        line-height: 1;
      }
      #${PANEL_ID} .fh-goal-remove:hover { color: ${TEXT_ERROR}; }
      #${PANEL_ID} .fh-bar {
        height: 4px;
        border-radius: 2px;
        background: #2a2a2a;
        margin: 4px 0 3px;
        overflow: hidden;
      }
      #${PANEL_ID} .fh-bar > div {
        height: 100%;
        border-radius: 2px;
        background: ${TEXT_SUCCESS};
        transition: width 200ms ease;
      }

      /* ---- primitives: cards, rows, tags ---------------------------------- */
      #${PANEL_ID} .fh-card {
        background: var(--fh-surface);
        border: 1px solid var(--fh-border);
        border-radius: var(--fh-radius-s);
        padding: 8px 10px 6px;
        margin-bottom: 8px;
        content-visibility: auto;
        contain-intrinsic-size: auto 80px;
      }
      #${PANEL_ID} .fh-card[data-tone="err"] {
        border-color: color-mix(in srgb, var(--fh-err) 35%, transparent);
        background: color-mix(in srgb, var(--fh-err) 7%, var(--fh-surface));
      }
      #${PANEL_ID} .fh-card[data-tone="warn"] {
        border-color: color-mix(in srgb, var(--fh-warn) 30%, transparent);
      }
      #${PANEL_ID} .fh-card[data-tone="ok"] {
        border-color: color-mix(in srgb, var(--fh-ok) 30%, transparent);
      }
      #${PANEL_ID} .fh-card-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: var(--fh-muted);
        margin-bottom: 4px;
      }
      #${PANEL_ID} .fh-card-aside {
        font-weight: 500;
        letter-spacing: 0;
        text-transform: none;
        font-variant-numeric: tabular-nums;
      }
      #${PANEL_ID} .fh-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 9px;
        padding: 5px 4px;
        margin: 0 -4px;
        border-radius: 6px;
        color: var(--fh-text);
        text-decoration: none;
        font-size: 12px;
        line-height: 1.35;
      }
      #${PANEL_ID} a.fh-row:hover { background: var(--fh-surface-2); }
      #${PANEL_ID} .fh-row + .fh-row {
        border-top: 1px solid var(--fh-border);
        border-radius: 0 0 6px 6px;
      }
      #${PANEL_ID} .fh-row[data-tone="err"] .fh-row-title { color: var(--fh-err); }
      #${PANEL_ID} .fh-row[data-tone="warn"] .fh-row-title { color: var(--fh-warn); }
      #${PANEL_ID} .fh-row[data-tone="ok"] .fh-row-title { color: var(--fh-ok); }
      #${PANEL_ID} .fh-row[data-tone="muted"] { opacity: 0.6; }
      #${PANEL_ID} .fh-row-icon {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 6px;
        background: var(--fh-surface-2);
        overflow: hidden;
      }
      #${PANEL_ID} .fh-row-icon:empty { visibility: hidden; }
      #${PANEL_ID} .fh-row-icon img { width: 22px; height: 22px; display: block; }
      #${PANEL_ID} .fh-row-main { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
      #${PANEL_ID} .fh-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #${PANEL_ID} .fh-row-title a { color: inherit; }
      #${PANEL_ID} .fh-row-sub { font-size: 11px; color: var(--fh-muted); }
      #${PANEL_ID} .fh-row-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
      #${PANEL_ID} .fh-row-aside {
        font-size: 11px;
        color: var(--fh-muted);
        text-align: right;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      #${PANEL_ID} .fh-row-aside strong { color: var(--fh-text); font-weight: 600; }
      #${PANEL_ID} .fh-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 1px 7px;
        border-radius: 999px;
        font-size: 10.5px;
        line-height: 16px;
        color: var(--fh-muted);
        border: 1px solid var(--fh-border-2);
        background: var(--fh-surface);
        text-decoration: none;
        white-space: nowrap;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${PANEL_ID} a.fh-tag:hover { border-color: var(--fh-text); color: var(--fh-text); }
      #${PANEL_ID} .fh-tag[data-tone="ok"] {
        color: var(--fh-ok);
        border-color: color-mix(in srgb, var(--fh-ok) 45%, transparent);
        background: color-mix(in srgb, var(--fh-ok) 10%, transparent);
      }
      #${PANEL_ID} .fh-tag[data-tone="warn"] {
        color: var(--fh-warn);
        border-color: color-mix(in srgb, var(--fh-warn) 45%, transparent);
        background: color-mix(in srgb, var(--fh-warn) 10%, transparent);
      }
      #${PANEL_ID} .fh-tag[data-tone="err"] {
        color: var(--fh-err);
        border-color: color-mix(in srgb, var(--fh-err) 45%, transparent);
        background: color-mix(in srgb, var(--fh-err) 10%, transparent);
      }
      #${PANEL_ID} .fh-tag[data-tone="accent"] {
        color: var(--fh-accent);
        border-color: color-mix(in srgb, var(--fh-accent) 45%, transparent);
        background: color-mix(in srgb, var(--fh-accent) 10%, transparent);
      }
      #${PANEL_ID} .fh-empty {
        color: var(--fh-muted);
        font-size: 12px;
        padding: 6px 2px;
      }
      /* Key figures in a strip: stamina banked, silver and xp per hit. */
      #${PANEL_ID} .fh-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
        gap: 6px;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .fh-stat {
        background: var(--fh-surface);
        border: 1px solid var(--fh-border);
        border-radius: var(--fh-radius-s);
        padding: 6px 9px;
      }
      #${PANEL_ID} .fh-stat-label {
        font-size: 10px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--fh-muted);
      }
      #${PANEL_ID} .fh-stat-value {
        font-size: 15px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: var(--fh-text);
      }
      /* The location header: icon, name, type. */
      #${PANEL_ID} .fh-place {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .fh-place img {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: var(--fh-surface-2);
      }
      #${PANEL_ID} .fh-place-name { font-size: 14px; font-weight: 600; color: var(--fh-text); }
      #${PANEL_ID} .fh-place-name a { color: inherit; text-decoration: none; }
      #${PANEL_ID} .fh-place-sub { font-size: 11px; color: var(--fh-muted); }
      /* Icon grids (the Cap tab's "drops here"). */
      #${PANEL_ID} .fh-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 2px 0 4px;
      }
      #${PANEL_ID} .fh-grid-item {
        display: block;
        line-height: 0;
        border-radius: 8px;
        border: 2px solid var(--fh-warn);
        background: var(--fh-surface-2);
        transition: transform 120ms ease;
      }
      #${PANEL_ID} .fh-grid-item:hover { transform: translateY(-1px); }
      #${PANEL_ID} .fh-grid-item[data-at-cap="true"] { border-color: var(--fh-err); }
      #${PANEL_ID} .fh-grid-item img { width: 30px; height: 30px; border-radius: 6px; display: block; }
      #${PANEL_ID} .fh-foot {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-top: 6px;
        font-size: 11px;
        color: var(--fh-muted);
      }
      #${PANEL_ID} .fh-link { cursor: pointer; text-decoration: underline; color: var(--fh-muted); }
      #${PANEL_ID} .fh-link:hover { color: var(--fh-text); }
      /* ---- search + lookup ------------------------------------------------ */
      #${PANEL_ID} .fh-search {
        position: relative;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .fh-search-input {
        width: 100%;
        box-sizing: border-box;
        padding: 7px 58px 7px 10px;
        border-radius: var(--fh-radius-s);
        border: 1px solid var(--fh-border-2);
        background: var(--fh-surface);
        color: var(--fh-text);
        font: 12.5px var(--fh-font);
        outline: none;
        transition: border-color 120ms ease, background 120ms ease;
      }
      #${PANEL_ID} .fh-search-input::placeholder { color: var(--fh-muted); }
      #${PANEL_ID} .fh-search-input:focus {
        border-color: color-mix(in srgb, var(--fh-accent) 60%, transparent);
        background: var(--fh-surface-2);
      }
      #${PANEL_ID} .fh-search-input::-webkit-search-cancel-button { -webkit-appearance: none; }
      #${PANEL_ID} .fh-search-kbd {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font: 10px var(--fh-font);
        color: var(--fh-muted);
        border: 1px solid var(--fh-border-2);
        border-radius: 5px;
        padding: 1px 5px;
        pointer-events: none;
      }
      #${PANEL_ID} .fh-search-input:focus ~ .fh-search-kbd { opacity: 0; }
      #${PANEL_ID} .fh-search-results {
        display: none;
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + 4px);
        z-index: 2;
        max-height: 320px;
        overflow-y: auto;
        padding: 4px;
        border-radius: var(--fh-radius-s);
        border: 1px solid var(--fh-border-2);
        background: rgba(22, 23, 26, 0.98);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
      }
      #${PANEL_ID} .fh-search-results[data-on="true"] { display: block; }
      #${PANEL_ID} .fh-search-row {
        display: grid;
        grid-template-columns: 22px 1fr auto;
        align-items: center;
        gap: 8px;
        padding: 5px 7px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        color: var(--fh-text);
      }
      #${PANEL_ID} .fh-search-row[data-active="true"] { background: var(--fh-surface-2); }
      #${PANEL_ID} .fh-search-row img { width: 20px; height: 20px; border-radius: 4px; }
      #${PANEL_ID} .fh-search-row img:not([src]) { visibility: hidden; }
      #${PANEL_ID} .fh-search-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #${PANEL_ID} .fh-search-kind { font-size: 10px; color: var(--fh-muted); text-transform: uppercase; letter-spacing: 0.4px; }
      #${PANEL_ID} .fh-lookup-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 12px;
      }
      #${PANEL_ID} .fh-lookup-back {
        cursor: pointer;
        color: var(--fh-accent);
        padding: 4px 6px 4px 2px;
        border-radius: 6px;
      }
      #${PANEL_ID} .fh-lookup-back:hover { background: var(--fh-surface-2); }
      #${PANEL_ID} .fh-lookup-kind {
        font-size: 10px;
        color: var(--fh-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      #${PANEL_ID} .fh-open-here {
        display: inline-block;
        margin-left: 6px;
        padding: 0 5px;
        border-radius: 5px;
        cursor: pointer;
        color: var(--fh-muted);
        opacity: 0.7;
      }
      #${PANEL_ID} .fh-open-here:hover {
        color: var(--fh-accent);
        background: var(--fh-surface-2);
        opacity: 1;
      }
      #${PANEL_ID} .fh-briefing-body { view-transition-name: fh-briefing-body; }
      ::view-transition-old(fh-briefing-body),
      ::view-transition-new(fh-briefing-body) {
        animation-duration: 140ms;
      }
      @media (prefers-reduced-motion: reduce) {
        #${PANEL_ID}, #${BUTTON_ID}, #${PANEL_ID} * { transition: none !important; }
        ::view-transition-group(*),
        ::view-transition-old(*),
        ::view-transition-new(*) { animation: none !important; }
      }
    </style>`
  );
};
