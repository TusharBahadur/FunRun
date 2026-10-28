"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StoryPlayer } from "@/components/story/story-player";
import { loadDraft, type Draft } from "./draft-store";
import { RecipientUnlockCountdown } from "./activation-timer";

/**
 * Plays a gift made in the studio. Until gifts are stored online, this only
 * works in the browser where the gift was made.
 */
export function LocalGift({ id }: { id: string }) {
  const [state, setState] = useState<{ draft: Draft | null; loaded: boolean; locked: boolean }>({ draft: null, loaded: false, locked: false });

  useEffect(() => {
    // Read after mount: the draft lives in this browser's storage.
    const t = setTimeout(() => {
      const draft = loadDraft(id);
      const opens = draft?.live?.unlockAt ? new Date(draft.live.unlockAt).getTime() : 0;
      setState({ draft, loaded: true, locked: opens > Date.now() });
    }, 0);
    return () => clearTimeout(t);
  }, [id]);

  if (!state.loaded) return <main className="min-h-svh bg-cream" />;
  const { draft } = state;

  if (!draft) {
    return (
      <main className="grid min-h-svh place-items-center bg-cream px-6 text-center">
        <div className="max-w-sm">
          <p className="type-label text-muted">Test link</p>
          <h1 className="type-display mt-3 text-4xl">
            This gift lives on <span className="type-accent text-rose">another device.</span>
          </h1>
          <p className="mt-4 text-muted">Test links only open in the browser where the gift was made. Real links work everywhere once payments are live.</p>
          <Link href="/templates" className="btn btn-ink mt-6 inline-block px-6 py-3">
            Browse templates
          </Link>
        </div>
      </main>
    );
  }

  const opensAt = draft.live?.unlockAt ? new Date(draft.live.unlockAt) : null;
  if (opensAt && state.locked) {
    const { palette } = draft.story;
    return (
      <main className="grid min-h-svh place-items-center px-6 text-center" style={{ backgroundColor: palette.bg, color: palette.fg }}>
        <RecipientUnlockCountdown
          opensAt={opensAt}
          recipientName={draft.story.recipient}
          accentColor={palette.accent}
          onUnlock={() => setState((s) => ({ ...s, locked: false }))}
        />
      </main>
    );
  }

  return <StoryPlayer story={draft.story} slug={draft.templateSlug} />;
}
