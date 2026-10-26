import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplatesListing } from "@/components/templates/templates-listing";
import { isOccasionId, occasions, occasionSeo } from "@/config/site";

export function generateStaticParams() {
  return occasions.map((o) => ({ occasion: o.id }));
}

export async function generateMetadata({ params }: PageProps<"/templates/for/[occasion]">): Promise<Metadata> {
  const { occasion } = await params;
  if (!isOccasionId(occasion)) return {};
  const seo = occasionSeo[occasion];
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/templates/for/${occasion}` },
    openGraph: { title: seo.title, description: seo.description, url: `/templates/for/${occasion}` },
  };
}

export default function OccasionPage({ params }: PageProps<"/templates/for/[occasion]">) {
  // Every occasion is pre-built, so this boundary never shows; it lets navigation start instantly.
  return (
    <Suspense fallback={<main className="min-h-svh" />}>
      <Occasion params={params} />
    </Suspense>
  );
}

async function Occasion({ params }: Pick<PageProps<"/templates/for/[occasion]">, "params">) {
  const { occasion } = await params;
  if (!isOccasionId(occasion)) notFound();
  return <TemplatesListing occasion={occasion} />;
}
