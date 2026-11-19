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

export default function StudioPage({ params }: PageProps<"/studio/[slug]">) {
  // Every template is pre-built, so this boundary never shows; it lets navigation start instantly.
  // It also covers ?to=, ?from= and ?edit=, which are read in the browser.
  return (
    <Suspense fallback={<main className="h-svh bg-cream" />}>
      <StudioForTemplate params={params} />
    </Suspense>
  );
}

async function StudioForTemplate({ params }: Pick<PageProps<"/studio/[slug]">, "params">) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template?.story) notFound();

  const seedNames = { recipient: template.story.recipient, sender: template.story.sender };
  const story = { ...bindStoryNames(template.story, seedNames), ...seedNames };
  const designs = await getTemplates({ occasion: template.occasion });

  return (
    <StudioFromUrl
      template={{ slug: template.slug, name: template.name, pricePaise: template.pricePaise, story }}
      designs={designs}
      seedNames={seedNames}
    />
  );
}
