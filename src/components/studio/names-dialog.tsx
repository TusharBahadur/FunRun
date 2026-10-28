"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Sheet } from "@/components/ui/sheet";

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
    <Sheet open={open} onClose={onClose} labelledBy="names-title" z={100} width="w-full max-w-md">
      <Dialog to={to} from={from} accent={accent} submitLabel={submitLabel} onSave={onSave} onClose={onClose} />
    </Sheet>
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
    const id = setTimeout(() => toRef.current?.focus(), 350);
    return () => clearTimeout(id);
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave(to.trim(), from.trim());
  }

  const input =
    "mt-1.5 block min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none placeholder:text-muted/60 focus:border-ink/40";

  return (
    <div className="relative">
        <div className="hidden h-1.5 sm:block" style={{ backgroundColor: accent }} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-0 grid size-9 sm:top-4 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink"
        >
          <X className="size-4" />
        </button>
        <form onSubmit={submit} className="px-6 pb-6 pt-1 sm:pt-5">
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
            className="btn btn-tint mt-6 h-12 w-full text-base"
            style={{ "--btn-bg": accent } as React.CSSProperties}
          >
            {submitLabel}
          </button>
        </form>
    </div>
  );
}
