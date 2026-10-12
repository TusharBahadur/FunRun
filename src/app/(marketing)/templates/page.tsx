import type { Metadata } from "next";
import { Suspense } from "react";
import { SplitText } from "@/components/motion/split-text";
import { OccasionFilter } from "@/components/templates/occasion-filter";
import { TemplateGrid } from "@/components/templates/template-grid";
import { Eyebrow } from "@/components/ui/eyebrow";
import { isOccasionId } from "@/config/site";
import { getTemplates } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Templates",
  description: "Beautiful templates for every kind of love.",
};

export default function TemplatesPage({ searchParams }: PageProps<"/templates">) {
  return (
    <main className="mx-auto max-w-7xl px-5 pb-32 pt-36 md:pt-44">
      <Eyebrow>The collection</Eyebrow>
      <h1 className="mt-5 max-w-4xl text-[clamp(2.8rem,7vw,6.5rem)] type-display">
        <SplitText text="Find the one that" />{" "}
        <SplitText
          text="feels like you."
          className="type-accent text-rose"
          delay={0.2}
        />
      </h1>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/templates">, "searchParams">) {
  const { occasion } = await searchParams;
  const active = isOccasionId(occasion) ? occasion : undefined;
  const templates = await getTemplates({ occasion: active });

  return (
    <>
      <div className="mb-12 mt-12 flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-center md:justify-between">
        <OccasionFilter active={active} />
        <p className="type-copy shrink-0 text-muted">
          {templates.length} {templates.length === 1 ? "template" : "templates"}
        </p>
      </div>
      <TemplateGrid templates={templates} />
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-12">
      <div className="mb-12 h-[61px] border-b border-line" />
      <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-[1.75rem] bg-line/50" />
        ))}
      </div>
    </div>
  );
}
