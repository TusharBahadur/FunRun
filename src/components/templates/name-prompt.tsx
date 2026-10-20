"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NamePromptProps {
  /** The template slug to navigate to after collecting names. */
  slug: string;
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Template accent color for theming. */
  accent?: string;
  /** Template background color. */
  bg?: string;
}

/**
 * A modal that asks the sender for "To" and "From" names before
 * navigating to the template detail / studio page.
 */
export function NamePrompt({ slug, open, onClose, accent = "#e23b54", bg = "#fbf8f3" }: NamePromptProps) {
  const router = useRouter();
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const toRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (to.trim()) params.set("to", to.trim());
      if (from.trim()) params.set("from", from.trim());
      const qs = params.toString();
      router.push(`/templates/${slug}${qs ? `?${qs}` : ""}`);
      onClose();
    },
    [to, from, slug, router, onClose],
  );

  const handleSkip = useCallback(() => {
    router.push(`/templates/${slug}`);
    onClose();
  }, [slug, router, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-float border border-line/60"
            style={{ backgroundColor: bg }}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onAnimationComplete={() => toRef.current?.focus()}
          >
            {/* Accent strip */}
            <div className="h-2" style={{ backgroundColor: accent }} />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-ink"
            >
              <X className="size-4" />
            </button>

            <form onSubmit={handleSubmit} className="px-7 pb-7 pt-6">
              <h2 className="type-display text-2xl font-semibold">Who is this gift for?</h2>
              <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-muted">
                Add their name to preview your personalized gift
              </p>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="type-label text-muted">To (recipient&apos;s name)</span>
                  <input
                    ref={toRef}
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="e.g. Maya"
                    className={cn(
                      "mt-1.5 block w-full rounded-xl border border-line bg-paper px-4 py-3 font-serif text-lg",
                      "placeholder:text-muted/50 focus:border-transparent focus:outline-none focus:ring-2",
                    )}
                    style={{ "--tw-ring-color": accent } as React.CSSProperties}
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <span className="type-label text-muted">From (your name)</span>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="e.g. Sam"
                    className={cn(
                      "mt-1.5 block w-full rounded-xl border border-line bg-paper px-4 py-3 font-serif text-lg",
                      "placeholder:text-muted/50 focus:border-transparent focus:outline-none focus:ring-2",
                    )}
                    style={{ "--tw-ring-color": accent } as React.CSSProperties}
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="mt-7 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-full py-3.5 text-center font-medium text-paper transition-all hover:brightness-105 active:scale-95 shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  Continue →
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-full border border-line px-5 py-3.5 text-sm font-medium text-muted transition-colors hover:bg-line/40 hover:text-ink"
                >
                  Skip
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
