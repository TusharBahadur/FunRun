import { SplitText } from "@/components/motion/split-text";
import { TemplateCard } from "@/components/templates/template-card";
import { ButtonLink } from "@/components/ui/button";
import type { Template } from "@/lib/templates";

/** The templates, front and centre: a handful to start from, and a way to see them all. */
export function FeaturedTemplates({ templates, total }: { templates: Template[]; total: number }) {
  return (
    <section id="templates" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          <SplitText text="Start with a" /> <SplitText text="template." className="type-accent text-rose" delay={0.15} />
        </h2>
        <ButtonLink href="/templates" className="self-start sm:mb-3 sm:self-auto">
          See all {total} templates
        </ButtonLink>
      </div>

      <ul className="mt-12 md:mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <li key={t.slug}>
            <TemplateCard template={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}
