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
  { id: "proposal", label: "Proposal" },
  { id: "apology", label: "Apology" },
  { id: "girlfriend-day", label: "Girlfriend's Day" },
  { id: "mothers-day", label: "Mother's Day" },
  { id: "fathers-day", label: "Father's Day" },
  { id: "thank-you", label: "Thank you" },
  { id: "long-distance", label: "Long distance" },
  { id: "memories", label: "Memories" },
] as const;

export type OccasionId = (typeof occasions)[number]["id"];

export function isOccasionId(value: unknown): value is OccasionId {
  return occasions.some((o) => o.id === value);
}
