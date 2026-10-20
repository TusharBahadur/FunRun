"use client";

import { useState } from "react";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { StoryMockup } from "./story-mockup";
import { TemplatePageFlow } from "./template-page-flow";

/**
 * Visual rendering of a template used on cards & detail pages.
 * - Static: unique, handcrafted editorial composition for every single template
 * - Hover: authentic live 1-second timer flow displaying pages one after another
 */
export function TemplatePreview({
  template,
  className,
}: {
  template: Template;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={cn(
        "@container group/preview relative aspect-[3/4] w-full select-none overflow-hidden rounded-[1.75rem]",
        className,
      )}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. STATIC THUMBNAIL (Fades out when hovered)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300 ease-out",
          isHovered ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        {template.story ? (
          <StoryMockup template={template} />
        ) : (
          <ClassicCardMockup template={template} />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. HOVER 1-SECOND TIMER FLOW (Advances pages every 1 second)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300 ease-out",
          isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <TemplatePageFlow template={template} isHovered={isHovered} />
      </div>
    </div>
  );
}

/**
 * Editorial, high-end visual mockup for classic non-story templates
 */
function ClassicCardMockup({ template }: { template: Template }) {
  const { palette, preview } = template;
  const { bg, fg, accent } = palette;

  return (
    <div
      className="relative h-full w-full overflow-hidden p-[7cqw] flex flex-col justify-between"
      style={{ backgroundColor: bg, color: fg }}
    >
      {/* Paper grain & luxury border */}
      <div
        className="absolute inset-[3cqw] rounded-2xl border pointer-events-none"
        style={{ borderColor: `${accent}33` }}
      />

      {/* Top Kicker & Stamp */}
      <div className="relative z-10 flex items-start justify-between">
        <span className="font-mono text-[3.2cqw] uppercase tracking-[0.18em] opacity-75">
          {preview.kicker}
        </span>
        <div
          className="rounded-lg p-[1.5cqw] border border-dashed text-center"
          style={{ borderColor: accent, backgroundColor: `${accent}15` }}
        >
          <span className="font-mono text-[2cqw] uppercase font-bold tracking-widest block" style={{ color: accent }}>
            TYNITALES
          </span>
        </div>
      </div>

      {/* Center opening line in high-contrast Fraunces typography */}
      <div className="relative z-10 my-auto">
        <p className="text-balance font-serif text-[9cqw] leading-[1.02] font-semibold">
          {preview.title}
        </p>
        {preview.signoff && (
          <p className="mt-[3cqw] text-[3.6cqw] opacity-80 font-serif italic">
            {preview.signoff}
          </p>
        )}
      </div>

      {/* Bottom Bar: Wax seal accent */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-[1.5cqw]">
          <span className="size-[2.5cqw] rounded-full" style={{ backgroundColor: accent }} />
          <span className="font-mono text-[2.2cqw] uppercase tracking-wider opacity-60">
            Digital Keepsake
          </span>
        </div>
        <span
          className="rounded-full px-[3cqw] py-[1cqw] text-[2.4cqw] font-medium text-white shadow-xs"
          style={{ backgroundColor: accent }}
        >
          Open →
        </span>
      </div>
    </div>
  );
}
