"use client";

import { Check, CloudOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { inAppBrowser } from "@/lib/in-app-browser";
import { cn } from "@/lib/utils";

/** null: nothing to save yet (no changes). */
export type SaveState = null | "saving" | "device" | "account" | "failed";

/**
 * Next to Undo: whether the gift is saved, and where. Tapping "on this device"
 * explains what that means and offers sign-in.
 */
export function SaveStatus({ state, onRetry, onSignIn }: { state: SaveState; onRetry: () => void; onSignIn: () => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // Inside Instagram (and the like), "this device" isn't quite true: it's that app's browser.
  const [app, setApp] = useState<string | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setApp(inAppBrowser()), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  if (!state) return null;

  if (state === "failed") {
    return (
      <button type="button" onClick={onRetry} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-rose-deep hover:bg-paper">
        <CloudOff className="size-3.5" />
        <span className="hidden sm:inline">Couldn’t save ·</span> Retry
      </button>
    );
  }

  const where = app ? `in ${app === "this app" ? "this app" : `${app}’s browser`}` : "on this device";
  const label = state === "saving" ? "Saving…" : state === "account" ? "Saved to your account" : `Saved ${where}`;
  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        onClick={() => state === "device" && setOpen((o) => !o)}
        aria-label={label}
        title={label}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs text-muted",
          state === "device" ? "cursor-pointer hover:bg-paper hover:text-ink" : "cursor-default",
        )}
      >
        {state === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        <span className="hidden whitespace-nowrap md:inline">{label}</span>
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-50 w-64 rounded-2xl border border-line bg-paper p-4 text-sm shadow-[0_20px_40px_-20px_rgba(27,18,21,.45)]">
          <p className="font-medium">Saved {where} only.</p>
          <p className="mt-1 text-muted">Sign in to keep it in your account and open it anywhere.</p>
          <button type="button" onClick={onSignIn} className="btn btn-ink mt-3 h-9 w-full text-sm">
            Sign in
          </button>
        </div>
      )}
    </div>
  );
}
