"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Sheet } from "@/components/ui/sheet";
import type { DraftSummary } from "@/lib/drafts";

/** Asks who the gift is for and who it's from. Blank answers keep the current names. */
export function NamesDialog({
  open,
  to,
  from,
  accent,
  submitLabel,
  resume,
  onResume,
  onSave,
  onClose,
}: {
  open: boolean;
  submitLabel: string;
  /** A draft of this template they could carry on with instead. */
  resume?: DraftSummary | null;
  onResume?: (d: DraftSummary) => void;
  to: string;
  from: string;
  accent: string;
  onSave: (to: string, from: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy="names-title" z={100} width="w-full max-w-md">
      <Dialog to={to} from={from} accent={accent} submitLabel={submitLabel} resume={resume} onResume={onResume} onSave={onSave} onClose={onClose} />
    </Sheet>
  );
}

function Dialog({
  to: initialTo,
  from: initialFrom,
  accent,
  submitLabel,
  resume,
  onResume,
  onSave,
  onClose,
}: Omit<Parameters<typeof NamesDialog>[0], "open">) {
  const [fresh, setFresh] = useState(false);
  const [to, setTo] = useState(initialTo);
  const [from, setFrom] = useState(initialFrom);
  const toRef = useRef<HTMLInputElement>(null);

  const asking = !!resume && !fresh;
  useEffect(() => {
    if (asking) return;
    const id = setTimeout(() => toRef.current?.focus(), 350);
    return () => clearTimeout(id);
  }, [asking]);

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
        {asking && resume ? (
          <div className="px-6 pb-6 pt-1 sm:pt-5">
            <h2 id="names-title" className="type-heading pr-8 text-2xl">
              Continue your gift for {resume.recipient}?
            </h2>
            <p className="mt-1 text-sm text-muted">You started one from this template {editedAgo(resume.updatedAt)}.</p>
            <button
              type="button"
              onClick={() => onResume?.(resume)}
              className="btn btn-tint mt-6 h-12 w-full text-base"
              style={{ "--btn-bg": accent } as React.CSSProperties}
            >
              Continue
            </button>
            <button type="button" onClick={() => setFresh(true)} className="btn btn-paper mt-2 h-12 w-full text-base">
              Start a new one
            </button>
          </div>
        ) : (
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
        )}
    </div>
  );
}

const ago = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
function editedAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return ago.format(-Math.max(1, mins), "minute");
  const hours = Math.round(mins / 60);
  if (hours < 24) return ago.format(-hours, "hour");
  return ago.format(-Math.round(hours / 24), "day");
}
