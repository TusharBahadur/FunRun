"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

/** Asks who the gift is for and who it's from. Blank answers keep the current names. */
export function NamesDialog({
  open,
  to,
  from,
  accent,
  submitLabel,
  onSave,
  onClose,
}: {
  open: boolean;
  submitLabel: string;
  to: string;
  from: string;
  accent: string;
  onSave: (to: string, from: string) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && <Dialog to={to} from={from} accent={accent} submitLabel={submitLabel} onSave={onSave} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Dialog({
  to: initialTo,
  from: initialFrom,
  accent,
  submitLabel,
  onSave,
  onClose,
}: Omit<Parameters<typeof NamesDialog>[0], "open">) {
  const [to, setTo] = useState(initialTo);
  const [from, setFrom] = useState(initialFrom);
  const toRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave(to.trim(), from.trim());
  }

  const input =
    "mt-1.5 block min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none placeholder:text-muted/60 focus:border-ink/40";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal
        aria-labelledby="names-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-cream shadow-float"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onAnimationComplete={() => toRef.current?.focus()}
      >
        <div className="h-1.5" style={{ backgroundColor: accent }} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-4 grid size-9 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink"
        >
          <X className="size-4" />
        </button>
        <form onSubmit={submit} className="px-6 pb-6 pt-5">
          <h2 id="names-title" className="type-heading pr-8 text-2xl">
            Who’s this gift for?
          </h2>
          <p className="mt-1 text-sm text-muted">Their name goes on every page. You can change it later.</p>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-base font-medium">To</span>
              <input ref={toRef} value={to} onChange={(e) => setTo(e.target.value)} maxLength={30} placeholder="Their name" autoComplete="off" className={input} />
            </label>
            <label className="block">
              <span className="text-base font-medium">From</span>
              <input value={from} onChange={(e) => setFrom(e.target.value)} maxLength={30} placeholder="Your name" autoComplete="off" className={input} />
            </label>
          </div>
          <button
            type="submit"
            className="mt-6 h-12 w-full rounded-full text-base font-medium text-paper hover:brightness-105"
            style={{ backgroundColor: accent }}
          >
            {submitLabel}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
