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
      <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] type-display">
        {label ?? "All"} <span className="type-accent text-rose">templates.</span>
      </h1>

      <div className="mb-12 mt-10 flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-center md:justify-between">
        <OccasionFilter active={occasion} />
        <p className="type-label shrink-0 text-muted">
          {templates.length} {templates.length === 1 ? "template" : "templates"}
        </p>
      </div>
      <TemplateGrid templates={templates} />
    </main>
  );
}
