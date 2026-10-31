"use client";

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
}: {
  slug: string;
  story?: Story;
  experience?: Experience;
  backStyle: CSSProperties;
}) {
  const sp = useSearchParams();
  const toName = sp.get("to") || undefined;
  const fromName = sp.get("from") || undefined;
  const query = new URLSearchParams({ ...(toName ? { to: toName } : {}), ...(fromName ? { from: fromName } : {}) }).toString();
  const back = (
    <PreviewBack
      fallback={`/templates/${slug}${query ? `?${query}` : ""}`}
      className="fixed left-4 top-4 z-50 flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium shadow-sm backdrop-blur"
      style={backStyle}
    />
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
