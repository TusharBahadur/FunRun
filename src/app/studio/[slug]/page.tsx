import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Studio } from "@/components/studio/studio";
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

export default function StudioPage({ params, searchParams }: PageProps<"/studio/[slug]">) {
  return (
    <Suspense fallback={<main className="h-svh bg-cream" />}>
      <StudioLoader params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function StudioLoader({ params, searchParams }: Pick<PageProps<"/studio/[slug]">, "params" | "searchParams">) {
  const { slug } = await params;
  const sp = await searchParams;
  const toName = typeof sp?.to === "string" ? sp.to : undefined;
  const fromName = typeof sp?.from === "string" ? sp.from : undefined;
  // ?edit=<gift link> reopens a live gift to change it (allowed for 7 days).
  const editSlug = typeof sp?.edit === "string" && /^[a-z0-9-]{3,48}$/.test(sp.edit) ? sp.edit : undefined;
  const template = await getTemplateBySlug(slug);
  if (!template?.story) notFound();

  const seedNames = { recipient: template.story.recipient, sender: template.story.sender };
  const story = {
    ...bindStoryNames(template.story, seedNames),
    recipient: toName || seedNames.recipient,
    sender: fromName || seedNames.sender,
  };

  const designs = await getTemplates({ occasion: template.occasion });

  return (
    <Studio
      template={{ slug: template.slug, name: template.name, pricePaise: template.pricePaise, story }}
      designs={designs}
      seedNames={seedNames}
      askNames={!toName && !fromName && !editSlug}
      editSlug={editSlug}
    />
  );
}
