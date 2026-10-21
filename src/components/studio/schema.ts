import {
  Award,
  GalleryHorizontal,
  ImageIcon,
  ListOrdered,
  Music,
  Timer,
  Cake,
  Calculator,
  Candy,
  DoorOpen,
  Feather,
  Flag,
  Flower2,
  Gauge,
  Gem,
  Gift,
  HelpCircle,
  Heart,
  Images,
  Lamp,
  LayoutGrid,
  Mail,
  MapPin,
  Mic,
  PartyPopper,
  PenLine,
  Receipt,
  Sparkles,
  SquareStack,
  Star,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Scene, SceneType } from "@/components/story/types";

/** One editable field in the inspector. */
export type FieldDef =
  | { key: string; label: string; kind: "text" | "textarea"; placeholder?: string; max?: number; help?: string; optional?: boolean }
  | { key: string; label: string; kind: "number"; min: number; max: number }
  | { key: string; label: string; kind: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; kind: "toggle"; help?: string }
  | { key: string; label: string; kind: "image"; help?: string; optional?: boolean }
  | { key: string; label: string; kind: "multi"; options: { value: string; label: string }[]; min: number; max: number }
  | { key: string; label: string; kind: "strings"; itemLabel: string; max: number; placeholder?: string }
  | { key: string; label: string; kind: "list"; itemLabel: string; max: number; item: FieldDef[]; newItem: () => Record<string, unknown>; title: (item: Record<string, unknown>) => string };

export type SceneCategory = "Website" | "Openers" | "About them" | "Games" | "Paper & keepsakes" | "Feelings" | "Reading" | "Endings";

type SceneSchema = {
  name: string;
  category: SceneCategory;
  icon: LucideIcon;
  blurb: string;
  fields: FieldDef[];
  /** Content for a freshly added scene. */
  create: () => Scene;
};

const heading: FieldDef[] = [
  { key: "eyebrow", label: "Small label", kind: "text", max: 40, placeholder: "e.g. For you", optional: true },
  { key: "title", label: "Headline", kind: "text", max: 80, help: "Wrap words in *stars* to highlight them." },
  { key: "hint", label: "Instruction", kind: "text", max: 60, placeholder: "What to do", optional: true },
  { key: "done", label: "When finished", kind: "text", max: 60, placeholder: "Shown after the game", optional: true },
];

const tones = ["sun", "sea", "night", "rose", "leaf", "dusk"].map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }));

