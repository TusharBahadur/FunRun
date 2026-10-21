"use client";

import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { StoryMockup } from "./story-mockup";

/** Visual rendering of a template used on cards & detail pages. */
export function TemplatePreview({
  template,
  className,
}: {
  template: Template;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "@container relative aspect-[3/4] w-full select-none overflow-hidden rounded-[1.75rem]",
        className,
      )}
    >
      {template.story && <StoryMockup template={template} />}
    </div>
  );
}
