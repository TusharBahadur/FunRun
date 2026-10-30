import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StudioFromUrl } from "@/components/studio/studio-from-url";
import { bindStoryNames } from "@/lib/gift-names";
import { getTemplateBySlug, getTemplates } from "@/lib/templates";

export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.filter((t) => t.story).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/studio/[slug]">): Promise<Metadata> {
  const template = await getTemplateBySlug((await params).slug);
  return { title: template ? `Studio · ${template.name}` : "Studio", robots: { index: false } };
}

export default async function StudioPage({ params }: PageProps<"/studio/[slug]">) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template?.story) notFound();

  const seedNames = { recipient: template.story.recipient, sender: template.story.sender };
  const story = { ...bindStoryNames(template.story, seedNames), ...seedNames };
  const designs = await getTemplates({ occasion: template.occasion });

  // Built ahead of time for every template; ?to=, ?from= and ?edit= are read in the browser.
  return (
    <Suspense fallback={<main className="h-svh bg-cream" />}>
      <StudioFromUrl
        template={{ slug: template.slug, name: template.name, pricePaise: template.pricePaise, story }}
        designs={designs}
        seedNames={seedNames}
      />
    </Suspense>
  );
}
