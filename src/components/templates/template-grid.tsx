"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { mockupKind } from "@/components/templates/story-mockup";
import { TemplateCard } from "@/components/templates/template-card";
import { EASE_OUT } from "@/lib/motion";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

/**
 * Reorders templates so neighbours look different: no two side by side (or
 * one apart, or right above each other in the grid) share a colour theme or a picture style. Keeps the original order
 * wherever it can, and relaxes the rules only when nothing else fits.
 */
function spreadOut(list: Template[]) {
  const rest = [...list];
  const out: Template[] = [];
  const colour = (t: Template) => t.palette.bg;
  // Also the card right above it, in a 2-, 3- or 4-across grid.
  const above = () => [out[out.length - 2], out[out.length - 3], out[out.length - 4]].filter(Boolean);
  const rules: ((t: Template) => boolean)[] = [
    (t) =>
      out.slice(-2).every((o) => colour(o) !== colour(t) && mockupKind(o) !== mockupKind(t)) &&
      above().every((o) => colour(o) !== colour(t)),
    (t) => out.slice(-2).every((o) => colour(o) !== colour(t) && mockupKind(o) !== mockupKind(t)),
    (t) => out.slice(-1).every((o) => colour(o) !== colour(t) && mockupKind(o) !== mockupKind(t)),
    (t) => out.slice(-1).every((o) => colour(o) !== colour(t)),
    () => true,
  ];
  while (rest.length) {
    let pick = -1;
    for (const ok of rules) {
      pick = rest.findIndex(ok);
      if (pick !== -1) break;
    }
    out.push(...rest.splice(pick, 1));
  }
  return out;
}

/**
 * Templates in rows: two across on phones, three on tablets, four on desktop.
 */
export function TemplateGrid({ templates: given, variant = "all" }: { templates: Template[]; variant?: "all" | "featured" }) {
  const templates = useMemo(() => spreadOut(given), [given]);
  if (templates.length === 0) {
    return (
      <p className="type-display py-24 text-center text-3xl text-muted">
        New designs for this occasion are on their way.
      </p>
    );
  }

  return (
    <div>
      <ul
        className={cn(
          // Two across on phones, three on tablets, four on desktop.
          "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4",
        )}
      >
        <AnimatePresence mode="popLayout">
          {templates.map((t, i) => (
            <motion.li
              key={t.slug}
              id={t.slug}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: Math.min(i, 6) * 0.05 }}
              // The home page shows six on phones and tablets (full rows of
              // two or three) and eight on desktop (two rows of four).
              className={cn("min-w-0", variant === "featured" && i >= 6 && "hidden lg:block")}
            >
              <TemplateCard template={t} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
