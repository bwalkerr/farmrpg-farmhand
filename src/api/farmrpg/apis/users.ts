import { CachedState, StorageKey } from "../../../utils/state";
import { getCardByTitle, Page } from "../../../utils/page";
import { getDocument } from "../../../utils/requests";
import { getHTML } from "../utils/requests";

export interface User {
  id: string;
  bio: string;
  username: string;
  colorClass: string;
  emblem: string;
  timestamp: number;
}

// The profile page carries the player's id in the Add Friend button, and — on
// the rebuilt profile page, which has no such button — in the link to their
// mailbox. Both are checked, so this works on old and current markup, and on a
// profile fetched without a session (where the social buttons aren't rendered).
const getUserId = (root: Document): string | undefined => {
  const addFriendId =
    root.querySelector<HTMLAnchorElement>(".addfriendbtn")?.dataset.id;
  if (addFriendId) {
    return addFriendId;
  }
  const mailboxLink = root.querySelector<HTMLAnchorElement>(
    "a[href*='mailbox.php?id=']"
  );
  const [, queryString] = mailboxLink?.getAttribute("href")?.split("?") ?? [];
  return new URLSearchParams(queryString).get("id") ?? undefined;
};

// The username used to be a .sharelink; the rebuilt profile page shows it as a
// copy-the-@mention link instead.
const getNameLink = (root: Document): Element | null =>
  root.querySelector(".sharelink") ?? root.querySelector(".copy-to-clipboard");

const processProfile = (root: Document): User | undefined => {
  const id = getUserId(root);
  if (!id) {
    return;
  }
  const nameLink = getNameLink(root);
  if (!nameLink) {
    return;
  }
  const username = nameLink.textContent?.trim();
  if (!username) {
    return;
  }
  const colorClass = nameLink.parentElement?.className ?? "";
  const bioCard = getCardByTitle("Public Bio", root.body);
  const bio = bioCard?.textContent ?? "";
  const image = root.querySelector<HTMLDivElement>("#img");
  const emblem = image?.querySelector<HTMLImageElement>("img")?.src ?? "";
  const timestamp = Date.now();
  return {
    id,
    bio,
    username,
    colorClass,
    emblem,
    timestamp,
  };
};

export const userState = new CachedState<User, string>(
  StorageKey.PLAYERS,
  async (state, userName) => {
    const previous = state.read(userName);
    if (previous) {
      return previous;
    }
    if (!userName) {
      return;
    }
    const response = await getHTML(
      Page.PROFILE,
      new URLSearchParams({ user_name: userName.replaceAll(" ", "+") })
    );
    return await processProfile(response);
  },
  {
    persist: true,
    timeout: 60 * 24 * 7, // 1 week
    interceptors: [
      {
        match: [Page.PROFILE, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const user = processProfile(await getDocument(response));
          if (!user) {
            return;
          }
          await state.set(user, user.username);
        },
      },
    ],
  }
);
