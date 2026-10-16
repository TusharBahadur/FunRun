import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Studio } from "@/components/studio/studio";
import { getTemplateBySlug, getTemplates } from "@/lib/templates";

export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.filter((t) => t.story).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/studio/[slug]">): Promise<Metadata> {
  const template = await getTemplateBySlug((await params).slug);
  return { title: template ? `Studio · ${template.name}` : "Studio" };
}

export default function StudioPage({ params }: PageProps<"/studio/[slug]">) {
  return (
    <Suspense fallback={<main className="h-svh bg-cream" />}>
      <StudioLoader params={params} />
    </Suspense>
  );
}

async function StudioLoader({ params }: Pick<PageProps<"/studio/[slug]">, "params">) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template?.story) notFound();
  return <Studio template={{ slug: template.slug, name: template.name, pricePaise: template.pricePaise, story: template.story }} />;
}
