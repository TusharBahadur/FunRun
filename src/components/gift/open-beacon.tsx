"use client";

import { useEffect } from "react";

const key = (slug: string) => `tynitales:opened:${slug}`;

/** Marks a gift as the sender's own, so opening it from their browser isn't counted. */
export function markOwnGift(slug: string) {
  try {
    localStorage.setItem(key(slug), "own");
  } catch {
    /* storage blocked: their open may be counted once */
  }
}

/** Tells the sender their gift was opened: once per browser. */
export function OpenBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      if (localStorage.getItem(key(slug))) return;
      localStorage.setItem(key(slug), new Date().toISOString());
    } catch {
      return;
    }
    fetch(`/api/gifts/${slug}/open`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
