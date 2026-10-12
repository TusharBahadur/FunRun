import Link from "next/link";
import { TiltCard } from "@/components/motion/tilt-card";
import { TemplatePreview } from "@/components/templates/template-preview";
import { occasions } from "@/config/site";
import type { Template } from "@/lib/templates";
import { cn, formatInr } from "@/lib/utils";

export function TemplateCard({ template, className }: { template: Template; className?: string }) {
  const occasion = occasions.find((o) => o.id === template.occasion);
  return (
    <Link
      href={`/templates/${template.slug}`}
      data-cursor="view"
      className={cn("group block", className)}
    >
      <TiltCard className="rounded-[1.75rem] shadow-[0_24px_50px_-28px_rgba(27,18,21,0.45)]">
        <TemplatePreview template={template} />
        {template.isNew && (
          <span className="absolute right-4 top-4 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">
            New
          </span>
        )}
      </TiltCard>
      <div className="mt-4 flex items-start justify-between gap-4 px-1">
        <div>
          <h3 className="type-heading text-lg">{template.name}</h3>
          <p className="type-copy text-[12px] opacity-60">{template.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="rounded-full border border-current/15 px-2.5 py-1 text-xs opacity-75">
            {occasion?.label}
          </span>
          <span className="type-label">{formatInr(template.pricePaise)}</span>
        </div>
      </div>
    </Link>
  );
}
