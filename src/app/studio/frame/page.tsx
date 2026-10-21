"use client";

import { useEffect, useRef, useState } from "react";
import { StoryPlayer } from "@/components/story/story-player";
import type { Story } from "@/components/story/types";

export type StudioFrameMessage = {
  type: "tynitales:studio";
  story: Story;
  slug: string;
  /** Visible-scene index to show. */
  index: number;
  /** Bumps when the studio wants the scene to start over. */
  run: number;
  /** "edit": every page open, follows the studio. "play": plays like the real gift. */
  mode: "edit" | "play";
  /** Studio: which field is selected, so the iframe can outline it. */
  pick?: { field?: string | null; item?: number | null };
};

/**
 * One artboard on the studio canvas (or the full-screen preview). Lives in an
 * iframe so phone, tablet and desktop each lay out at their real width.
 */
export default function StudioFramePage() {
  const [msg, setMsg] = useState<StudioFrameMessage | null>(null);
  const [jump, setJump] = useState(0);
  const shown = useRef(-1);
  const last = useRef<StudioFrameMessage | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent<StudioFrameMessage>) => {
      if (e.origin !== window.location.origin || e.data?.type !== "tynitales:studio") return;
      const next = e.data;
      const prev = last.current;
      last.current = next;
      // Only restart the player when the studio picks a different page or asks for a replay.
      if (!prev || prev.run !== next.run || next.index !== shown.current || prev.mode !== next.mode) {
        shown.current = next.index;
        setJump((j) => j + 1);
      }
      setMsg(next);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "tynitales:studio-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!msg) return <main className="min-h-svh" />;

  const editing = msg.mode === "edit";

  // Lenis would swallow wheel scrolls here; letting them through scrolls the studio page instead.
  return (
    <div data-lenis-prevent>
    <StoryPlayer
      key={jump}
      story={msg.story}
      slug={msg.slug}
      initialIndex={msg.index}
      unlocked={editing}
      studio={
        editing
          ? {
              pick: msg.pick ?? {},
              onPick: (p) => {
                window.parent?.postMessage(
                  {
                    type: "tynitales:studio-pick",
                    field: p.field ?? null,
                    item: p.item ?? null,
                    index: p.index ?? shown.current,
                  },
                  window.location.origin,
                );
              },
            }
          : undefined
      }
      onIndexChange={(i) => {
        shown.current = i;
        window.parent?.postMessage({ type: "tynitales:studio-index", index: i }, window.location.origin);
      }}
    />
    </div>
  );
}
