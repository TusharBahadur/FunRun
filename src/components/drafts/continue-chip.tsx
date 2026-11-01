"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deviceDrafts, type DraftSummary } from "@/lib/drafts-device";

const HIDE_KEY = "tynitales:continue-chip-hidden";

/**
 * "Continue your gift for Papa →" at the foot of the screen, when this device
 * has a draft. Reads the device only, so the page doesn't load Supabase.
 */
export function ContinueChip() {
  const [draft, setDraft] = useState<DraftSummary | null>(null);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(HIDE_KEY) === "1";
    } catch {
      /* show it */
    }
    if (hidden || typeof indexedDB === "undefined") return;
    let alive = true;
    deviceDrafts().then((list) => alive && setDraft(list[0] ?? null));
    return () => {
      alive = false;
    };
  }, []);

  if (!draft) return null;
  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] z-40 flex justify-center px-4">
      <div className="flex max-w-full items-center gap-1 rounded-full bg-ink py-1 pl-1 pr-1 text-paper shadow-[0_18px_40px_-16px_rgba(27,18,21,.6)]">
        <Link href={`/studio/${draft.templateSlug}?draft=${draft.id}`} className="flex min-w-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
          <span className="truncate">Continue your gift for {draft.recipient}</span>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
        <button
          type="button"
          aria-label="Hide"
          onClick={() => {
            setDraft(null);
            try {
              sessionStorage.setItem(HIDE_KEY, "1");
            } catch {
              /* hidden for now anyway */
            }
          }}
          className="grid size-8 shrink-0 place-items-center rounded-full text-paper/60 hover:bg-paper/10 hover:text-paper"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
