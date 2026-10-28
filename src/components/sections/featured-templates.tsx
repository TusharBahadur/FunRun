import { SplitText } from "@/components/motion/split-text";
import { TemplateGrid } from "@/components/templates/template-grid";
import { ButtonLink } from "@/components/ui/button";
import type { Template } from "@/lib/templates";

/** The templates, front and centre: a handful to start from, and a way to see them all. */
export function FeaturedTemplates({ templates, total }: { templates: Template[]; total: number }) {
  return (
    <section id="templates" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20">
      {/* Phones: the button sits under the heading. Tablet and up: heading on
          the left, button on the right, both resting on the same line. */}
      <div className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          <SplitText text="Start with a" /> <SplitText text="template." className="type-accent text-rose" delay={0.15} />
        </h2>
        <ButtonLink href="/templates" variant="rose" className="shrink-0 md:mb-2 lg:mb-3">
          See all {total} templates
        </ButtonLink>
      </div>

      <div className="mt-8 md:mt-12">
        <TemplateGrid templates={templates} variant="featured" />
      </div>
    </section>
  );
}
