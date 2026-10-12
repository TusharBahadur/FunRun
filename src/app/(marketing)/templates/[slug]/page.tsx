import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SplitText } from "@/components/motion/split-text";
import { TiltCard } from "@/components/motion/tilt-card";
import { BirthdayCompare } from "@/components/templates/birthday-compare";
import { TemplatePreview } from "@/components/templates/template-preview";
import { birthdayTiers } from "@/components/experiences/birthday/tiers";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { occasions } from "@/config/site";
import { getTemplateBySlug, getTemplates } from "@/lib/templates";
import { formatInr } from "@/lib/utils";

export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">): Promise<Metadata> {
  const template = await getTemplateBySlug((await params).slug);
  if (!template) return {};
  return { title: template.name, description: template.description };
}

export default function TemplatePage({ params }: PageProps<"/templates/[slug]">) {
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

  return (
    <main className="mx-auto max-w-7xl px-5 pb-32 pt-32 md:pt-40">
      <Link href="/templates" className="type-label text-muted hover:text-ink">
        ← All templates
      </Link>

      <div className="mt-10 grid items-start gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <TiltCard className="rounded-[1.75rem] shadow-[0_40px_80px_-40px_rgba(27,18,21,0.5)]">
            <TemplatePreview template={template} />
          </TiltCard>
        </div>

        <div className="md:col-span-7 md:pt-6">
          <Eyebrow>{occasion?.label}</Eyebrow>
          <h1 className="type-display mt-5 text-[clamp(3rem,8vw,6rem)]">
            <SplitText text={template.name} className="type-accent" />
          </h1>
          <p className="type-copy mt-6 max-w-md text-muted">{template.description}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {template.experience ? (
              <ButtonLink href={`/preview/${template.slug}`} size="lg">
                Preview the gift
              </ButtonLink>
            ) : (
              <span className="type-label rounded-full border border-line px-5 py-4 text-muted">
                Full preview coming soon
              </span>
            )}
            <span className="type-label ml-2 text-muted">{price} · Personalizing opens soon</span>
          </div>

          {tier && (
            <ol className="mt-16 border-t border-line">
              {tier.highlights.map((line, i) => (
                <li key={line} className="flex items-baseline gap-6 border-b border-line py-4">
                  <span className="type-label text-rose">{String(i + 1).padStart(2, "0")}</span>
                  <p className={i === 0 && tier.id !== "candle" ? "type-heading text-lg" : "text-[1.05rem]"}>
                    {line}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {tier && <BirthdayCompare current={tier.id} />}
    </main>
  );
}
