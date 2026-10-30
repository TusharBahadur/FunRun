import { OccasionFilter } from "@/components/templates/occasion-filter";
import { TemplateGrid } from "@/components/templates/template-grid";
import { occasions, type OccasionId } from "@/config/site";
import { getTemplates } from "@/lib/templates";

/**
 * The gallery: all templates, or one occasion's. Fully static, so it's served
 * straight from the CDN. Kept deliberately quiet: one heading, the filters, the
 * cards. (Each occasion's longer description lives in its page metadata for search.)
 */
export async function TemplatesListing({ occasion }: { occasion?: OccasionId }) {
  const templates = await getTemplates({ occasion });
  const label = occasion ? occasions.find((o) => o.id === occasion)?.label : null;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-32 pt-32 md:pt-40">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          {label ?? "All"} <span className="type-accent text-rose">templates.</span>
        </h1>
        <p className="mb-2 shrink-0 text-sm text-muted md:mb-4">
          {templates.length} {templates.length === 1 ? "design" : "designs"}
        </p>
      </div>

      <div className="mb-8 mt-6 md:mb-12 md:mt-8">
        <OccasionFilter active={occasion} />
      </div>
      {/* Keeps the heading order h1 → h2 → h3 (each card has an h3) for screen readers. */}
      <h2 className="sr-only">{label ?? "All"} templates</h2>
      <TemplateGrid templates={templates} />
    </main>
  );
}
