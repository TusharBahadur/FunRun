"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { occasions, type OccasionId } from "@/config/site";
import { cn } from "@/lib/utils";

const items: { id?: OccasionId; label: string }[] = [{ label: "All" }, ...occasions];

export function OccasionFilter({ active }: { active?: OccasionId }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
      {items.map((o) => {
        const isActive = o.id === active;
        return (
          <Link
            key={o.label}
            href={o.id ? `/templates?occasion=${o.id}` : "/templates"}
            scroll={false}
            className={cn(
              "relative shrink-0 rounded-full border border-ink/10 px-4 py-2 text-sm transition-colors duration-300",
              isActive ? "text-paper" : "text-ink/70 hover:border-ink/25 hover:text-ink",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="occasion-pill"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
