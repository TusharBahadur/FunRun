import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PreviewWithNames } from "@/components/templates/preview-with-names";
import { getTemplateBySlug, getTemplates } from "@/lib/templates";

export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.filter((t) => t.experience).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/preview/[slug]">): Promise<Metadata> {
  const template = await getTemplateBySlug((await params).slug);
  return { title: template ? `Preview · ${template.name}` : "Preview", robots: { index: false }, alternates: { canonical: `/templates/${(await params).slug}` } };
}

export default async function PreviewPage({ params }: PageProps<"/preview/[slug]">) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template?.experience) notFound();

  // Neighbours in the gallery's order, wrapping round, for the ‹ › buttons.
  const all = (await getTemplates()).filter((t) => t.experience);
  const at = all.findIndex((t) => t.slug === slug);
  const prev = all[(at - 1 + all.length) % all.length];
  const next = all[(at + 1) % all.length];

  const { palette } = template;
  const extra = template.experiencePalette ?? { cream: "#fff4ef", pink: "#ffb3c1", gold: "#f6b73c", ink: palette.fg };
  const cream = template.story ? (template.experiencePalette?.cream ?? "#fff4ef") : extra.cream;
  const ink = template.story ? (template.experiencePalette?.ink ?? palette.fg) : extra.ink;

  // Built ahead of time for every template; ?to= and ?from= are read in the browser.
  return (
    <Suspense fallback={<main className="min-h-svh" />}>
      <PreviewWithNames
        slug={template.slug}
        story={template.story ?? undefined}
        experience={template.story ? undefined : { palette: { ...palette, ...extra }, tier: template.tier ?? "wish" }}
        backStyle={{ backgroundColor: `${cream}cc`, color: ink }}
        prev={{ slug: prev.slug, name: prev.name }}
        next={{ slug: next.slug, name: next.name }}
      />
    </Suspense>
  );
}
