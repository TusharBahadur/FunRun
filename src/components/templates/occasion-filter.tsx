"use client";

import { motion } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { occasions, type OccasionId } from "@/config/site";
import { cn } from "@/lib/utils";

const items: { id?: OccasionId; label: string }[] = [{ label: "All" }, ...occasions];

/**
 * Occasion filters as soft pills: hairline outlines, and a rose-tinted pill
 * that glides to the one you're on. On phones the row scrolls sideways,
 * fading at the edges so it's clear there's more.
 */
export function OccasionFilter({ active }: { active?: OccasionId }) {
  const ref = useRef<HTMLElement>(null);

  // Switching occasion keeps the scroll position, but a shorter list can leave
  // that position past the end of the page (straight onto the footer). If the
  // filters end up off-screen, bring them back to just under the header.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight) {
      window.scrollTo({ top: window.scrollY + top - 96, behavior: "instant" });
    }
  }, [active]);

  return (
    <nav ref={ref} aria-label="Occasions" className="relative -mx-5 scroll-mt-24 sm:mx-0">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-1 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-32px),transparent)] sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none]">
        {items.map((o) => {
          const isActive = o.id === active;
          return (
            <li key={o.label} className="shrink-0">
              <Link
                href={o.id ? `/templates/for/${o.id}` : "/templates"}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-9 items-center rounded-full border px-4 text-sm transition-colors duration-300",
                  isActive
                    ? "border-transparent font-medium text-rose-deep"
                    : "border-ink/10 bg-white/60 text-ink/65 hover:border-ink/20 hover:text-ink",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="occasion-pill"
                    className="absolute inset-0 rounded-full bg-rose/10 ring-1 ring-rose/25"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{o.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
