"use client";

import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { StoryMockup } from "./story-mockup";

/** Visual rendering of a template used on cards & detail pages. */
export function TemplatePreview({
  template,
  className,
  compact = false,
}: {
  template: Template;
  className?: string;
  /** Fill a frame that isn't 3:4 without cropping (see StoryMockup). */
  compact?: boolean;
}) {
  return (
    // A picture of the gift: one image to screen readers and checkers, not a
    // pile of tiny decorative labels.
    <div
      role="img"
      aria-label={`${template.name} preview`}
      className={cn(
        "@container relative aspect-[3/4] w-full select-none overflow-hidden rounded-[1.75rem]",
        className,
      )}
    >
      <div aria-hidden className="contents">
        {template.story && <StoryMockup template={template} compact={compact} />}
      </div>
    </div>
  );
}
