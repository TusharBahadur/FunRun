"use client";

import { Play, X } from "lucide-react";
import { useState } from "react";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { StoryMockup } from "./story-mockup";
import { TemplatePageFlow } from "./template-page-flow";

/**
 * Visual rendering of a template used on cards & detail pages.
 * Static thumbnail by default. Pass `playable` to add a Preview button
 * that runs the live page-by-page flow.
 */
export function TemplatePreview({
  template,
  className,
  playable = false,
}: {
  template: Template;
  className?: string;
  playable?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={cn(
        "@container group/preview relative aspect-[3/4] w-full select-none overflow-hidden rounded-[1.75rem]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300 ease-out",
          playing ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        {template.story && <StoryMockup template={template} />}
      </div>

      {playing && (
        <div className="absolute inset-0">
          <TemplatePageFlow template={template} playing />
        </div>
      )}

      {playable && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPlaying((on) => !on);
          }}
          className="type-label absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/85 px-3.5 py-2 text-paper shadow-[0_8px_24px_-8px_rgba(27,18,21,0.55)] backdrop-blur-md transition-colors hover:bg-ink"
        >
          {playing ? (
            <>
              <X className="size-3.5" strokeWidth={2.4} />
              Close
            </>
          ) : (
            <>
              <Play className="size-3.5 fill-current" />
              Preview
            </>
          )}
        </button>
      )}
    </div>
  );
}
