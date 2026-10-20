import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BirthdayExperience } from "@/components/experiences/birthday/birthday-experience";
import { StoryPlayer } from "@/components/story/story-player";
import { demoBirthdayGift } from "@/data/demo-gifts";
import { getTemplateBySlug, getTemplates } from "@/lib/templates";

export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.filter((t) => t.experience).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/preview/[slug]">): Promise<Metadata> {
  const template = await getTemplateBySlug((await params).slug);
  return { title: template ? `Preview · ${template.name}` : "Preview" };
}

export default function PreviewPage({ params, searchParams }: PageProps<"/preview/[slug]">) {
  return (
    <Suspense fallback={<main className="min-h-svh" />}>
      <Preview params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ params, searchParams }: Pick<PageProps<"/preview/[slug]">, "params" | "searchParams">) {
  const { slug } = await params;
  const sp = await searchParams;
  const toName = typeof sp?.to === "string" ? sp.to : undefined;
  const fromName = typeof sp?.from === "string" ? sp.from : undefined;
  const template = await getTemplateBySlug(slug);
  if (!template?.experience) notFound();

  const { palette } = template;
  const queryStr = toName || fromName ? `?${new URLSearchParams({ ...(toName ? { to: toName } : {}), ...(fromName ? { from: fromName } : {}) }).toString()}` : "";
  const back = (
    <Link
      href={`/templates/${template.slug}${queryStr}`}
      className="type-label fixed left-4 top-4 z-50 flex h-10 items-center rounded-full px-4 backdrop-blur shadow-sm"
      style={{ backgroundColor: `${template.experiencePalette?.cream ?? "#fff4ef"}cc`, color: template.experiencePalette?.ink ?? palette.fg }}
    >
      ← {template.name}
    </Link>
  );

  if (template.story) {
    const personalizedStory = {
      ...template.story,
      recipient: toName || template.story.recipient,
      sender: fromName || template.story.sender,
    };
    return (
      <>
        {back}
        <StoryPlayer story={personalizedStory} slug={template.slug} />
      </>
    );
  }

  const extra = template.experiencePalette ?? { cream: "#fff4ef", pink: "#ffb3c1", gold: "#f6b73c", ink: palette.fg };

  return (
    <main>
      <Link
        href={`/templates/${template.slug}${queryStr}`}
        className="type-label fixed left-4 top-4 z-50 flex h-12 items-center rounded-full px-4 backdrop-blur shadow-sm"
        style={{ backgroundColor: `${extra.cream}cc`, color: extra.ink }}
      >
        ← {template.name}
      </Link>
      <BirthdayExperience
        gift={{
          ...demoBirthdayGift,
          recipient: toName || demoBirthdayGift.recipient,
          sender: fromName || demoBirthdayGift.sender,
        }}
        palette={{ ...palette, ...extra }}
        tier={template.tier ?? "wish"}
        templateSlug={template.slug}
      />
    </main>
  );
}
