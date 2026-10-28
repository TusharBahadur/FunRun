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
    <div
      className={cn(
        "@container relative aspect-[3/4] w-full select-none overflow-hidden rounded-[1.75rem]",
        className,
      )}
    >
      {template.story && <StoryMockup template={template} compact={compact} />}
    </div>
  );
}
