import type { OccasionId } from "@/config/site";
import { templates } from "@/data/templates";

export type { Motif, Template } from "@/data/templates";

/**
 * Data access layer for templates. Today it reads static seed data; later
 * these become database queries (e.g. Drizzle + Postgres) with the same
 * signatures, so pages and components stay untouched.
 */

export async function getTemplates(filter?: { occasion?: OccasionId }) {
  if (!filter?.occasion) return templates;
  return templates.filter((t) => t.occasion === filter.occasion);
}

export async function getTemplateBySlug(slug: string) {
  return templates.find((t) => t.slug === slug) ?? null;
}
