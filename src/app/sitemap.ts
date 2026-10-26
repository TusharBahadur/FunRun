import type { MetadataRoute } from "next";
import { occasions, siteConfig } from "@/config/site";
import { getTemplates } from "@/lib/templates";

/** Every public page search engines should know about. Gift links are private and left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const templates = await getTemplates();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/templates`, changeFrequency: "weekly", priority: 0.9 },
    ...occasions.map((o) => ({ url: `${base}/templates/for/${o.id}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...templates.map((t) => ({ url: `${base}/templates/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
