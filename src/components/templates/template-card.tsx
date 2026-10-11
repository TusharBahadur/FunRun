import Link from "next/link";
import { TiltCard } from "@/components/motion/tilt-card";
import { TemplatePreview } from "@/components/templates/template-preview";
import { occasions } from "@/config/site";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function TemplateCard({ template, className }: { template: Template; className?: string }) {
  const occasion = occasions.find((o) => o.id === template.occasion);
  return (
    <Link
      // Becomes /templates/[slug] once template detail pages exist.
      href={`/templates#${template.slug}`}
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
          <h3 className="text-lg font-medium tracking-tight">{template.name}</h3>
          <p className="text-sm opacity-60">{template.description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-current/15 px-2.5 py-1 text-xs opacity-75">
          {occasion?.label}
        </span>
      </div>
    </Link>
  );
}
