export const siteConfig = {
  name: "TyniTales",
  tagline: "Gift a feeling.",
  description:
    "Make a personalised digital gift in a minute: a little page with your photos, words, games and music for birthdays, anniversaries, apologies and more.",
  url: "https://tynitales.com",
  nav: [
    { label: "Templates", href: "/templates" },
    { label: "How it works", href: "/#how" },
    { label: "Love notes", href: "/#love-notes" },
    { label: "Profile", href: "/profile" },
  ],
  contact: {
    email: "support.tynitales@gmail.com",
    /** WhatsApp number, digits only with country code (wa.me format). */
    whatsapp: "918789974703",
    whatsappLabel: "+91 87899 74703",
  },
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

/**
 * Search-friendly copy for each occasion's page (/templates/for/<occasion>).
 * title: the browser tab and search result title (" · TyniTales" is added).
 * gift: how a single template of this occasion is described in its title.
 * intro + faqs: shown below the templates, answering what people search for.
 * Only state what the product really does; keep it in line with the main FAQ.
 */
export const occasionSeo: Record<
  OccasionId,
  {
    title: string;
    gift: string;
    heading: string;
    description: string;
    intro: string;
    faqs: { q: string; a: string }[];
    /** A guide that helps with this occasion, linked under the intro. */
    guide?: { slug: string; label: string };
  }
> = {
  birthday: {
    title: "Digital Birthday Gifts & Surprise Websites",
    gift: "Digital Birthday Gift",
    heading: "Birthday surprises they’ll replay all year.",
    description: "Personalised digital birthday gifts: blow out candles, unlock wishes from friends and read a letter from you. Ready in minutes, opens on any phone.",
    intro:
      "A birthday gift from TyniTales is a little website made for one person. They tap your link and play through it: blow out the candles, open the presents, flick through your photos and finish on a letter from you. Set it to open at midnight and it’s waiting for them the moment their birthday starts.",
    faqs: [
      { q: "How do I make a birthday surprise website without coding?", a: "Pick a birthday template, change the names, add your photos and rewrite the lines in your own words. There’s nothing to build or host: when you’re happy, make it live and you get one private link to send." },
      { q: "Can the birthday surprise open exactly at midnight?", a: "Yes. Choose the date and time when you make it live. Before then the link shows a countdown, and the gift opens right on time." },
      { q: "Does it work if we live in different cities?", a: "That’s what it’s made for. The link opens on any phone or laptop, anywhere, with no app or sign-up, so a far-away birthday still gets a proper surprise." },
    ],
  },
  anniversary: {
    title: "Digital Anniversary Gifts & Surprise Pages",
    gift: "Digital Anniversary Gift",
    heading: "For every year you’ve chosen each other.",
    description: "Digital anniversary gifts with your photos, your songs and a letter that unlocks page by page. Schedule it to open at midnight.",
    intro:
      "An anniversary gift that tells your story back to them: the photos you keep scrolling to, the song that’s yours, little moments from the years in between, and a letter that unlocks at the end. It lives at a private link that never expires, so they can open it again next year.",
    faqs: [
      { q: "What’s a good anniversary gift if we’re long distance?", a: "Something they can open where they are. A TyniTales gift arrives as a link, opens on their phone at the time you choose, and is full of your photos and words, so it feels personal even from far away." },
      { q: "Can I add our photos and our song?", a: "Yes. Add your own photos to each page and pick a song to play while they go through it." },
      { q: "Can I make it for a wedding anniversary?", a: "Yes. The templates work for any anniversary: first month, first year or twenty-fifth. You write the words, so it fits your story." },
    ],
  },
  love: {
    title: "Love Letter Templates: Send a Digital Love Letter",
    gift: "Digital Love Letter",
    heading: "Say it properly, for once.",
    description: "Write a digital love letter they open like a sealed envelope, with photos, little games and your words. Personal, private, no app needed.",
    intro:
      "A digital love letter they open like a real one: break the seal, read it page by page, with your photos tucked in between. You write every word yourself, so it sounds like you, and it stays private: only someone with the link (and the password, if you add one) can open it.",
    guide: { slug: "how-to-write-a-love-letter", label: "Stuck on the words? How to write a love letter, with examples" },
    faqs: [
      { q: "How do I send a love letter online?", a: "Choose a love letter template, write your letter, add photos if you like, then make it live. You get a private link to send on WhatsApp, Instagram or anywhere else." },
      { q: "Can anyone else read it?", a: "Only people with the link, and you can lock it with a password too. Gift pages are hidden from Google and never listed anywhere." },
      { q: "Can I write it in Hindi?", a: "Yes. You can write your letter in Hindi or English, or mix both the way you’d actually talk." },
    ],
  },
  "girlfriend-day": {
    title: "Girlfriend’s Day Gifts: A Surprise Page for Her",
    gift: "Girlfriend’s Day Gift",
    heading: "A Girlfriend’s Day gift that’s actually about her.",
    description: "Make her a personalised digital surprise for Girlfriend’s Day: photos, inside jokes, a quiz about you two and a letter at the end.",
    intro:
      "Girlfriend’s Day (1 August) is the perfect excuse to make her something only you could. A surprise page with your photos, your inside jokes, a little quiz about the two of you and a letter at the end, sent as a link she can open wherever she is.",
    faqs: [
      { q: "When is Girlfriend’s Day?", a: "National Girlfriend Day is celebrated on 1 August. A TyniTales gift can be scheduled to open right at midnight." },
      { q: "Is this better than a physical gift?", a: "It’s different: it’s about your story, not a thing. Many people send it alongside a small present, or use it when they can’t be there in person." },
      { q: "How long does it take to make?", a: "Most people finish in a few minutes. Your draft saves on your device as you go, so you can also take your time." },
    ],
  },
  "boyfriend-day": {
    title: "Boyfriend’s Day Gifts: A Surprise Page for Him",
    gift: "Boyfriend’s Day Gift",
    heading: "Make his Boyfriend’s Day.",
    description: "Personalised digital gifts for Boyfriend’s Day with awards, your photos, his songs and a note from you. Ready in minutes.",
    intro:
      "National Boyfriend Day (3 October) deserves more than a text. Make him a surprise page with silly awards, your photos, a song he loves and a note from you at the end. He just taps the link, no app, no sign-up.",
    faqs: [
      { q: "When is Boyfriend’s Day?", a: "National Boyfriend Day is celebrated on 3 October. You can schedule your gift to open at midnight that day." },
      { q: "What do I put in a gift for my boyfriend?", a: "Your favourite photos of him, the inside jokes only you two get, a song that reminds you of him and a few honest lines. The templates give you the structure; you fill in the story." },
      { q: "Will I know when he opens it?", a: "Yes. Sign in and you can see whether your gift has been opened, when, and how many times." },
    ],
  },
  friendship: {
    title: "Friendship Day Digital Gifts & Surprise Pages",
    gift: "Friendship Day Gift",
    heading: "For the friends who stayed.",
    description: "Digital Friendship Day gifts full of memories, photos and inside jokes. Send a private link they’ll open again and again.",
    intro:
      "Friendship Day is the first Sunday of August in India. Instead of another forward, send your friends a page of your memories together: the photos, the inside jokes and the things you never actually say out loud.",
    faqs: [
      { q: "When is Friendship Day in India?", a: "Friendship Day is celebrated in India on the first Sunday of August." },
      { q: "Can I make one gift for a whole group of friends?", a: "Yes. Make one gift and share the same link in your group chat. Everyone with the link can open it." },
      { q: "Do my friends need to download anything?", a: "No. It opens in any browser on any phone or laptop." },
    ],
  },
  "best-friends": {
    title: "Digital Gifts for Your Best Friend",
    gift: "Best Friend Gift",
    heading: "Your best friend deserves a whole website.",
    description: "Personalised digital gifts for your best friend: shared memories, a quiz only they could pass and a letter to finish.",
    intro:
      "For the person who knows everything about you: a page of your best memories together, a quiz only they could pass and a letter to finish. Send it for Best Friends Day (8 June), their birthday, or just because.",
    faqs: [
      { q: "What’s a thoughtful gift for a best friend who lives far away?", a: "Something made just for them that arrives instantly. A TyniTales gift is a private link full of your photos and memories that opens on their phone wherever they are." },
      { q: "When is Best Friends Day?", a: "National Best Friends Day is celebrated on 8 June. But a best friend gift works any day." },
      { q: "Can I add our inside jokes?", a: "Yes. Every line is editable, so you can fill it with the jokes and memories only the two of you understand." },
    ],
  },
  apology: {
    title: "Apology Gifts: Say Sorry With a Personal Page",
    gift: "Apology Gift",
    heading: "Sorry, said with more than a text.",
    description: "A heartfelt digital apology with your words, a few small promises and a gentle way to make it right. Private and personal.",
    intro:
      "When a text feels too small, say sorry with something you actually made. An apology page with your own words, a few honest promises and a gentle way for them to answer. It’s private, and you write every line, so it sounds like you, not a template.",
    faqs: [
      { q: "How do I apologise to my girlfriend or boyfriend in a meaningful way?", a: "Be specific about what you’re sorry for, take responsibility and say what you’ll do differently. An apology page helps you say it properly, but the words should be yours." },
      { q: "Is it private?", a: "Yes. Only someone with the link can open it, you can add a password, and gift pages never appear in search results." },
      { q: "Can I edit it after sending?", a: "Yes, for 7 days after it goes live. The same link updates." },
    ],
  },
  family: {
    title: "Digital Gifts for Maa, Papa & Family",
    gift: "Gift for Family",
    heading: "For Maa, Papa and everyone at home.",
    description: "Personalised digital gifts for family: photos, a thank-you letter and memories, in Hindi or English. Opens on any phone.",
    intro:
      "A gift for Maa, Papa, Bhai or Didi: old photos, the memories you share and a thank-you you don’t say often enough. Write it in Hindi or English. It opens on any phone with one tap, so even family who don’t like apps can open it.",
    faqs: [
      { q: "Can I write the gift in Hindi?", a: "Yes. Family templates work in Hindi, English or a mix of both." },
      { q: "Will it work on my parents’ phone?", a: "Yes. It’s just a link: it opens in the browser on any phone, with nothing to install and no account." },
      { q: "Can I make it for a birthday or anniversary of my parents?", a: "Yes. Use a family template for a thank-you, or the birthday and anniversary templates for those days." },
    ],
  },
};

export function isOccasionId(value: unknown): value is OccasionId {
  return occasions.some((o) => o.id === value);
}
