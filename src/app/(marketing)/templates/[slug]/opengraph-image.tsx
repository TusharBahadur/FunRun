import { ImageResponse } from "next/og";
import { occasions, siteConfig } from "@/config/site";
import { getTemplateBySlug, getTemplates } from "@/lib/templates";

export const alt = "A TyniTales gift template";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getTemplates()).map((t) => ({ slug: t.slug }));
}

/** The share card for a template: its colours, name and first line. Built once at deploy. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const template = await getTemplateBySlug((await params).slug);
  const bg = template?.palette.bg ?? "#f5efe6";
  const fg = template?.palette.fg ?? "#1b1215";
  const accent = template?.palette.accent ?? "#e23b54";
  const occasion = occasions.find((o) => o.id === template?.occasion)?.label ?? "Gift";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: bg, color: fg }}>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase", opacity: 0.7 }}>{`${occasion} · ${siteConfig.name}`}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, lineHeight: 1, color: accent }}>{template?.name ?? siteConfig.name}</div>
          <div style={{ marginTop: 28, fontSize: 40, maxWidth: 900, lineHeight: 1.2 }}>{template?.preview.title ?? siteConfig.tagline}</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.7 }}>Personalise it · send a private link</div>
      </div>
    ),
    size,
  );
}
