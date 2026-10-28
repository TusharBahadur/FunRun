"use client";

import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { storyFacts } from "@/components/story/labels";
import { TemplatePreview } from "@/components/templates/template-preview";
import { occasions } from "@/config/site";
import type { Template } from "@/lib/templates";
import { cn, formatInr } from "@/lib/utils";

/** One short line about what's inside: "7 pages · 6 games", or "Website". */
function inside(template: Template) {
  if (!template.story) return null;
  if (template.story.format === "site") return "Scrolling website";
  const f = storyFacts(template.story.scenes);
  return `${f.pages} pages · ${f.games} ${f.games === 1 ? "game" : "games"}`;
}

/**
 * A template as a little product card: the picture inset on white paper,
 * the occasion, name and price, one line about what's inside, then
 * "Make it yours" with a small Preview button beside it.
 * Tapping the picture or the name opens the template's own page.
 */
export function TemplateCard({ template, className }: { template: Template; className?: string }) {
  const occasion = occasions.find((o) => o.id === template.occasion);
  const href = `/templates/${template.slug}`;
  const studio = template.story ? `/studio/${template.slug}` : href;
  const line = inside(template);

  return (
    <article
      className={cn(
        "group/card flex h-full flex-col rounded-[1.4rem] bg-white p-1.5 ring-1 ring-ink/[0.06] sm:rounded-[1.6rem] sm:p-2",
        "shadow-[0_1px_2px_rgba(27,18,21,0.04),0_20px_40px_-28px_rgba(27,18,21,0.45)]",
        "transition-[translate,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(27,18,21,0.04),0_28px_48px_-26px_rgba(27,18,21,0.5)]",
        className,
      )}
    >
      <Link
        href={href}
        data-cursor="view"
        className="relative block overflow-hidden rounded-[1rem] sm:rounded-[1.1rem]"
        aria-label={`${template.name}: see details`}
      >
        <TemplatePreview
          template={template}
          compact
          className="aspect-[25/27] rounded-none transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
        />
        {template.isNew && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-rose-deep shadow-sm backdrop-blur sm:px-2 sm:text-[10px]">
            New
          </span>
        )}
      </Link>

      <Link href={href} data-cursor="view" className="block min-w-0 px-1.5 pt-2 sm:px-2 sm:pt-2.5">
        <p className="truncate text-[11px] font-medium text-rose-deep sm:text-xs">{occasion?.label}</p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <h3 className="type-heading min-w-0 truncate text-sm leading-tight sm:text-base">{template.name}</h3>
          <span className="shrink-0 rounded-full bg-rose/10 px-2 py-0.5 text-[11px] font-bold text-rose-deep sm:text-[13px]">
            {formatInr(template.pricePaise)}
          </span>
        </div>
        {line && <p className="mt-0.5 truncate text-[11px] text-ink/55 sm:text-xs">{line}</p>}
      </Link>

      {/* Side by side when there's room; on narrow cards Preview drops under it. */}
      <div className="mt-auto flex flex-wrap gap-1.5 px-0.5 pb-0.5 pt-2 sm:px-1 sm:pb-1 sm:pt-2.5">
        <Link
          href={studio}
          data-cursor="view"
          className="btn btn-rose group h-10 grow-[2] basis-auto gap-1 whitespace-nowrap px-3 text-[12px] sm:text-[13px]"
        >
          Make it yours
          <ArrowRight className="hidden size-3.5 transition-transform group-hover:translate-x-0.5 sm:block" />
        </Link>
        {template.experience && (
          <Link
            href={`/preview/${template.slug}`}
            aria-label={`Preview ${template.name}`}
            className="btn btn-paper h-9 grow basis-auto gap-1.5 whitespace-nowrap px-3 text-[12px] sm:text-[13px]"
          >
            <Play className="size-3 fill-current" />
            Preview
          </Link>
        )}
      </div>
    </article>
  );
}
