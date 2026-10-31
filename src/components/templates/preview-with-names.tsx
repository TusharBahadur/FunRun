"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ComponentProps, CSSProperties } from "react";
import { BirthdayExperience } from "@/components/experiences/birthday/birthday-experience";
import { ImageLoadingContext } from "@/components/story/image-loading";
import type { Story } from "@/components/story/types";
import { StoryPlayer } from "@/components/story/story-player";
import { PreviewBack } from "@/components/templates/preview-back";
import { demoBirthdayGift } from "@/data/demo-gifts";

type Experience = Pick<ComponentProps<typeof BirthdayExperience>, "palette" | "tier">;

/**
 * A template preview, personalised with ?to= and ?from= in the browser.
 * Reading the names here (not on the server) lets the whole page be built
 * ahead of time, so opening a preview never waits on a server render.
 */
export function PreviewWithNames({
  slug,
  story,
  experience,
  backStyle,
  ctaStyle,
}: {
  slug: string;
  story?: Story;
  experience?: Experience;
  backStyle: CSSProperties;
  /** The template's own accent colours for the "Make it yours" button. */
  ctaStyle: CSSProperties;
}) {
  const sp = useSearchParams();
  const toName = sp.get("to") || undefined;
  const fromName = sp.get("from") || undefined;
  const query = new URLSearchParams({ ...(toName ? { to: toName } : {}), ...(fromName ? { from: fromName } : {}) }).toString();
  const withNames = (path: string) => `${path}${query ? `?${query}` : ""}`;
  const pill = "flex h-10 items-center rounded-full shadow-sm md:backdrop-blur";

  // Back · ‹ page › on the left, "Make it yours" on the right. Kept small: the gift is the point.
  const controls = (pages?: { index: number; count: number; go: (index: number) => void }, ctaRight = "right-4") => (
    <>
      <nav aria-label="Preview" className="fixed left-4 top-4 z-50 flex gap-2">
        <PreviewBack fallback={withNames(`/templates/${slug}`)} className={`${pill} gap-1.5 px-4 text-sm font-medium`} style={backStyle} />
        {pages && pages.count > 1 && (
          <div className={`${pill} px-0.5 text-sm`} style={backStyle}>
            <button
              type="button"
              onClick={() => pages.go(pages.index - 1)}
              disabled={pages.index === 0}
              aria-label="Previous page"
              className="grid h-10 w-9 place-items-center transition-opacity hover:opacity-70 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-8 text-center tabular-nums" aria-live="polite">
              {pages.index + 1}/{pages.count}
            </span>
            <button
              type="button"
              onClick={() => pages.go(pages.index + 1)}
              disabled={pages.index === pages.count - 1}
              aria-label="Next page"
              className="grid h-10 w-9 place-items-center transition-opacity hover:opacity-70 disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </nav>
      <Link
        href={withNames(`/studio/${slug}`)}
        className={`${pill} fixed ${ctaRight} top-4 z-50 px-4 text-sm font-semibold`}
        style={ctaStyle}
      >
        Make it yours
      </Link>
    </>
  );

  if (story) {
    return (
      <>
        {/* A scrolling website gift has no pages to step through. */}
        {story.format === "site" && controls()}
        {/* The gift is the page: its first photos load before anything else. */}
        <ImageLoadingContext.Provider value={story.format === "site" ? "lazy" : "priority"}>
          <StoryPlayer
            story={{ ...story, recipient: toName || story.recipient, sender: fromName || story.sender }}
            slug={slug}
            renderNav={story.format === "site" ? undefined : (pages) => controls(pages)}
          />
        </ImageLoadingContext.Provider>
      </>
    );
  }

  if (!experience) return null;
  return (
    <main>
      {/* This gift has its own music button at the top right. */}
      {controls(undefined, "right-20")}
      <BirthdayExperience
        gift={{ ...demoBirthdayGift, recipient: toName || demoBirthdayGift.recipient, sender: fromName || demoBirthdayGift.sender }}
        palette={experience.palette}
        tier={experience.tier}
        templateSlug={slug}
      />
    </main>
  );
}
