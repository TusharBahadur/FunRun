export const siteConfig = {
  name: "Tynitales",
  tagline: "Gift a feeling.",
  description:
    "Beautiful digital templates you can personalize and gift to the people you love.",
  url: "https://tynitales.gift",
  nav: [
    { label: "Templates", href: "/templates" },
    { label: "How it works", href: "/#how" },
    { label: "Details", href: "/#features" },
    { label: "Love notes", href: "/#love-notes" },
  ],
} as const;

export const occasions = [
  { id: "love", label: "Love" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "thank-you", label: "Thank you" },
  { id: "long-distance", label: "Long distance" },
  { id: "memories", label: "Memories" },
] as const;

export type OccasionId = (typeof occasions)[number]["id"];

export function isOccasionId(value: unknown): value is OccasionId {
  return occasions.some((o) => o.id === value);
}
