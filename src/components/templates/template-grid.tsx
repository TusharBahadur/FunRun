"use client";

import { AnimatePresence, motion } from "motion/react";
import { TemplateCard } from "@/components/templates/template-card";
import { EASE_OUT } from "@/lib/motion";
import type { Template } from "@/lib/templates";

export function TemplateGrid({ templates }: { templates: Template[] }) {
  if (templates.length === 0) {
    return (
      <p className="type-display py-24 text-center text-3xl text-muted">
        New designs for this occasion are on their way.
      </p>
    );
  }

  return (
    <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {templates.map((t, i) => (
          <motion.li
            key={t.slug}
            id={t.slug}
            layout
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.05 }}
          >
            <TemplateCard template={t} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
