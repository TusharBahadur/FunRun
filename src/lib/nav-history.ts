"use client";

/**
 * How many pages this tab has shown since the site was loaded, counting
 * in-app navigations. Lets a "Back" button know whether going back stays
 * inside TyniTales.
 */
let pagesSeen = 0;

export function notePageView() {
  pagesSeen++;
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
