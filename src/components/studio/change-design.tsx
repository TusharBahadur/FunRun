"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { occasions } from "@/config/site";
import type { Template } from "@/lib/templates";
import { cn, formatInr } from "@/lib/utils";
import { TemplatePreview } from "@/components/templates/template-preview";

const levelName = { little: "Little", classic: "Classic", grand: "Grand" } as const;

/** Browse other designs for the same occasion without leaving the studio. */
export function ChangeDesign({
  open,
  onClose,
  currentSlug,
  designs,
  to,
  from,
}: {
  open: boolean;
  onClose: () => void;
  currentSlug: string;
  designs: Template[];
  to: string;
  from: string;
}) {
  const occasion = occasions.find((o) => o.id === designs[0]?.occasion);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const names = new URLSearchParams();
  if (to) names.set("to", to);
  if (from) names.set("from", from);
  const q = names.toString();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/30 p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="designs-title"
            className="flex h-[min(86vh,720px)] w-[min(96vw,920px)] flex-col overflow-hidden rounded-[1.6rem] bg-cream shadow-float"
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-line px-6 py-4">
              <div>
                <p id="designs-title" className="font-semibold">Change design</p>
                <p className="text-xs text-muted">
                  {occasion ? `${occasion.label} templates` : "Templates for this occasion"}
                  {" · "}Your work on the current one stays on this device.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-lg hover:bg-paper">
                <X className="size-4" />
              </button>
            </div>
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {designs.map((t) => {
                  const current = t.slug === currentSlug;
                  const href = `/studio/${t.slug}${q ? `?${q}` : ""}`;
                  const inner = (
                    <>
                      <div className="overflow-hidden rounded-[1.35rem] ring-2 ring-transparent">
                        <TemplatePreview template={t} />
                      </div>
                      <div className="mt-3 flex items-baseline justify-between gap-2 px-0.5">
                        <p className="type-heading truncate text-base">{t.name}</p>
                        <span className="type-label shrink-0 text-[10px] text-muted">{formatInr(t.pricePaise)}</span>
                      </div>
                      <p className="type-label mt-1 px-0.5 text-[10px] text-muted">
                        {t.level ? levelName[t.level] : t.story?.format === "site" ? "Website" : "Gift"}
                        {current ? " · Editing" : ""}
                      </p>
                    </>
                  );
                  return current ? (
                    <div key={t.slug} className="relative text-left">
                      <span className="absolute right-2 top-2 z-10 flex h-7 items-center gap-1 rounded-full bg-ink px-2.5 text-xs font-medium text-paper">
                        <Check className="size-3.5" /> This one
                      </span>
                      <div className={cn("rounded-[1.5rem] ring-2 ring-ink")}>{inner}</div>
                    </div>
                  ) : (
                    <Link key={t.slug} href={href} className="text-left transition-opacity hover:opacity-90">
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