export const sceneSchemas: Record<SceneType, SceneSchema> = {
  seal: {
    name: "Wax seal",
    category: "Openers",
    icon: Mail,
    blurb: "Press and hold to break the seal; a note slides out.",
    fields: [...heading, { key: "note", label: "Note inside", kind: "text", max: 60 }],
    create: () => ({ type: "seal", eyebrow: "For {to}", title: "Open this *slowly.*", hint: "Press and hold the seal", note: "I have something to tell you." }),
  },
  scratch: {
    name: "Scratch card",
    category: "Openers",
    icon: Sparkles,
    blurb: "Scratch away the foil to reveal a message.",
    fields: [...heading, { key: "reveal", label: "Hidden message", kind: "text", max: 60 }, { key: "sub", label: "Small print", kind: "text", max: 40 }],
    create: () => ({ type: "scratch", eyebrow: "A secret", title: "Scratch here, *gently.*", hint: "Scratch the card", reveal: "You’re my favourite person.", sub: "Always" }),
  },
  lights: {
    name: "Dark room",
    category: "Openers",
    icon: Lamp,
    blurb: "Light each candle; the room warms up and the message appears.",
    fields: [...heading, { key: "candles", label: "Candles", kind: "number", min: 1, max: 6 }, { key: "reveal", label: "Headline once lit", kind: "text", max: 80 }],
    create: () => ({ type: "lights", eyebrow: "Shh…", title: "It’s a little *dark* in here.", hint: "Tap each candle", candles: 3, reveal: "Hi, *{to}.*" }),
  },
  knock: {
    name: "Knock knock",
    category: "Openers",
    icon: DoorOpen,
    blurb: "Knock on the door until it swings open.",
    fields: [...heading, { key: "reveal", label: "Behind the door", kind: "text", max: 60 }],
    create: () => ({ type: "knock", eyebrow: "Who’s there?", title: "Someone’s at the *door.*", hint: "Knock three times", knocks: 3, reveal: "It’s me, with a surprise." }),
  },
  unwrap: {
    name: "Gift box",
    category: "Openers",
    icon: Gift,
    blurb: "Tap the box until the lid flies off.",
    fields: [...heading, { key: "inside", label: "What’s inside", kind: "text", max: 60 }, { key: "insideSub", label: "Small print", kind: "text", max: 40 }],
    create: () => ({ type: "unwrap", eyebrow: "For {to}", title: "{from} sent you *something.*", hint: "Tap the box three times", taps: 3, inside: "A little surprise", insideSub: "Keep going ↓" }),
  },
  hero: {
    name: "Photo hero",
    category: "Website",
    icon: ImageIcon,
    blurb: "A full-screen photo with a big title. Best as the first section.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Big title", kind: "text", max: 40, help: "Wrap words in *stars* to highlight them." },
      { key: "subtitle", label: "Line at the bottom", kind: "text", max: 40 },
      { key: "photo", label: "Photo", kind: "image", help: "A photo of the two of you, or of them.", optional: true },
      { key: "nav", label: "Menu name", kind: "text", max: 14, placeholder: "Home" },
    ],
    create: () => ({ type: "hero", title: "Us, *lately.*", subtitle: "my favourite person", tone: "rose" }),
  },
  countdown: {
    name: "Countdown",
    category: "Website",
    icon: Timer,
    blurb: "Counts down to a date, live. If the date has passed, it counts up.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40, placeholder: "Counting down to" },
      { key: "date", label: "Date (YYYY-MM-DD)", kind: "text", max: 10, placeholder: "2027-02-14" },
      { key: "title", label: "Line under it", kind: "text", max: 60 },
      { key: "caption", label: "Small print", kind: "text", max: 60 },
      { key: "nav", label: "Menu name", kind: "text", max: 14, placeholder: "Countdown" },
    ],
    create: () => ({ type: "countdown", date: "2027-02-14", eyebrow: "Our next anniversary", title: "Not that I’m *counting.*" }),
  },
  noticed: {
    name: "Things I’ve noticed",
    category: "Website",
    icon: ListOrdered,
    blurb: "Numbered cards, each a small thing you’ve noticed about them.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Headline", kind: "text", max: 90, help: "Wrap words in *stars* to highlight them." },
      { key: "nav", label: "Menu name", kind: "text", max: 14, placeholder: "Notes" },
      {
        key: "items",
        label: "Cards",
        kind: "list",
        itemLabel: "Card",
        max: 6,
        item: [
          { key: "title", label: "Title", kind: "text", max: 40 },
          { key: "text", label: "What you noticed", kind: "textarea", max: 240 },
        ],
        newItem: () => ({ title: "The little things", text: "Write something you’ve noticed." }),
        title: (i) => String(i.title || "Card"),
      },
    ],
    create: () => ({ type: "noticed", eyebrow: "A few things I’ve noticed", title: "Small things, *big deal.*", items: [{ title: "The laugh", text: "You laugh before the punchline. Every time." }] }),
  },
  gallery: {
    name: "Photo gallery",
    category: "Website",
    icon: GalleryHorizontal,
    blurb: "Photos that stack on top of each other as you scroll.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Headline", kind: "text", max: 90, help: "Wrap words in *stars* to highlight them." },
      { key: "nav", label: "Menu name", kind: "text", max: 14, placeholder: "Photos" },
      {
        key: "photos",
        label: "Photos",
        kind: "list",
        itemLabel: "Photo",
        max: 8,
        item: [
          { key: "caption", label: "Caption", kind: "text", max: 30 },
          { key: "date", label: "Date", kind: "text", max: 16 },
          { key: "tone", label: "Placeholder colour", kind: "select", options: tones },
        ],
        newItem: () => ({ caption: "A good day", tone: "sun" }),
        title: (i) => String(i.caption || "Photo"),
      },
    ],
    create: () => ({ type: "gallery", eyebrow: "Our little archive", title: "Too many good ones to *pick one.*", photos: [{ caption: "Us", tone: "rose" }, { caption: "That trip", tone: "sun" }] }),
  },
  playlist: {
    name: "Playlist",
    category: "Website",
    icon: Music,
    blurb: "Your songs — paste a link or upload a file, each with a cover photo.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Headline", kind: "text", max: 90, help: "Wrap words in *stars* to highlight them." },
      { key: "nav", label: "Menu name", kind: "text", max: 14, placeholder: "Songs" },
      {
        key: "songs",
        label: "Songs",
        kind: "list",
        itemLabel: "Song",
        max: 6,
        item: [
          { key: "title", label: "Song", kind: "text", max: 40 },
          { key: "note", label: "Why this one", kind: "text", max: 60 },
          { key: "tone", label: "Placeholder colour", kind: "select", options: tones },
        ],
        newItem: () => ({ title: "Our song", note: "You know why", tone: "dusk" }),
        title: (i) => String(i.title || "Song"),
      },
    ],
    create: () => ({ type: "playlist", eyebrow: "Songs for tonight", title: "Play one. *Think of me.*", songs: [{ title: "Tum Se Hi", note: "the obvious one", tone: "dusk" }] }),
  },
  spotlight: {
    name: "Spotlight",
    category: "About them",
    icon: Star,
    blurb: "Their photo, taped to the page. Each tap sticks on a note about them.",
    fields: [
      ...heading,
      { key: "photo", label: "Their photo", kind: "image", help: "A favourite photo of them, smiling.", optional: true },
      { key: "tags", label: "Notes", kind: "strings", itemLabel: "Note", max: 6 },
    ],
    create: () => ({ type: "spotlight", eyebrow: "Look who it is", title: "The *star* of the day.", hint: "Tap the photo", tone: "rose", tags: ["Best laugh in any room", "Gives the best hugs", "Secretly hilarious"] }),
  },
  compliments: {
    name: "Pop the compliments",
    category: "About them",
    icon: Heart,
    blurb: "Floating bubbles; each one pops into a compliment.",
    fields: [...heading, { key: "bubbles", label: "Compliments", kind: "strings", itemLabel: "Compliment", max: 9 }],
    create: () => ({ type: "compliments", eyebrow: "Facts only", title: "Things I never *say enough.*", hint: "Pop every bubble", bubbles: ["You make hard days lighter.", "Your taste in music? Elite.", "You always know what to say."] }),
  },
  dandelion: {
    name: "Make a wish",
    category: "Feelings",
    icon: Feather,
    blurb: "Hold to blow a dandelion; the seeds carry the wish away.",
    fields: heading,
    create: () => ({ type: "dandelion", eyebrow: "Before anything else", title: "Close your eyes. *Make a wish.*", hint: "Press and hold", done: "Wish sent ✓✓" }),
  },
  cake: {
    name: "Cake",
    category: "Feelings",
    icon: Cake,
    blurb: "Number candles for their age; tap each flame to blow it out.",
    fields: [...heading, { key: "age", label: "Age on the candles", kind: "number", min: 1, max: 120 }],
    create: () => ({ type: "cake", eyebrow: "Cake time", title: "Make a wish, then *blow.*", hint: "Tap each flame", age: 25 }),
  },
  meter: {
    name: "Tap meter",
    category: "Feelings",
    icon: Gauge,
    blurb: "Tap fast to push the meter past 100%.",
    fields: [...heading, { key: "label", label: "Meter name", kind: "text", max: 30 }, { key: "levels", label: "Levels, low to high", kind: "strings", itemLabel: "Level", max: 6 }],
    create: () => ({ type: "meter", eyebrow: "Honest answer", title: "How much do I *love you?*", hint: "Tap fast to fill it up", label: "Love level", levels: ["A lot", "Loads", "Tons", "Off the charts"] }),
  },
  receipt: {
    name: "Receipt",
    category: "Paper & keepsakes",
    icon: Receipt,
    blurb: "A little printer prints one line per tap.",
    fields: [
      ...heading,
      { key: "store", label: "Shop name", kind: "text", max: 30 },
      {
        key: "items",
        label: "Lines",
        kind: "list",
        itemLabel: "Line",
        max: 8,
        item: [
          { key: "name", label: "Item", kind: "text", max: 40 },
          { key: "qty", label: "Amount", kind: "text", max: 16 },
        ],
        newItem: () => ({ name: "Something lovely", qty: "1" }),
        title: (i) => String(i.name || "Line"),
      },
      { key: "total", label: "Total", kind: "text", max: 24 },
    ],
    create: () => ({ type: "receipt", eyebrow: "Itemised", title: "Everything you *gave* me.", hint: "Tap to print", store: "The {to} Store", items: [{ name: "Laughs", qty: "∞" }, { name: "Late-night chai", qty: "214" }], total: "Priceless" }),
  },
  deck: {
    name: "Reasons deck",
    category: "Paper & keepsakes",
    icon: SquareStack,
    blurb: "Swipe through a stack of cards.",
    fields: [...heading, { key: "cards", label: "Cards", kind: "strings", itemLabel: "Card", max: 10 }],
    create: () => ({ type: "deck", eyebrow: "Reasons", title: "Why it’s *you.*", hint: "Swipe or tap each card", cards: ["Your laugh.", "Your kindness.", "Everything else."] }),
  },
  coupon: {
    name: "Coupon",
    category: "Paper & keepsakes",
    icon: Ticket,
    blurb: "Drag the scissors to tear off a coupon.",
    fields: [...heading, { key: "offer", label: "The offer", kind: "text", max: 50 }, { key: "terms", label: "Terms", kind: "text", max: 50 }],
    create: () => ({ type: "coupon", eyebrow: "For you", title: "A little *something.*", hint: "Tear along the dotted line", offer: "One dinner, my treat", terms: "Valid forever" }),
  },
  jar: {
    name: "Jar of notes",
    category: "Paper & keepsakes",
    icon: Candy,
    blurb: "Shake the jar; a folded note pops out each time.",
    fields: [...heading, { key: "notes", label: "Notes", kind: "strings", itemLabel: "Note", max: 10 }],
    create: () => ({ type: "jar", eyebrow: "Little notes", title: "A jar of *small things.*", hint: "Shake the jar for a note", notes: ["You make every day better.", "Thank you for being you."] }),
  },
  polaroids: {
    name: "Polaroids",
    category: "Paper & keepsakes",
    icon: Images,
    blurb: "Tap each photo to shake it until it develops.",
    fields: [
      ...heading,
      {
        key: "photos",
        label: "Photos",
        kind: "list",
        itemLabel: "Photo",
        max: 6,
        item: [
          { key: "caption", label: "Caption", kind: "text", max: 30 },
          { key: "date", label: "Date", kind: "text", max: 16, placeholder: "e.g. Dec ’24" },
          { key: "tone", label: "Placeholder colour", kind: "select", options: tones },
        ],
        newItem: () => ({ caption: "A good day", tone: "sun" }),
        title: (i) => String(i.caption || "Photo"),
      },
    ],
    create: () => ({ type: "polaroids", eyebrow: "Remember these?", title: "Shake them *awake.*", hint: "Tap each photo", photos: [{ caption: "That day", tone: "sun" }, { caption: "Us", tone: "rose" }] }),
  },
  quiz: {
    name: "Quiz",
    category: "Games",
    icon: HelpCircle,
    blurb: "Multiple choice where every answer gets a cheeky reply.",
    fields: [
      ...heading,
      {
        key: "questions",
        label: "Questions",
        kind: "list",
        itemLabel: "Question",
        max: 5,
        item: [
          { key: "q", label: "Question", kind: "text", max: 80 },
          { key: "options", label: "Answers", kind: "strings", itemLabel: "Answer", max: 4 },
          { key: "reply", label: "Reply after answering", kind: "text", max: 60 },
        ],
        newItem: () => ({ q: "What’s my favourite thing about you?", options: ["Your laugh", "Your heart", "Everything"], reply: "Correct. All of it." }),
        title: (i) => String(i.q || "Question"),
      },
    ],
    create: () => ({ type: "quiz", eyebrow: "Pop quiz", title: "How well do you know *us?*", hint: "Pick an answer", questions: [{ q: "Who said hi first?", options: ["{to}", "{from}"], reply: "We’ll never agree." }] }),
  },
  match: {
    name: "Memory match",
    category: "Games",
    icon: LayoutGrid,
    blurb: "Flip cards two at a time to find the pairs.",
    fields: [
      ...heading,
      {
        key: "symbols",
        label: "Pictures",
        kind: "multi",
        min: 2,
        max: 4,
        options: ["heart", "star", "cake", "sun", "ring", "flower"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
      },
    ],
    create: () => ({ type: "match", eyebrow: "A little game", title: "Find the *pairs.*", hint: "Flip two cards at a time", symbols: ["heart", "star", "flower"] }),
  },
  stars: {
    name: "Constellation",
    category: "Games",
    icon: Sparkles,
    blurb: "Connect the stars in a night sky until they make a heart.",
    fields: [...heading, { key: "reveal", label: "Headline once drawn", kind: "text", max: 80 }],
    create: () => ({ type: "stars", eyebrow: "Look up", title: "Connect the *stars.*", hint: "Tap the glowing star, then the next", reveal: "Written in the *stars.*" }),
  },
  question: {
    name: "Runaway “No”",
    category: "Games",
    icon: Flag,
    blurb: "A big question where the No button keeps running away.",
    fields: [
      ...heading,
      { key: "question", label: "The question", kind: "text", max: 60 },
      { key: "yes", label: "Yes button", kind: "text", max: 20 },
      { key: "no", label: "No button", kind: "text", max: 20 },
      { key: "after", label: "After they say yes", kind: "text", max: 60 },
    ],
    create: () => ({ type: "question", eyebrow: "Big question", title: "So…", question: "Will you go on a date with me?", yes: "Yes", no: "No", after: "Best answer ever." }),
  },
  ringbox: {
    name: "Ring box",
    category: "Games",
    icon: Gem,
    blurb: "Tap to open a ring box; the ring rises and sparkles.",
    fields: [...heading, { key: "question", label: "Question under the ring", kind: "text", max: 60 }],
    create: () => ({ type: "ringbox", eyebrow: "One more thing", title: "Open the *box.*", hint: "Tap the box", question: "Will you marry me?" }),
  },
  bouquet: {
    name: "Bouquet",
    category: "Games",
    icon: Flower2,
    blurb: "Add flowers to a vase one by one; a card appears.",
    fields: [...heading, { key: "flowers", label: "Flowers", kind: "number", min: 1, max: 24 }, { key: "card", label: "Card on the vase", kind: "text", max: 30 }],
    create: () => ({ type: "bouquet", eyebrow: "Fresh flowers", title: "A bouquet, *picked by me.*", hint: "Add five flowers", flowers: 5, card: "For you ♥" }),
  },
  award: {
    name: "Award",
    category: "Games",
    icon: Award,
    blurb: "Polish a dusty trophy or medal until the engraving shows.",
    fields: [
      ...heading,
      { key: "trophy", label: "Type", kind: "select", options: [{ value: "cup", label: "Trophy" }, { value: "medal", label: "Medal" }] },
      { key: "engraving", label: "Engraving", kind: "text", max: 40 },
    ],
    create: () => ({ type: "award", eyebrow: "Award ceremony", title: "And the award *goes to…*", hint: "Tap to polish it", trophy: "cup", engraving: "World’s best {to}" }),
  },
  map: {
    name: "Memory map",
    category: "Games",
    icon: MapPin,
    blurb: "Tap the pins along a dotted path to reveal each memory.",
    fields: [
      ...heading,
      {
        key: "pins",
        label: "Places",
        kind: "list",
        itemLabel: "Place",
        max: 6,
        item: [
          { key: "place", label: "Place", kind: "text", max: 30 },
          { key: "when", label: "When", kind: "text", max: 20 },
          { key: "memory", label: "Memory", kind: "textarea", max: 140 },
        ],
        newItem: () => ({ place: "Somewhere special", when: "2025", memory: "What happened there." }),
        title: (i) => String(i.place || "Place"),
      },
    ],
    create: () => ({ type: "map", eyebrow: "Our places", title: "Where it all *happened.*", hint: "Tap the glowing pin", pins: [{ place: "Where we met", when: "Day one", memory: "The start of everything." }, { place: "Today", when: "Now", memory: "Still my favourite person." }] }),
  },
  letter: {
    name: "Letter",
    category: "Reading",
    icon: PenLine,
    blurb: "Your words, revealed paragraph by paragraph.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Headline", kind: "text", max: 80, help: "Wrap words in *stars* to highlight them." },
      { key: "paragraphs", label: "Paragraphs", kind: "strings", itemLabel: "Paragraph", max: 6 },
      { key: "signoff", label: "Sign-off", kind: "text", max: 40 },
      { key: "photo", label: "Pinned photo", kind: "image", help: "Optional: a photo of you two, pinned to the corner.", optional: true },
    ],
    create: () => ({ type: "letter", eyebrow: "A letter", title: "Just so you *know.*", paragraphs: ["Write something from the heart."], signoff: "— {from}" }),
  },
  numbers: {
    name: "By the numbers",
    category: "Reading",
    icon: Calculator,
    blurb: "Big numbers that count up.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Headline", kind: "text", max: 80 },
      {
        key: "stats",
        label: "Numbers",
        kind: "list",
        itemLabel: "Number",
        max: 4,
        item: [
          { key: "value", label: "Number", kind: "number", min: 0, max: 99999999 },
          { key: "suffix", label: "After the number", kind: "text", max: 4, placeholder: "e.g. + or M" },
          { key: "label", label: "Label", kind: "text", max: 40 },
        ],
        newItem: () => ({ value: 100, label: "something worth counting" }),
        title: (i) => `${i.value ?? ""} ${i.label ?? ""}`.trim() || "Number",
      },
    ],
    create: () => ({ type: "numbers", eyebrow: "By the numbers", title: "Us, *counted.*", stats: [{ value: 365, label: "days of you" }, { value: 1, label: "favourite person" }] }),
  },
  wishes: {
    name: "Friends’ wishes",
    category: "Reading",
    icon: Users,
    blurb: "A wall of messages from friends and family.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Headline", kind: "text", max: 80 },
      {
        key: "wishes",
        label: "Wishes",
        kind: "list",
        itemLabel: "Wish",
        max: 15,
        item: [
          { key: "name", label: "Name", kind: "text", max: 24 },
          { key: "message", label: "Message", kind: "textarea", max: 200 },
        ],
        newItem: () => ({ name: "A friend", message: "Sending so much love!" }),
        title: (i) => String(i.name || "Wish"),
      },
    ],
    create: () => ({ type: "wishes", eyebrow: "From everyone", title: "Everyone has *something* to say.", wishes: [{ name: "A friend", message: "Sending so much love!" }] }),
  },
  voice: {
    name: "Voice note",
    category: "Reading",
    icon: Mic,
    blurb: "A voice note with a waveform. You record yours at checkout.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Headline", kind: "text", max: 80 },
      { key: "transcript", label: "What you’ll say", kind: "textarea", max: 300, help: "The preview reads this aloud in a computer voice." },
      { key: "seconds", label: "Length (seconds)", kind: "number", min: 3, max: 59 },
    ],
    create: () => ({ type: "voice", eyebrow: "Press play", title: "Hear it in *my voice.*", transcript: "Hey {to}! I just wanted you to hear this from me.", seconds: 8 }),
  },
  finale: {
    name: "Finale",
    category: "Endings",
    icon: PartyPopper,
    blurb: "The last page: a photo collage, replay and optional extras.",
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text", max: 40 },
      { key: "title", label: "Headline", kind: "text", max: 80, help: "Wrap words in *stars* to highlight them." },
      { key: "thankYou", label: "Thank-you reply button", kind: "toggle" },
      { key: "keepsake", label: "Keepsake poster download", kind: "toggle" },
      {
        key: "photos",
        label: "Photo collage",
        kind: "list",
        itemLabel: "Photo",
        max: 5,
        item: [
          { key: "caption", label: "Caption", kind: "text", max: 30 },
          { key: "tone", label: "Placeholder colour", kind: "select", options: tones },
        ],
        newItem: () => ({ caption: "Us", tone: "rose" }),
        title: (i) => String(i.caption || "Photo"),
      },
    ],
    create: () => ({ type: "finale", eyebrow: "And finally", title: "With love, *{from}.*" }),
  },
};

export const categoryOrder: SceneCategory[] = ["Website", "Openers", "About them", "Games", "Paper & keepsakes", "Feelings", "Reading"];

/** A short line describing a scene in the layers list. */
export function sceneSubtitle(scene: Scene) {
  return (scene.eyebrow || scene.title || "").replace(/\*/g, "");
}

/** The list field that shows as child layers, if the scene has one. */
export function childField(type: SceneType) {
  return sceneSchemas[type].fields.find((f) => f.kind === "list" || f.kind === "strings") as
    | Extract<FieldDef, { kind: "list" | "strings" }>
    | undefined;
}
