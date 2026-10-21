import type { OccasionId } from "@/config/site";
import { templates } from "@/data/templates";

export type { Experience, Motif, Template } from "@/data/templates";

/**
 * Data access layer for templates. Today it reads static seed data; later
 * these become database queries (e.g. Drizzle + Postgres) with the same
 * signatures, so pages and components stay untouched.
 */

const playable = templates.filter((t) => t.story);

export async function getTemplates(filter?: { occasion?: OccasionId }) {
  if (!filter?.occasion) return playable;
  return playable.filter((t) => t.occasion === filter.occasion);
}

export async function getTemplateBySlug(slug: string) {
  return playable.find((t) => t.slug === slug) ?? null;
}
