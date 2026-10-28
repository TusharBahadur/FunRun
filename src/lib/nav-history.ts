"use client";

/**
 * How many pages this tab has shown since the site was loaded, counting
 * in-app navigations. Lets a "Back" button know whether going back stays
 * inside TyniTales.
 *
 * Counted by watching history.pushState (what Next uses for in-app links),
 * so nothing has to read the URL while rendering. Reading it there forced a
 * Suspense boundary at the root, which broke hydration.
 */
let pagesSeen = 1;
let tracking = false;

export function trackNavigations() {
  if (tracking || typeof window === "undefined") return;
  tracking = true;
  const push = history.pushState.bind(history);
  history.pushState = (...args: Parameters<History["pushState"]>) => {
    pagesSeen++;
    return push(...args);
  };
}

export function canGoBackInApp() {
  if (pagesSeen > 1) return true;
  // Arrived by a full page load from another TyniTales page.
  try {
    return !!document.referrer && new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}
