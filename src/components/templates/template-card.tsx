"use client";

import { ArrowRight, Camera, Gamepad2, Globe, Layers, Mic, Music, Play, Timer, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { TiltCard } from "@/components/motion/tilt-card";
import { storyFacts } from "@/components/story/labels";
import { TemplatePreview } from "@/components/templates/template-preview";
import { occasions } from "@/config/site";
import type { Template } from "@/lib/templates";
import { cn, formatInr } from "@/lib/utils";

const levelName = { little: "Little", classic: "Classic", grand: "Grand" } as const;

/** What's inside a story gift, as a few short chips. */
function features(template: Template): { icon: LucideIcon; label: string }[] {
  if (!template.story) return [];
  const scenes = template.story.scenes;
  if (template.story.format === "site") {
    const list: { icon: LucideIcon; label: string }[] = [{ icon: Globe, label: "Scrolling website" }];
    if (scenes.some((s) => s.type === "countdown")) list.push({ icon: Timer, label: "Live countdown" });
    if (scenes.some((s) => s.type === "playlist")) list.push({ icon: Music, label: "Your songs" });
    return list;
  }
  const f = storyFacts(scenes);
  const hasPhotos = scenes.some((s) => s.type === "spotlight" || s.type === "polaroids" || s.type === "album" || s.type === "gallery" || (s.type === "letter" && s.photo));
  const list: { icon: LucideIcon; label: string }[] = [
    { icon: Layers, label: `${f.pages} pages` },
    { icon: Gamepad2, label: `${f.games} mini-games` },
  ];
  if (f.wishes) list.push({ icon: Users, label: "Friends join in" });
  else if (f.voice) list.push({ icon: Mic, label: "Voice note" });
  else if (scenes.some((s) => s.type === "playlist")) list.push({ icon: Music, label: "Your songs" });
  else if (hasPhotos) list.push({ icon: Camera, label: "Your photos" });
  return list;
}

export function TemplateCard({ template, className }: { template: Template; className?: string }) {
  const occasion = occasions.find((o) => o.id === template.occasion);
  const chips = features(template);
  // Story gifts open straight in the studio, which asks for the names there.
  const href = template.story ? `/studio/${template.slug}` : `/templates/${template.slug}`;

  return (
    <div className={cn(className)}>
      <Link href={href} data-cursor="view" className="block">
        <TiltCard className="rounded-[1.75rem] shadow-[0_24px_50px_-28px_rgba(27,18,21,0.45)]">
          <TemplatePreview template={template} />
        </TiltCard>
      </Link>

      <div className="mt-5 px-1">
        <p className="type-label flex items-center gap-2 text-[10px] opacity-60">
          {occasion?.label}
          {template.level && (
            <>
              <span aria-hidden>·</span>
              {levelName[template.level]}
            </>
          )}
          {template.story?.format === "site" && (
            <>
              <span aria-hidden>·</span>
              Website
            </>
          )}
          {template.isNew && <span className="rounded-full bg-rose-deep px-2 py-0.5 text-[9px] text-paper">New</span>}
        </p>
        <Link href={href} data-cursor="view" className="mt-1.5 flex items-baseline justify-between gap-4">
          <h3 className="type-heading text-xl">{template.name}</h3>
          <span className="type-display shrink-0 text-xl font-semibold">{formatInr(template.pricePaise)}</span>
        </Link>
        {/* The gift's opening line, in its own words. */}
        <p className="type-display mt-2 text-[1.05rem] leading-snug opacity-80">"{template.preview.title}"</p>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5 rounded-full border border-current/15 px-2.5 py-1 text-xs opacity-80">
                <c.icon className="size-3.5" />
                {c.label}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {template.experience && (
            <Link
              href={`/preview/${template.slug}`}
              data-cursor="view"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-current/25 px-4 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              <Play className="size-3.5 fill-current" />
              Preview
            </Link>
          )}
          <Link
            href={href}
            data-cursor="view"
            className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-current/25 px-4 text-sm font-medium transition-colors hover:border-rose-deep hover:bg-rose-deep hover:text-paper"
          >
            Make it yours
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
