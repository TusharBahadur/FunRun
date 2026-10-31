import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SplitText } from "@/components/motion/split-text";
import { TiltCard } from "@/components/motion/tilt-card";
import { sceneLabels } from "@/components/story/labels";
import { ButtonLinkWithNames, NamesBanner } from "@/components/templates/with-names";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplatePreview } from "@/components/templates/template-preview";
import { birthdayTiers } from "@/components/experiences/birthday/tiers";
import { Eyebrow } from "@/components/ui/eyebrow";
import { occasions, occasionSeo, siteConfig } from "@/config/site";
import { getTemplateBySlug, getTemplates } from "@/lib/templates";
import { formatInr } from "@/lib/utils";

export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">): Promise<Metadata> {
  const template = await getTemplateBySlug((await params).slug);
  if (!template) return {};
  const title = `${template.name}: ${occasionSeo[template.occasion].gift}`;
  return {
    title,
    description: template.description,
    alternates: { canonical: `/templates/${template.slug}` },
    openGraph: { title, description: template.description, url: `/templates/${template.slug}`, type: "website" },
  };
}

export default function TemplatePage({ params }: PageProps<"/templates/[slug]">) {
  // Every template is pre-built, so this boundary never shows; it lets navigation start instantly.
  return (
    <Suspense fallback={<main className="min-h-svh" />}>
      <TemplateDetail params={params} />
    </Suspense>
  );
}

async function TemplateDetail({ params }: Pick<PageProps<"/templates/[slug]">, "params">) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) notFound();

  const occasion = occasions.find((o) => o.id === template.occasion);
  const price = formatInr(template.pricePaise);
  const tier = template.tier ? birthdayTiers[template.tier] : null;
  const steps = template.story ? template.story.scenes.map((s) => sceneLabels[s.type]) : (tier?.highlights ?? []);

  // More of the same occasion first, then others, for the "More like this" row.
  const all = await getTemplates();
  const related = [
    ...all.filter((t) => t.occasion === template.occasion && t.slug !== template.slug),
    ...all.filter((t) => t.occasion !== template.occasion),
  ].slice(0, 4);
  const occasionHref = `/templates/for/${template.occasion}`;

  // Product data so search results can show the name, price and image, and the
  // breadcrumb trail (Templates › Occasion › Template).
  const product = {
    "@type": "Product",
    name: template.name,
    description: template.description,
    category: `${occasion?.label ?? "Gift"} digital gift`,
    url: `${siteConfig.url}/templates/${template.slug}`,
    image: `${siteConfig.url}/templates/${template.slug}/opengraph-image`,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      price: (template.pricePaise / 100).toFixed(2),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/templates/${template.slug}`,
    },
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      product,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Templates", item: `${siteConfig.url}/templates` },
          { "@type": "ListItem", position: 2, name: occasion?.label ?? "Gifts", item: `${siteConfig.url}${occasionHref}` },
          { "@type": "ListItem", position: 3, name: template.name, item: `${siteConfig.url}/templates/${template.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-36 pt-24 md:pb-32 md:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb">
        <ol className="type-label flex items-center gap-2 text-muted">
          <li>
            <Link href="/templates" className="hover:text-ink">
              ← Templates
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={occasionHref} className="hover:text-ink">
              {occasion?.label}
            </Link>
          </li>
        </ol>
      </nav>

      <NamesBanner accent={template.palette.accent} />

      <div className="mt-6 grid items-start gap-8 md:mt-10 md:grid-cols-12 md:gap-16">
        <div className="mx-auto w-[78%] max-w-sm md:col-span-5 md:mx-0 md:w-full md:max-w-none">
          <TiltCard className="rounded-[1.75rem] shadow-[0_40px_80px_-40px_rgba(27,18,21,0.5)]">
            <TemplatePreview template={template} priority />
          </TiltCard>
        </div>

        <div className="md:col-span-7 md:pt-6">
          <Eyebrow>{occasion?.label}</Eyebrow>
          <h1 className="type-display mt-3 text-[clamp(2.6rem,8vw,6rem)] font-normal md:mt-5">
            <SplitText text={template.name} className="type-accent" />
          </h1>
          <p className="type-copy mt-4 max-w-md text-muted md:mt-6">{template.description}</p>

          <div className="mt-10 hidden flex-wrap items-center gap-3 md:flex">
            {template.experience ? (
              <ButtonLinkWithNames href={`/preview/${template.slug}`} size="lg">
                Preview the gift
              </ButtonLinkWithNames>
            ) : (
              <span className="type-label rounded-full border border-line px-5 py-4 text-muted">
                Full preview coming soon
              </span>
            )}
            {template.story ? (
              <ButtonLinkWithNames href={`/studio/${template.slug}`} variant="rose" size="lg">
                Make it yours · {price}
              </ButtonLinkWithNames>
            ) : (
              <span className="type-label ml-2 text-muted">{price} · Personalizing opens soon</span>
            )}
          </div>

          {steps.length > 0 && (
            <>
              <p className="type-label mt-10 text-muted md:mt-16">
                {template.story?.format === "site"
                  ? `One scrolling page, ${steps.length} sections`
                  : template.story
                    ? `${steps.length} pages, each unlocked by a little game`
                    : "What's inside"}
              </p>
              <ol className="mt-4 border-t border-line">
                {steps.map((line, i) => (
                  <li key={`${line}-${i}`} className="flex items-baseline gap-6 border-b border-line py-3.5">
                    <span className="type-label text-rose-deep">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-[1.02rem]">{line}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>

      {/* More like this: same occasion first. Keeps people browsing, and links the catalogue together. */}
      {related.length > 0 && (
        <section className="mt-24 md:mt-32">
          <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
            <h2 className="type-display text-[clamp(1.6rem,3vw,2.4rem)]">More like this</h2>
            <Link href={occasionHref} className="type-label shrink-0 text-muted hover:text-ink">
              All {occasion?.label} →
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((t) => (
              <li key={t.slug}>
                <TemplateCard template={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Phones: the actions stay in reach at the bottom of the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/90 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2.5">
          {template.experience && (
            <ButtonLinkWithNames href={`/preview/${template.slug}`} variant="light" icon={false} className="h-12 px-5">
              Preview
            </ButtonLinkWithNames>
          )}
          {template.story ? (
            <ButtonLinkWithNames href={`/studio/${template.slug}`} variant="rose" className="h-12 flex-1">
              Make it yours · {price}
            </ButtonLinkWithNames>
          ) : (
            <span className="type-label flex-1 text-center text-muted">{price} · Personalizing opens soon</span>
          )}
        </div>
      </div>
    </main>
  );
}
