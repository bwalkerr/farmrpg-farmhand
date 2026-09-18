// A short in-page log of what the script itself did: which start-up phases
// completed, which dispatches ran, which hooks failed. The panel shows it
// under the perk note.
//
// It exists because a phone has no console. Every mobile-only report so far
// ("works on the web, not on the phone") has come down to guessing which of
// the start-up steps or page dispatches never happened there, with nothing on
// screen to say. This is the something.

export interface DiagnosticEntry {
  at: number;
  text: string;
}

const LIMIT = 40;
const entries: DiagnosticEntry[] = [];
const listeners: (() => void)[] = [];

export const getDiagnostics = (): readonly DiagnosticEntry[] => entries;

export const onDiagnostic = (listener: () => void): void => {
  listeners.push(listener);
};

export const logDiagnostic = (text: string): void => {
  entries.push({ at: Date.now(), text });
  if (entries.length > LIMIT) {
    entries.shift();
  }
  console.debug(`[Farmhand] ${text}`);
  for (const listener of listeners) {
    listener();
  }
};

export const describeError = (error: unknown): string =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

// Same as logDiagnostic, and to the console as an error.
export const logFailure = (text: string, error: unknown): void => {
  console.error(`[Farmhand] ${text}`, error);
  logDiagnostic(`${text}: ${describeError(error)}`);
};
