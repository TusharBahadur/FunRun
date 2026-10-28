export const siteConfig = {
  name: "TyniTales",
  tagline: "Gift a feeling.",
  description:
    "Beautiful digital templates you can personalize and gift to the people you love.",
  url: "https://tynitales.gift",
  nav: [
    { label: "Templates", href: "/templates" },
    { label: "How it works", href: "/#how" },
    { label: "Love notes", href: "/#love-notes" },
    { label: "Profile", href: "/profile" },
  ],
} as const;

/** One price and one link lifetime for every gift. */
export const giftPricing = {
  pricePaise: 9900,
  /** Days after going live that the sender can still change the gift. Links never expire. */
  editDays: 7,
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

/** Search-friendly copy for each occasion's page (/templates/for/<occasion>). */
export const occasionSeo: Record<OccasionId, { title: string; heading: string; description: string }> = {
  birthday: {
    title: "Birthday gift templates",
    heading: "Birthday surprises they’ll replay all year.",
    description: "Personalised digital birthday gifts: blow out candles, unlock wishes from friends and read a letter from you. Ready in minutes, opens on any phone.",
  },
  anniversary: {
    title: "Anniversary gift templates",
    heading: "For every year you’ve chosen each other.",
    description: "Digital anniversary gifts with your photos, your songs and a letter that unlocks page by page. Schedule it to open at midnight.",
  },
  love: {
    title: "Love letter templates",
    heading: "Say it properly, for once.",
    description: "Write a digital love letter they open like a sealed envelope, with photos, little games and your words. Personal, private, no app needed.",
  },
  "girlfriend-day": {
    title: "Girlfriend’s Day gift templates",
    heading: "A Girlfriend’s Day gift that’s actually about her.",
    description: "Make her a personalised digital surprise for Girlfriend’s Day: photos, inside jokes, a quiz about you two and a letter at the end.",
  },
  "boyfriend-day": {
    title: "Boyfriend’s Day gift templates",
    heading: "Make his Boyfriend’s Day.",
    description: "Personalised digital gifts for Boyfriend’s Day with awards, your photos, his songs and a note from you. Ready in minutes.",
  },
  friendship: {
    title: "Friendship Day gift templates",
    heading: "For the friends who stayed.",
    description: "Digital Friendship Day gifts full of memories, photos and inside jokes. Send a private link they’ll open again and again.",
  },
  "best-friends": {
    title: "Best Friends Day gift templates",
    heading: "Your best friend deserves a whole website.",
    description: "Personalised digital gifts for your best friend: shared memories, a quiz only they could pass and a letter to finish.",
  },
  apology: {
    title: "Apology message templates",
    heading: "Sorry, said with more than a text.",
    description: "A heartfelt digital apology with your words, a few small promises and a gentle way to make it right. Private and personal.",
  },
  family: {
    title: "Family gift templates",
    heading: "For Maa, Papa and everyone at home.",
    description: "Personalised digital gifts for family: photos, a thank-you letter and memories, in Hindi or English. Opens on any phone.",
  },
};

export function isOccasionId(value: unknown): value is OccasionId {
  return occasions.some((o) => o.id === value);
}
