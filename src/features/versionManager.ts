import { CHANGELOG_URL, latestVersionState, SCRIPT_URL } from "~/api/fork/api";
import { corsFetch } from "~/utils/requests";
import { Feature } from "~/utils/feature";
import {
  Handler,
  NotificationId,
  registerNotificationHandler,
  removeNotification,
  sendNotification,
} from "~/utils/notifications";
import { showPopup } from "~/utils/popup";

// created by DefinePlugin in webpack
declare const __VERSION__: string | undefined;

const isVersion = (version: string): boolean => version.split(".").length === 3;

const normalizeVersion = (version: string): string => version.split("-")[0];

// Compares release numbers the way you'd read them aloud: the first part that
// differs decides, and a missing part counts as zero. The old version returned
// true as soon as ANY part of the candidate was larger, whatever its position,
// so 1.0.31 counted as newer than 1.1.0 — which is how this fork ended up being
// offered an "update" to the upstream script it was forked from.
const isVersionHigher = (test: string, current: string): boolean => {
  const testParts = test.split(".").map(Number);
  const currentParts = current.split(".").map(Number);
  const length = Math.max(testParts.length, currentParts.length);
  for (let index = 0; index < length; index++) {
    const testPart = testParts[index] ?? 0;
    const currentPart = currentParts[index] ?? 0;
    if (testPart !== currentPart) {
      return testPart > currentPart;
    }
  }
  return false;
};

const currentVersion = normalizeVersion(__VERSION__ ?? "1.0.0");

registerNotificationHandler(Handler.CHANGES, async () => {
  const response = await corsFetch(CHANGELOG_URL);
  const htmlString = await response.text();
  const document = new DOMParser().parseFromString(htmlString, "text/html");
  const body = document.querySelector(".markdown-body");
  if (!body) {
    console.error("Failed to get README body");
    return;
  }
  let contentHTML = "";
  for (const child of body.children) {
    if (child.classList.contains("markdown-heading")) {
      const version = normalizeVersion(child.textContent ?? "1.0.0");
      if (isVersion(version) && isVersionHigher(version, currentVersion)) {
        contentHTML += `
          <h2>${version}</h2>
          <ul>${child.nextElementSibling?.innerHTML}</ul>
        `;
      }
    }
  }
  showPopup({ title: "Farmhand Changelog", contentHTML, align: "left" });
});

registerNotificationHandler(Handler.UPDATE, () => window.open(SCRIPT_URL));

export const versionManager: Feature = {
  onInitialize: async () => {
    const latestVersion = await latestVersionState.get();
    if (!latestVersion) {
      console.error("Failed to get latest version");
      return;
    }
    if (isVersionHigher(latestVersion, currentVersion)) {
      sendNotification({
        class: "btnblue",
        id: NotificationId.UPDATE,
        text: `Farmhand update available: ${currentVersion} → ${latestVersion}`,
        actions: [
          {
            text: "View Changes",
            handler: Handler.CHANGES,
          },
          {
            text: "Update",
            handler: Handler.UPDATE,
          },
        ],
      });
    } else {
      removeNotification(NotificationId.UPDATE);
    }
  },
};
