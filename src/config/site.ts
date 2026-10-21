export const siteConfig = {
  name: "TyniTales",
  tagline: "Gift a feeling.",
  description:
    "Beautiful digital templates you can personalize and gift to the people you love.",
  url: "https://tynitales.gift",
  nav: [
    { label: "Templates", href: "/templates" },
    { label: "Make your own", href: "/studio/make-a-wish" },
    { label: "How it works", href: "/#how" },
    { label: "Details", href: "/#features" },
    { label: "Love notes", href: "/#love-notes" },
  ],
} as const;

export const occasions = [
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "love", label: "Love letter" },
  { id: "girlfriend-day", label: "Girlfriend's Day" },
  { id: "boyfriend-day", label: "Boyfriend's Day" },
  { id: "friendship", label: "Friendship Day" },
  { id: "best-friends", label: "Best Friends Day" },
  { id: "apology", label: "Apology" },
  { id: "family", label: "Family" },
] as const;

export type OccasionId = (typeof occasions)[number]["id"];

export function isOccasionId(value: unknown): value is OccasionId {
  return occasions.some((o) => o.id === value);
}
