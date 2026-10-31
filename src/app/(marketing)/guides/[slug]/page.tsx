import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TextPage } from "@/components/sections/text-page";
import { siteConfig } from "@/config/site";
import { getGuide, guides, type GuideBlock } from "@/data/guides";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.seoTitle,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title: guide.seoTitle, description: guide.description, url: `/guides/${guide.slug}`, type: "article" },
  };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "2026-10-31" → "31 October 2026", without Date (fixed at build time either way). */
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 id={block.id} className="type-heading scroll-mt-28 pt-6 text-2xl md:text-[1.75rem]">
          {block.text}
        </h2>
      );
    case "p":
      return <p>{block.text}</p>;
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-5 marker:text-rose">
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      );
    case "note":
      return <p className="rounded-2xl bg-blush/50 px-5 py-4 text-ink">{block.text}</p>;
    case "letter":
      return (
        <figure className="my-2 rounded-3xl border border-line bg-paper px-6 py-6 shadow-[0_18px_40px_-30px_rgba(27,18,21,0.45)] md:px-8 md:py-8">
          <figcaption className="type-label text-rose-deep">{block.label}</figcaption>
          <div className="type-hand mt-4 space-y-3 text-[1.2rem] leading-relaxed text-ink md:text-[1.3rem]">
            {block.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="pt-2 text-right">{block.sign}</p>
          </div>
        </figure>
      );
  }
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const url = `${siteConfig.url}/guides/${guide.slug}`;
  const contents = guide.body.filter((b): b is Extract<GuideBlock, { type: "h2" }> => b.type === "h2");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.seoTitle,
        description: guide.description,
        url,
        mainEntityOfPage: url,
        datePublished: guide.published,
        dateModified: guide.updated,
        inLanguage: "en-IN",
        image: `${siteConfig.url}/opengraph-image`,
        author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${siteConfig.url}/guides` },
          { "@type": "ListItem", position: 2, name: guide.title, item: url },
        ],
      },
    ],
  };

  return (
    <TextPage
      eyebrow="Guide"
      title={guide.title}
      accent={guide.accent}
      intro={<p>{guide.intro}</p>}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="In this guide" className="rounded-3xl border border-line bg-paper px-6 py-5">
        <p className="type-label text-muted">In this guide</p>
        <ol className="mt-3 space-y-1.5 text-[15px]">
          {contents.map((h) => (
            <li key={h.id}>
              <a href={`#${h.id}`} className="text-ink/80 underline decoration-line underline-offset-4 hover:text-ink">
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="mt-10 space-y-5 text-[16px] leading-relaxed text-ink/85 md:text-[17px]">
        {guide.body.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </article>

      <aside className="mt-14 rounded-3xl bg-ink px-6 py-8 text-paper md:px-10 md:py-10">
        <p className="type-copy text-paper/85">{guide.cta.text}</p>
        <Link href={`/templates/for/${guide.occasion}`} className="btn btn-rose mt-6 h-12 px-6 text-base">
          {guide.cta.label}
        </Link>
        <p className="mt-4 text-sm text-paper/60">Free to try · ₹99 to send · opens on any phone</p>
      </aside>

      <p className="mt-10 text-sm text-muted">
        Published by TyniTales ·{" "}
        <time dateTime={guide.updated}>
          {formatDate(guide.updated)}
        </time>{" "}
        · <Link href="/guides" className="underline decoration-line underline-offset-4 hover:text-ink">More guides</Link>
      </p>
    </TextPage>
  );
}
