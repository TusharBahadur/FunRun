import { OccasionFilter } from "@/components/templates/occasion-filter";
import { TemplateGrid } from "@/components/templates/template-grid";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { occasions, occasionSeo, siteConfig, type OccasionId } from "@/config/site";
import { getTemplates } from "@/lib/templates";

/**
 * The gallery: all templates, or one occasion's. Fully static, so it's served
 * straight from the CDN. Kept deliberately quiet: one heading, the filters, the
 * cards. (Each occasion's longer description lives in its page metadata for search.)
 */
export async function TemplatesListing({ occasion }: { occasion?: OccasionId }) {
  const templates = await getTemplates({ occasion });
  const label = occasion ? occasions.find((o) => o.id === occasion)?.label : null;
  const seo = occasion ? occasionSeo[occasion] : null;
  const url = `${siteConfig.url}/templates${occasion ? `/for/${occasion}` : ""}`;

  // Breadcrumbs and the list of templates on this page, for search engines.
  const crumbs = [
    { name: "Home", item: siteConfig.url },
    { name: "Templates", item: `${siteConfig.url}/templates` },
    ...(occasion && label ? [{ name: label, item: url }] : []),
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
      },
      {
        "@type": "CollectionPage",
        url,
        name: seo?.title ?? "Digital gift templates",
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: templates.length,
          itemListElement: templates.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${siteConfig.url}/templates/${t.slug}`,
            name: t.name,
          })),
        },
      },
    ],
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-32 pt-32 md:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          {/* Two lines on phones: one line only just fits, so the web font swapping in could re-wrap it and shift the page. */}
          {label ?? "All"} <span className="type-accent block text-rose sm:inline">templates.</span>
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

      {/* Below the cards, out of the way: what this kind of gift is, and the questions people search for. */}
      {seo && (
        <section className="mx-auto mt-24 max-w-2xl md:mt-32">
          <h2 className="type-display text-[clamp(1.8rem,3.6vw,2.6rem)]">{seo.heading}</h2>
          <p className="type-copy mt-4 text-pretty text-muted">{seo.intro}</p>
          {seo.guide && (
            <p className="mt-4">
              <Link href={`/guides/${seo.guide.slug}`} className="text-rose-deep underline decoration-rose/30 underline-offset-4 hover:decoration-rose-deep">
                {seo.guide.label} →
              </Link>
            </p>
          )}
          <div className="mt-8 divide-y divide-line rounded-3xl border border-line bg-paper">
            {seo.faqs.map((f) => (
              <details key={f.q} className="group px-5 md:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                  <h3>{f.q}</h3>
                  <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-5 text-[15px] leading-relaxed text-ink/75">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
