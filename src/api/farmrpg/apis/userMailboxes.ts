import { CachedState, StorageKey } from "../../../utils/state";
import { getCardByTitle, Page } from "../../../utils/page";
import { getDocument } from "../../../utils/requests";
import { getHTML } from "../utils/requests";
import { User, userState } from "./users";

export interface Mailbox {
  id: string;
  username: string;
  // undefined when the page doesn't state a capacity, so callers can leave it
  // out instead of showing a made-up number
  capacity?: number;
  lookingFor: string;
  timestamp: number;
}

// `user` is who the page was requested for, when that's known. The id and name
// are read from the page first, but falling back to the requested player means a
// change to the mailbox page's own markup costs us the capacity line at worst,
// rather than the whole mailbox.
const processMailbox = (root: Document, user?: User): Mailbox | undefined => {
  const idField = root.querySelector<HTMLInputElement>("#mb_to_id");
  const id = idField?.value || user?.id;
  if (!id) {
    return;
  }
  const profileLink =
    root.querySelector<HTMLAnchorElement>("a[href^='profile']");
  const [, queryString] = profileLink?.getAttribute("href")?.split("?") ?? [];
  const username =
    new URLSearchParams(queryString).get("user_name") ?? user?.username;
  if (!username) {
    return;
  }
  const cards = root.querySelectorAll(".card");
  let capacity: number | undefined;
  for (const card of cards) {
    // This mailbox has 36 / 1,800 items in it currently.
    const match = card.textContent?.match(
      /This mailbox has [\d,]+ \/ ([\d,]+) items in it currently/
    );
    if (!match) {
      continue;
    }
    const [_, max] = match;
    capacity = Number(max.replaceAll(",", ""));
    break;
  }
  const lookingFor =
    getCardByTitle("Looking For", root.body)?.textContent ?? "";
  const timestamp = Date.now();
  return {
    id,
    username,
    capacity,
    lookingFor,
    timestamp,
  };
};

export const playerMailboxState = new CachedState<Mailbox, string>(
  StorageKey.PLAYER_MAILBOXES,
  async (state, userName) => {
    const previous = state.read(userName);
    if (previous) {
      return previous;
    }
    if (!userName) {
      return;
    }
    const user = await userState.get({ query: userName });
    if (!user) {
      return;
    }
    const response = await getHTML(
      Page.MAILBOX,
      new URLSearchParams({ id: user.id })
    );
    return processMailbox(response, user);
  },
  {
    persist: true,
    // seconds — see the note in users.ts; this was under 3 hours, not a week
    timeout: 60 * 60 * 24, // 1 day
    interceptors: [
      {
        match: [Page.MAILBOX, new URLSearchParams()],
        callback: async (state, previous, response) => {
          const mailbox = processMailbox(await getDocument(response));
          if (!mailbox) {
            return;
          }
          await state.set(mailbox, mailbox.username);
        },
      },
    ],
  }
);
