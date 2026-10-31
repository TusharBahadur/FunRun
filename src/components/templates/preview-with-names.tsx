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

type Neighbour = { slug: string; name: string };

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
  prev,
  next,
}: {
  slug: string;
  story?: Story;
  experience?: Experience;
  backStyle: CSSProperties;
  prev: Neighbour;
  next: Neighbour;
}) {
  const sp = useSearchParams();
  const toName = sp.get("to") || undefined;
  const fromName = sp.get("from") || undefined;
  const query = new URLSearchParams({ ...(toName ? { to: toName } : {}), ...(fromName ? { from: fromName } : {}) }).toString();
  const withNames = (path: string) => `${path}${query ? `?${query}` : ""}`;
  // ‹ › replace the page rather than adding to history, so Back still returns
  // to wherever you started browsing.
  const step = (n: Neighbour, dir: "prev" | "next") => (
    <Link
      href={withNames(`/preview/${n.slug}`)}
      replace
      scroll={false}
      aria-label={`${dir === "prev" ? "Previous" : "Next"} template: ${n.name}`}
      title={n.name}
      className="grid h-10 w-9 place-items-center transition-opacity hover:opacity-70"
    >
      {dir === "prev" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
    </Link>
  );
  const back = (
    <nav aria-label="Preview" className="fixed left-4 top-4 z-50 flex gap-2">
      <PreviewBack
        fallback={withNames(`/templates/${slug}`)}
        className="flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium shadow-sm backdrop-blur"
        style={backStyle}
      />
      <div className="flex items-center rounded-full px-0.5 shadow-sm backdrop-blur" style={backStyle}>
        {step(prev, "prev")}
        {step(next, "next")}
      </div>
    </nav>
  );

  if (story) {
    return (
      <>
        {back}
        {/* The gift is the page: its first photos load before anything else. */}
        <ImageLoadingContext.Provider value={story.format === "site" ? "lazy" : "priority"}>
          <StoryPlayer story={{ ...story, recipient: toName || story.recipient, sender: fromName || story.sender }} slug={slug} />
        </ImageLoadingContext.Provider>
      </>
    );
  }

  if (!experience) return null;
  return (
    <main>
      {back}
      <BirthdayExperience
        gift={{ ...demoBirthdayGift, recipient: toName || demoBirthdayGift.recipient, sender: fromName || demoBirthdayGift.sender }}
        palette={experience.palette}
        tier={experience.tier}
        templateSlug={slug}
      />
    </main>
  );
}
