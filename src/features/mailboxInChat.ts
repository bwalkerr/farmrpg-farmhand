import { BACKGROUND_DARK, BORDER_GRAY } from "~/utils/theme";
import { Feature, FeatureSetting } from "../utils/feature";
import { playerMailboxState } from "~/api/farmrpg/apis/userMailboxes";
import { SettingId } from "~/utils/settings";
import { userState } from "~/api/farmrpg/apis/users";

const SETTING_CHAT_MAILBOX_STATS: FeatureSetting = {
  id: SettingId.CHAT_MAILBOX_STATS,
  title: "Chat: Mailbox Size",
  description: "Show mailbox Size next to usernames in chat",
  type: "boolean",
  defaultValue: true,
};

const renderInfoPopup = async (
  userElement: HTMLAnchorElement,
  username: string
): Promise<void> => {
  const formatter = new Intl.NumberFormat();
  const user = await userState.get({ query: username });
  const mailbox = await playerMailboxState.get({ query: username });
  if (userElement.dataset.popup !== "open") {
    return;
  }
  // The mailbox page and the profile page are read separately, and either can
  // come back unreadable when the game changes its markup. Rather than showing
  // nothing at all — which looks exactly like a broken hover — show whichever
  // details did load, and say so when none did.
  if (!user && !mailbox) {
    return;
  }
  const wrapper = userElement.parentElement;
  if (!wrapper) {
    return;
  }
  wrapper.style.position = "relative";
  const infoPopup = document.createElement("div");
  infoPopup.classList.add("fh-mailbox-info");
  infoPopup.style.display = "flex";
  infoPopup.style.flexDirection = "column";
  infoPopup.style.alignItems = "start";
  infoPopup.style.gap = "5px";
  infoPopup.style.padding = "5px";
  infoPopup.style.position = "absolute";
  infoPopup.style.backgroundColor = BACKGROUND_DARK;
  infoPopup.style.borderWidth = "1px";
  infoPopup.style.borderStyle = "solid";
  infoPopup.style.borderColor = BORDER_GRAY;
  infoPopup.style.top = "15px";
  infoPopup.style.left = "0px";
  infoPopup.style.zIndex = "9999";
  infoPopup.style.width = "200px";
  infoPopup.style.fontWeight = "normal";
  infoPopup.style.whiteSpace = "normal";
  infoPopup.style.pointerEvents = "none";
  const rows: [string, string][] = [];
  if (mailbox?.capacity !== undefined) {
    rows.push(["Mailbox", formatter.format(mailbox.capacity)]);
  }
  if (mailbox?.lookingFor) {
    rows.push(["Looking For", mailbox.lookingFor]);
  }
  if (user?.bio) {
    rows.push(["Bio", user.bio]);
  }
  if (rows.length === 0) {
    rows.push(["No details", "this player's profile couldn't be read"]);
  }
  for (const [label, value] of rows) {
    const row = document.createElement("div");
    const labelElement = document.createElement("strong");
    labelElement.textContent = `${label}: `;
    row.append(labelElement);
    // as text, not markup — bios and Looking For are written by players
    row.append(document.createTextNode(value));
    infoPopup.append(row);
  }
  userElement.after(infoPopup);
};

const openInfoPopup = async (userElement: HTMLAnchorElement): Promise<void> => {
  closeInfoPopups();
  const username = userElement.textContent;
  if (!username) {
    return;
  }
  userElement.classList.add("fh-mailbox-info-loading");
  try {
    await renderInfoPopup(userElement, username);
  } catch (error) {
    // a failed profile or mailbox read used to leave the label stuck on the
    // name, so a hover looked like it was loading forever
    console.error(`Failed to load chat info for ${username}`, error);
  } finally {
    userElement.classList.remove("fh-mailbox-info-loading");
  }
};

const closeInfoPopups = (): void => {
  for (const popup of document.querySelectorAll(".fh-mailbox-info")) {
    popup.remove();
  }
};

export const chatMailboxStats: Feature = {
  settings: [SETTING_CHAT_MAILBOX_STATS],
  onInitialize: (settings) => {
    if (!settings[SettingId.CHAT_MAILBOX_STATS]) {
      return;
    }
    document.head.insertAdjacentHTML(
      "beforeend",
      `
        <style>
          .chip-label {
            overflow: visible !important;
          }
          .fh-mailbox-info-loading::before {
            content: "(loading...) ";
            font-size: 10px;
            color: white;
          }
        </style>
      `
    );
  },
  onChatLoad: (settings) => {
    // make sure setting is enabled
    if (!settings[SettingId.CHAT_MAILBOX_STATS]) {
      return;
    }
    const users = document.querySelectorAll<HTMLAnchorElement>(
      `.chip a[href^='profile.php']`
    );
    for (const userElement of users) {
      if (userElement?.dataset.initialized) {
        continue;
      }
      // This guard was never armed: nothing set `initialized`, and onChatLoad
      // runs on every mutation of the chat panel — so each new message re-bound
      // all five handlers to every name still on screen. Hovering an older name
      // then ran the popup once per accumulated copy, and each touch queued
      // another long-press timer.
      userElement.dataset.initialized = "true";
      userElement.addEventListener("mouseover", () => {
        userElement.dataset.popup = "open";
        openInfoPopup(userElement);
      });
      let timer: NodeJS.Timeout;
      userElement.addEventListener("touchstart", () => {
        userElement.dataset.popup = "open";
        timer = setTimeout(() => {
          openInfoPopup(userElement);
          userElement.dataset.ignoreClick = "true";
        }, 500);
      });
      userElement.addEventListener("touchend", () => {
        clearTimeout(timer);
      });
      userElement.addEventListener("mouseout", () => {
        userElement.dataset.popup = "closed";
        closeInfoPopups();
      });
      userElement.addEventListener("click", (event) => {
        if (userElement.dataset.ignoreClick) {
          event.preventDefault();
          delete userElement.dataset.ignoreClick;
        }
      });
      userElement.addEventListener("contextmenu", (event) => {
        if (userElement.dataset.ignoreClick) {
          event.preventDefault();
          delete userElement.dataset.ignoreClick;
        }
      });
    }
  },
};
