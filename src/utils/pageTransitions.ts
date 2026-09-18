// Fires after the game slides a different page into view -- forward OR back.
//
// The childList dispatch in index.ts only sees a page element being ADDED,
// and going back adds nothing: Framework7 keeps the page you came from in the
// DOM and re-shows it by changing its class. Watching the class catches every
// transition. Same observer shape as utils/notifications.ts and the perk
// reconciler, kept as one helper here for anything else that needs to notice
// you moved.
//
// Debounced, because a transition changes the class several times (leaving,
// entering, settled) and mid-transition the hash has already moved while the
// page swap has not landed. The last change is the settled one, so a listener
// that reads the page always gets the final state.
export const onPageTransition = (
  listener: () => void,
  debounceMs = 100,
  attempt = 0
): void => {
  const pages = document.querySelector(".view-main .pages");
  if (!pages) {
    // Registered from an initializer, this can run before the shell is in the
    // DOM. Try again for a while rather than silently never watching.
    if (attempt < 40) {
      setTimeout(
        () => onPageTransition(listener, debounceMs, attempt + 1),
        500
      );
    } else {
      console.error("Pages not found");
    }
    return;
  }
  let timeout: number | undefined;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Only a page's own class, never a descendant's: with subtree watching,
      // classes set on anything inside the page would otherwise fire this too.
      if ((mutation.target as HTMLElement).matches?.(".page")) {
        clearTimeout(timeout);
        timeout = setTimeout(listener, debounceMs) as unknown as number;
        return;
      }
    }
  });
  observer.observe(pages, {
    attributeFilter: ["class"],
    attributes: true,
    subtree: true,
  });
};
