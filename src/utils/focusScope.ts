import { getData, setData } from "~/utils/settings";

// Which undertakings you are working through right now, or none.
//
// Its own key rather than a setting: it changes many times a day, it is state
// rather than preference, and several surfaces read it. Persisted because a
// quest is days of work, not one sitting -- the panel should come back where
// you left it rather than making you re-pick every time you open it.
//
// A LIST, not one id: real progress is usually two or three things sharing a
// material -- a quest, the mastery tier it feeds, and the queue slot that makes
// the part. Focusing one at a time made the panel argue with how the game is
// actually played.
const FOCUS_KEY = "farmhandFocus";

interface FocusData {
  // written since multi-focus
  scopeIds?: string[];
  // the single-focus key, read for what is already in storage
  scopeId?: string;
}

// Reads the pre-multi single id too, so a focus set before this change survives
// the upgrade rather than silently clearing.
export const getFocusedScopes = async (): Promise<string[]> => {
  const { scopeId, scopeIds } = await getData<FocusData>(FOCUS_KEY, {});
  let stored: unknown[] = [];
  if (Array.isArray(scopeIds)) {
    stored = scopeIds;
  } else if (typeof scopeId === "string") {
    stored = [scopeId];
  }
  return [
    ...new Set(
      stored.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.length > 0
      )
    ),
  ];
};

export const setFocusedScopes = async (scopeIds: string[]): Promise<void> => {
  const unique = [...new Set(scopeIds.filter((entry) => entry.length > 0))];
  await setData<FocusData>(
    FOCUS_KEY,
    unique.length > 0 ? { scopeIds: unique } : {}
  );
};
