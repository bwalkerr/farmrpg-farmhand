import { Feature } from "./feature";
import { getCurrentPage, getHashPage } from "~/utils/page";
import { isObject } from "./object";

const KEY_NOTIFICATIONS = "notifications";

export enum NotificationId {
  FIELD = "field",
  MAILBOX = "mailbox",
  MEAL = "meal",
  OVEN = "oven",
  PERKS = "perks",
  PETS = "pets",
  UPDATE = "update",
}

export enum Handler {
  CHANGES = "updateChanges",
  COLLECT_MAIL = "collectMail",
  COLLECT_MEALS = "collectMeals",
  COLLECT_PETS = "collectPets",
  HARVEST = "harvest",
  UPDATE = "update",
}

interface TextNotification<T> {
  class?: string;
  id: NotificationId;
  text: string;
  data?: T;
  replacesHref?: string;
  actions?: NotificationAction[];
  excludePages?: string[];
}

interface BaseNotificationAction {
  text: string;
}

interface HandlerNotificationAction extends BaseNotificationAction {
  handler: Handler;
}

interface LinkNotificationAction extends BaseNotificationAction {
  href: string;
}

type NotificationAction = HandlerNotificationAction | LinkNotificationAction;

const isHandlerNotificationAction = (
  action: NotificationAction
): action is HandlerNotificationAction => "handler" in action;

interface LinkNotification<T> extends TextNotification<T> {
  href: string;
}

interface HandlerNotification<T> extends TextNotification<T> {
  handler: Handler;
}

export type Notification<T> =
  | LinkNotification<T>
  | HandlerNotification<T>
  | TextNotification<T>;

const isHandlerNotification = <T>(
  notification: Notification<T>
): notification is HandlerNotification<T> => "handler" in notification;

const isLinkNotification = <T>(
  notification: Notification<T>
): notification is LinkNotification<T> => "href" in notification;

const isTextNotification = <T>(
  notification: Notification<T>
): notification is TextNotification<T> =>
  !isHandlerNotification(notification) && !isLinkNotification(notification);

type NotificationHandler = (notification: Notification<any>) => void;

const state: { notifications: Notification<any>[] } = {
  notifications: [],
};

const notificationHandlers = new Map<Handler, NotificationHandler>();

export const registerNotificationHandler = (
  handlerName: Handler,
  handler: (notification: Notification<any>) => void
): void => {
  notificationHandlers.set(handlerName, handler);
};

export const sendNotification = <T>(notification: Notification<T>): void => {
  state.notifications = [
    ...state.notifications.filter(({ id }) => id !== notification.id),
    notification,
  ];
  renderNotifications(true);
};

export const removeNotification = (
  notification: Notification<any> | Notification<any>["id"]
): void => {
  const notificationId = isObject(notification)
    ? notification.id
    : notification;
  state.notifications = state.notifications.filter(
    ({ id }) => id !== notificationId
  );
  renderNotifications();
};

// What a banner should look like on the page: its id, colour, text and the
// labels of its actions. Stamped onto the element as it's drawn, so a later
// render can tell whether the page already shows the current state instead of
// just counting how many banners are on it.
const toSignature = (notification: Notification<any>): string =>
  [
    notification.id,
    notification.class ?? "",
    notification.text,
    ...(notification.actions?.map((action) => action.text) ?? []),
  ].join("|");

