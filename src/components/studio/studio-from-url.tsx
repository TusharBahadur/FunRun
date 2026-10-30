"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, type ComponentProps } from "react";
import { Studio } from "./studio";

type Props = ComponentProps<typeof Studio>;

/**
 * The studio, with ?to=, ?from= and ?edit= read in the browser. That lets the
 * page be built ahead of time, so opening the studio never waits on a server render.
 */
export function StudioFromUrl({ template, designs, seedNames }: Pick<Props, "template" | "designs" | "seedNames">) {
  const sp = useSearchParams();
  const toName = sp.get("to") || undefined;
  const fromName = sp.get("from") || undefined;
  // ?edit=<gift link> reopens a live gift to change it (allowed for 7 days).
  const edit = sp.get("edit");
  const editSlug = edit && /^[a-z0-9-]{3,48}$/.test(edit) ? edit : undefined;
  // Stable unless the names change: the studio rebuilds its starting draft when this does.
  const named = useMemo(
    () => ({ ...template, story: { ...template.story, recipient: toName || template.story.recipient, sender: fromName || template.story.sender } }),
    [template, toName, fromName],
  );
  return (
    <Studio
      template={named}
      designs={designs}
      seedNames={seedNames}
      askNames={!toName && !fromName && !editSlug}
      editSlug={editSlug}
    />
  );
}
