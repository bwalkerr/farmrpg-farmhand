import { getData, setData } from "~/utils/settings";

// Which undertaking you are working through right now, or none.
//
// Its own key rather than a setting: it changes many times a day, it is state
// rather than preference, and two surfaces read it. Persisted because a quest
// is days of work, not one sitting -- the panel should come back where you left
// it rather than making you re-pick every time you open it.
const FOCUS_KEY = "farmhandFocus";

interface FocusData {
  scopeId?: string;
}

export const getFocusedScope = async (): Promise<string | undefined> => {
  const { scopeId } = await getData<FocusData>(FOCUS_KEY, {});
  return typeof scopeId === "string" && scopeId.length > 0
    ? scopeId
    : undefined;
};

export const setFocusedScope = async (
  scopeId: string | undefined
): Promise<void> => {
  await setData<FocusData>(FOCUS_KEY, scopeId ? { scopeId } : {});
};
