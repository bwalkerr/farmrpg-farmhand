import {
  collectAll,
  KitchenStatus,
  kitchenStatusState,
  OvenStatus,
} from "~/api/farmrpg/apis/kitchen";
import { Feature, FeatureSetting, SettingValues } from "../utils/feature";
import {
  Handler,
  NotificationId,
  registerNotificationHandler,
  removeNotification,
  sendNotification,
} from "~/utils/notifications";
import { Page } from "~/utils/page";
import { SettingId } from "~/utils/settings";
import { toUrl } from "~/api/farmrpg/utils/requests";

const SETTING_COMPLETE_NOTIFICATIONS: FeatureSetting = {
  id: SettingId.KITCHEN_COMPLETE_NOTIFICATIONS,
  title: "Kitchen: Meals ready notification",
  description: `
    Show notification when meals are ready to collect
  `,
  type: "boolean",
  defaultValue: true,
};

const SETTING_ATTENTION_NOTIFICATIONS: FeatureSetting = {
  id: SettingId.ATTENTION_NOTIFICATIONS,
  title: "Kitchen: Ovens attention notification",
  description: `
    Show notification when ovens need attention
  `,
  type: "boolean",
  defaultValue: true,
};

const SETTING_ATTENTION_VERBOSE: FeatureSetting = {
  id: SettingId.ATTENTION_NOTIFICATIONS_VERBOSE,
  title: "Kitchen: Ovens attention notification (all actions)",
  description: `
    Show notifications when any oven needs attention for any action
    (normally only shows when all three actions are available for all ovens)
  `,
  type: "boolean",
  defaultValue: false,
};

const SETTING_EMPTY_NOTIFICATIONS: FeatureSetting = {
  id: SettingId.KITCHEN_EMPTY_NOTIFICATIONS,
  title: "Kitchen: Ovens empty notification",
  description: `
    Show notification when ovens are empty
  `,
  type: "boolean",
  defaultValue: true,
};

registerNotificationHandler(Handler.COLLECT_MEALS, collectAll);

// timestamp of the last kitchen page check for oven ownership
let lastOvenCountCheckAt = 0;

const renderOvens = async (
  settings: SettingValues,
  state: KitchenStatus | undefined
): Promise<void> => {
  if (!state) {
    return;
  }
  if (
    state.status === OvenStatus.EMPTY &&
    settings[SettingId.KITCHEN_EMPTY_NOTIFICATIONS]
  ) {
    // zero ovens means the kitchen isn't unlocked yet, so there is nothing to
    // cook; confirm against the kitchen page (throttled) before notifying
    let hasOvens = (state.count ?? 0) > 0;
    if (!hasOvens && Date.now() - lastOvenCountCheckAt > 5 * 60 * 1000) {
      lastOvenCountCheckAt = Date.now();
      const kitchenState = await kitchenStatusState.get();
      hasOvens = Boolean(kitchenState && (kitchenState.count ?? 0) > 0);
    }
    if (!hasOvens) {
      removeNotification(NotificationId.OVEN);
      return;
    }
    sendNotification({
      class: "btnorange",
      id: NotificationId.OVEN,
      text: "Ovens are empty!",
      href: toUrl(Page.KITCHEN, new URLSearchParams()),
      excludePages: [Page.KITCHEN],
    });
  } else if (
    state.status === OvenStatus.ATTENTION &&
    settings[SettingId.ATTENTION_NOTIFICATIONS]
  ) {
    // This re-read the state it had just been handed, from inside that state's
    // own update listener, to decide something the condition above has already
    // decided: the test was `settings[ATTENTION_NOTIFICATIONS] || allReady`
    // inside a branch that requires ATTENTION_NOTIFICATIONS, so it was always
    // true. (It reads as an attempt to honour the "all actions" setting, which
    // is a separate matter — see SETTING_ATTENTION_VERBOSE, still unused.)
    sendNotification({
      class: "btnorange",
      id: NotificationId.OVEN,
      text: "Ovens need attention",
      href: toUrl(Page.KITCHEN, new URLSearchParams()),
      excludePages: [Page.KITCHEN],
    });
  } else if (
    state.status === OvenStatus.READY &&
    settings[SettingId.KITCHEN_COMPLETE_NOTIFICATIONS]
  ) {
    sendNotification({
      class: "btngreen",
      id: NotificationId.OVEN,
      text: "Meals are ready!",
      href: toUrl(Page.KITCHEN, new URLSearchParams()),
      actions: [
        { text: "View", href: toUrl(Page.KITCHEN, new URLSearchParams()) },
        {
          text: "Collect",
          handler: Handler.COLLECT_MEALS,
        },
      ],
      excludePages: [Page.KITCHEN],
    });
  } else {
    removeNotification(NotificationId.OVEN);
  }
};

export const kitchenNotifications: Feature = {
  settings: [
    SETTING_COMPLETE_NOTIFICATIONS,
    SETTING_ATTENTION_NOTIFICATIONS,
    SETTING_ATTENTION_VERBOSE,
    SETTING_EMPTY_NOTIFICATIONS,
  ],
  onInitialize: (settings) => {
    kitchenStatusState.onUpdate((state) => renderOvens(settings, state));
  },
};
