import { Feature, FeatureSetting } from "../utils/feature";
import { getCurrentPage, Page } from "~/utils/page";
import { SettingId } from "~/utils/settings";

const SETTING_QUICKSELL_SAFELY: FeatureSetting = {
  id: SettingId.QUICKSELL_SAFELY,
  title: "Item: Safe Quick Sell",
  description:
    "If item is locked, also lock the Quick Sell and Quick Give buttons",
  type: "boolean",
  defaultValue: true,
};

// Which button the gate is being asked about. Sell and give come from this
// file; "craft" comes from the quick-craft proxy in perkManagement.ts, which
// shares this gate's vocabulary — the three need different perks (selling and
// crafting need the consolidated set; giving is covered by Default too), so a
// gate must be able to tell them apart.
export type QuickAction = "sell" | "give" | "craft";

// A gate WRAPS the native click rather than merely being consulted before it:
// it is handed `fire`, and the button is only pressed if and when the gate
// calls it. That is what lets the perk manager hold the perk queue across the
// sale instead of switching perks, returning, and hoping nothing switches them
// back before the game's own request goes out. A gate that never calls `fire`
// blocks the action, which is the old "return false" contract.
//
// ONE gate, replacing a list of callbacks that was appended to per page load
// and never cleared — every navigation stacked another copy and one quick-sell
// fired the perk swap once per accumulated copy (fixed once by moving
// registration to module scope; a single slot makes it unrepeatable).
export type QuicksellGate = (
  action: QuickAction,
  fire: () => void
) => Promise<void>;

let quicksellGate: QuicksellGate | undefined;

export const setQuicksellGate = (gate: QuicksellGate): void => {
  quicksellGate = gate;
};

const fireQuickAction = async (
  action: QuickAction,
  fire: () => void
): Promise<void> => {
  if (!quicksellGate) {
    fire();
    return;
  }
  await quicksellGate(action, fire);
};

export const quicksellSafely: Feature = {
  settings: [SETTING_QUICKSELL_SAFELY],
  onPageLoad: (settings, page) => {
    // make sure we're on the right page
    if (page !== Page.ITEM) {
      return;
    }

    const isSafetyOn = settings[SettingId.QUICKSELL_SAFELY];
    const lockButton =
      getCurrentPage()?.querySelector<HTMLButtonElement>(".lockbtn");
    const unlockButton =
      getCurrentPage()?.querySelector<HTMLButtonElement>(".unlockbtn");
    const isLocked = unlockButton && !lockButton;

    const quicksellButton = getCurrentPage()?.querySelector<HTMLButtonElement>(
      ".quicksellbtn, .quicksellbtnnc"
    );
    if (quicksellButton && !quicksellButton.style.display) {
      quicksellButton.style.display = "none";
      const proxyButton = document.createElement("button");
      proxyButton.classList.add("button");
      proxyButton.classList.add(isSafetyOn && isLocked ? "btnred" : "btngreen");
      proxyButton.style.height = "28px;";
      if (!isSafetyOn || !isLocked) {
        proxyButton.textContent = "SELL";
      }
      if (isSafetyOn && isLocked) {
        const lock = document.createElement("i");
        lock.classList.add("f7-icons");
        lock.style.fontSize = "17px";
        lock.textContent = "unlock_fill";
        proxyButton.append(lock);
      }
      proxyButton.addEventListener("click", async () => {
        if (isSafetyOn && isLocked) {
          unlockButton.click();
          return;
        }
        await fireQuickAction("sell", () => quicksellButton.click());
      });
      quicksellButton.parentElement?.insertBefore(proxyButton, quicksellButton);
    }
    const quickgiveButton =
      getCurrentPage()?.querySelector<HTMLButtonElement>(".quickgivebtn");
    if (quickgiveButton && !quickgiveButton.style.display) {
      quickgiveButton.style.display = "none";
      const proxyButton = document.createElement("button");
      proxyButton.classList.add("button");
      proxyButton.classList.add(isSafetyOn && isLocked ? "btnred" : "btngreen");
      proxyButton.style.height = "28px;";
      if (!isSafetyOn || !isLocked) {
        proxyButton.textContent = "GIVE";
      }
      if (isSafetyOn && isLocked) {
        const lock = document.createElement("i");
        lock.classList.add("f7-icons");
        lock.style.fontSize = "17px";
        lock.textContent = "unlock_fill";
        proxyButton.append(lock);
      }
      proxyButton.addEventListener("click", async () => {
        if (isSafetyOn && isLocked) {
          unlockButton.click();
          return;
        }
        await fireQuickAction("give", () => quickgiveButton.click());
      });
      quickgiveButton.parentElement?.insertBefore(proxyButton, quickgiveButton);
    }
  },
};
