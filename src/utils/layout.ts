// Where the game switches to its phone layout. 767px is the breakpoint the
// fork's own navigation styles already use, so anything keyed off this agrees
// with what the rest of the script considers "mobile".
//
// This matters because the bottom stats bar is a fundamentally different space
// on the two layouts. On a desktop there's room past the currency counts for
// anything we want to add. On a phone the bar holds the counts and the game's
// own home and chat buttons and nothing more — so an addition either fits in a
// few characters or doesn't belong there at all.
export const MOBILE_MAX_WIDTH = 767;

const query = (): MediaQueryList =>
  window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);

export const isMobileLayout = (): boolean => query().matches;

// Fires when the layout crosses the breakpoint — rotating a phone, or dragging a
// desktop window narrow. Anything that renders differently on the two layouts
// has to repaint here, or it keeps whatever shape it happened to mount in.
export const onLayoutChange = (listener: () => void): void => {
  query().addEventListener("change", listener);
};