const renderNotifications = (force: boolean = false): void => {
  const pageContent = getCurrentPage()?.querySelector(".page-content");
  if (!pageContent) {
    console.error("Page content not found");
    return;
  }

  // What belongs on THIS page. Excluded notifications used to be skipped from
  // inside the render loop with a `return`, which — since notifications render
  // in id order — also dropped every notification sorted after the excluded
  // one: on the farm page, where "field" is excluded, that silently killed the
  // oven, meal, pets and update banners too. Filtering up front fixes that, and
  // gives the no-op check below the right number to compare against (against
  // the unfiltered total it could never match on a page with an exclusion, so
  // every render wiped and rebuilt every banner).
  //
  // A notification is excluded if EITHER signal says we are on its own page: the
  // page element's `data-page`, or the route in the address bar. Matching on
  // `data-page` alone means one attribute the game is free to rename decides
  // whether "Meals are ready!" is hidden while you are standing in the kitchen —
  // and when it doesn't match, the banner nags about work you are already there
  // to do. The perk code stopped trusting that attribute by itself for the same
  // reason.
  const currentPage = getCurrentPage();
  const pageIds = new Set([currentPage?.dataset.page, getHashPage()]);
  const visibleNotifications = state.notifications
    .filter(
      ({ excludePages }) => !excludePages?.some((page) => pageIds.has(page))
    )
    .toSorted((a, b) => a.id.localeCompare(b.id) || 0);

  // Skip the rebuild only if what's on the page is what we would draw. This
  // compared the NUMBER of banners before, which the game's own navigation
  // defeats: Framework7 keeps the page you came from in the DOM, banners and
  // all, and re-shows that same element when you go back — so a page you return
  // to arrives carrying the banners it had when you left. Same count, so the
  // render bailed out and the old text stayed: "Crops are ready!" after you
  // harvested, "Ovens need attention" after you attended to them. Whichever
  // banner was on the page you keep coming back to looked frozen in time, which
  // is why this seemed to be about one page rather than all of them.
  const notifications =
    pageContent.querySelectorAll<HTMLElement>(".fh-notification");
  // Sorted on both sides so this doesn't quietly depend on the order the elements
  // go in below (they're prepended, which reverses them). The order itself comes
  // from the id sort above, so it can't change unless the set does.
  const rendered = [...notifications]
    .map((element) => element.dataset.fhSignature ?? "")
    .toSorted()
    .join("");
  const expected = visibleNotifications
    .map((notification) => toSignature(notification))
    .toSorted()
    .join("");
  if (!force && rendered === expected) {
    return;
  }
  for (const notification of notifications) {
    notification.remove();
  }

  // add new notifications
  for (const notification of visibleNotifications) {
    // replace native notification if relevant
    if (notification.replacesHref) {
      const link = currentPage?.querySelector<HTMLAnchorElement>(
        `a[href="${notification.replacesHref}"]`
      );
      if (link?.classList?.contains("button")) {
        link.remove();
      }
      if (link?.parentElement?.classList?.contains("button")) {
        link.parentElement.remove();
      }
    }

    const notificationElement = document.createElement(
      isTextNotification(notification) ? "span" : "a"
    );
    notificationElement.classList.add("button");
    notificationElement.classList.add("fh-notification");
    notificationElement.style.cursor = isTextNotification(notification)
      ? "default"
      : "pointer";
    if (notification.class) {
      notificationElement.classList.add(notification.class);
    }
    notificationElement.textContent = notification.text;
    notificationElement.dataset.fhSignature = toSignature(notification);
    if (isHandlerNotification(notification)) {
      notificationElement.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const handler = notificationHandlers.get(notification.handler);
        if (handler) {
          await handler(notification);
        } else {
          console.error(`Handler not found: ${notification.handler}`);
        }
        removeNotification(notification);
        renderNotifications();
      });
    } else if (isLinkNotification(notification)) {
      notificationElement.setAttribute("href", notification.href);
    }

    for (const action of notification.actions ?? []) {
      notificationElement.append(
        document.createTextNode(
          notification.actions?.indexOf(action) === 0 ? " " : " / "
        )
      );
      const actionElement = document.createElement("a");
      actionElement.classList.add("fh-notification-action");
      actionElement.style.cursor = "pointer";
      actionElement.textContent = action.text;

      if (isHandlerNotificationAction(action)) {
        actionElement.addEventListener("click", async (event) => {
          actionElement.textContent = "Loading...";
          event.preventDefault();
          event.stopPropagation();
          const handler = notificationHandlers.get(action.handler);
          if (handler) {
            await handler(notification);
          } else {
            console.error(`Handler not found: ${action.handler}`);
          }
          renderNotifications();
        });
      } else {
        actionElement.href = action.href;
      }
      notificationElement.append(actionElement);
    }

    if (
      pageContent.firstElementChild?.classList.contains("pull-to-refresh-layer")
    ) {
      pageContent.insertBefore(notificationElement, pageContent.children[1]);
    } else {
      pageContent.prepend(notificationElement);
    }
  }
};

export const notifications: Feature = {
  onPageLoad: () => {
    setTimeout(renderNotifications, 500);
  },
};
