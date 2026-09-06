// Resolve to undefined instead of rejecting.
//
// Every caller here is decorating the page with extra detail — a drop location,
// a queue read — so a failed lookup should leave that detail out, not take the
// whole panel down with it. Written once because the lint rule against a bare
// `undefined` return and TypeScript's refusal to accept `void` in its place
// cannot both be satisfied inline.
export const orUndefined = <T>(promise: Promise<T>): Promise<T | undefined> =>
  // eslint-disable-next-line unicorn/no-useless-undefined
  promise.catch(() => undefined);
