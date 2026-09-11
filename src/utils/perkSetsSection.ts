import {
  activatePerkSet,
  getPerkStatus,
  PerkActivity,
  PerkSet,
} from "~/api/farmrpg/apis/perks";
import { BooleanFeatureSetting } from "~/utils/feature";
import {
  getSetting,
  getSettings,
  setSetting,
  SettingId,
} from "~/utils/settings";
import { makeHeading, makeLinkedLine } from "~/utils/gameLinks";
import {
  TEXT_ERROR,
  TEXT_GRAY,
  TEXT_SUCCESS,
  TEXT_WARNING,
} from "~/utils/theme";

// The perk-set block that used to sit at the top of the briefing panel's Sets
// tab: every saved set with the one that is on marked, the auto-manage toggle,
// and the diagnostics for why a switch is not happening. Pulled out of the
// panel on 2026-09-10 -- auto switching works, so the list was a wall of rows
// nobody pressed -- but kept whole, and standalone, because the moment auto
// switching is doubted again this is the only view of it that exists on a
// phone. Drop it into any container: it renders into `body` and calls `reload`
// when it changes something the caller is showing.
//
// Switching is forced, because the reason to reach for it by hand is that the
// automatic switch is not being trusted -- and the fast path would otherwise
// no-op on the very state in doubt.
export const renderPerkSets = (
  body: HTMLElement,
  perkSets: readonly PerkSet[],
  reload: () => void
): void => {
  if (perkSets.length === 0) {
    return;
  }
  const status = getPerkStatus();
  body.append(makeHeading("Perk sets"));

  // Auto manage is repeated here, not only on the game's settings page, for two
  // reasons: that page is genuinely hard to reach on a phone, and this is the
  // one setting whose being off is indistinguishable from the reconciler being
  // broken -- manual equipping below still works, because it calls
  // activatePerkSet directly and never consults the setting.
  const autoSetting = getSettings().find(
    (setting): setting is BooleanFeatureSetting =>
      setting.id === SettingId.PERK_MANAGER && setting.type === "boolean"
  );
  if (autoSetting) {
    const row = document.createElement("div");
    row.style.alignItems = "center";
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.marginBottom = "5px";
    const label = document.createElement("span");
    label.style.fontSize = "11px";
    const toggle = document.createElement("a");
    toggle.href = "#";
    toggle.style.color = TEXT_GRAY;
    toggle.style.fontSize = "11px";
    toggle.style.marginLeft = "auto";
    toggle.style.textDecoration = "underline";
    const paintAuto = (isOn: boolean): void => {
      label.textContent = `Auto manage: ${isOn ? "on" : "off"}`;
      label.style.color = isOn ? TEXT_SUCCESS : TEXT_WARNING;
      toggle.textContent = isOn ? "turn off" : "turn on";
    };
    paintAuto(Boolean(autoSetting.defaultValue));
    getSetting(autoSetting)
      .then((current) => {
        paintAuto(Boolean(current.value));
      })
      .catch((error) => {
        console.error("Failed to read the perk auto-manage setting", error);
      });
    toggle.addEventListener("click", async (event) => {
      event.preventDefault();
      const current = await getSetting(autoSetting);
      const next = !current.value;
      toggle.textContent = "saving…";
      await setSetting({ ...autoSetting, value: next });
      paintAuto(next);
      // turning it on should take effect where you are, not at the next
      // navigation -- otherwise it reads as not having worked
      reload();
    });
    row.append(label, toggle);
    body.append(row);
  }

  if (status.note) {
    body.append(makeLinkedLine(TEXT_GRAY, [status.note]));
  }

  // Activity sets are matched by NAME, case-insensitively and exactly, so a set
  // called "explore" or "def" is invisible to the reconciler while still being
  // perfectly equippable by hand below. Without a set named "Default" the
  // reconciler bails before it switches anything at all, which looks exactly
  // like auto manage being broken -- so say so here rather than leave it to be
  // deduced.
  const activityNames = new Set(
    Object.values(PerkActivity)
      .filter((activity) => activity !== PerkActivity.UNKNOWN)
      .map((activity) => activity.toLowerCase())
  );
  const isActivityName = (name: string): boolean =>
    activityNames.has(name.trim().toLowerCase());
  if (!perkSets.some((set) => isActivityName(set.name))) {
    body.append(
      makeLinkedLine(TEXT_ERROR, [
        "none of these names match an activity — nothing can auto-switch",
      ])
    );
  } else if (
    !perkSets.some((set) => set.name.trim().toLowerCase() === "default")
  ) {
    body.append(
      makeLinkedLine(TEXT_ERROR, [
        'no set named "Default" — the reconciler stops before it switches',
      ])
    );
  }

  for (const set of perkSets) {
    const isOn = status.isConfirmed && status.name === set.name;
    const row = document.createElement("div");
    row.className = "fh-goal-top";
    row.style.marginBottom = "5px";
    const label = makeLinkedLine(isOn ? TEXT_SUCCESS : TEXT_GRAY, [
      `${set.name}${isOn ? " · on" : ""}${
        isActivityName(set.name) ? "" : " · manual only"
      }`,
    ]);
    label.style.marginBottom = "0";
    row.append(label);
    if (!isOn) {
      const action = document.createElement("a");
      action.href = "#";
      action.style.color = TEXT_SUCCESS;
      action.style.fontSize = "12px";
      action.style.textDecoration = "underline";
      action.textContent = "equip";
      action.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        action.textContent = "equipping…";
        action.style.color = TEXT_GRAY;
        try {
          await activatePerkSet(set, { force: true, settle: true });
          reload();
        } catch {
          action.textContent = "failed — try again";
          action.style.color = TEXT_ERROR;
        }
      });
      row.append(action);
    }
    body.append(row);
  }
};
