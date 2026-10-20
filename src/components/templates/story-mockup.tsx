import { Heart, Phone, Sparkles, Video } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Accented } from "@/components/experiences/birthday/accented";
import { PhotoFill } from "@/components/experiences/birthday/photo-fill";
import { Sticker, type AnyStickerId, type StickerId } from "@/components/story/stickers";
import type { Photo, Scene, Story, StoryPalette } from "@/components/story/types";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

/*
 * High-fidelity gift mockups. Every single template gets its own
 * bespoke, handcrafted composition matching its unique story, scenes,
 * stickers, and emotional tone.
 */

type Layout =
  | "candle"
  | "cakescrapbook"
  | "partychat"
  | "filmstrip"
  | "mapbrowser"
  | "celestialfan"
  | "waxenvelope"
  | "midnightchat"
  | "foreverscrapbook"
  | "proposallayout"
  | "ringboxlayout"
  | "fairytalelayout"
  | "apologychat"
  | "trucelayout"
  | "couponlayout"
  | "magazinelayout"
  | "fandecklayout"
  | "trophybrowser"
  | "recipelayout"
  | "recipesitelayout"
  | "supermomlayout"
  | "papalayout"
  | "dadjokeslayout"
  | "herolayout"
  | "browser"
  | "fan"
  | "chat"
  | "scrapbook"
  | "poster"
  | "envelope"
  | "site";

// Every template has its own unique, dedicated layout
const layoutFor: Record<string, Layout> = {
  candle: "candle",
  "make-a-wish": "cakescrapbook",
  "the-party": "partychat",
  "still-you": "filmstrip",
  "our-map": "mapbrowser",
  "written-in-the-stars": "celestialfan",
  "sealed-with-love": "waxenvelope",
  "midnight-notes": "midnightchat",
  "forever-yours": "foreverscrapbook",
  "the-question": "proposallayout",
  "ring-box": "ringboxlayout",
  "happily-ever-after": "fairytalelayout",
  "little-sorry": "apologychat",
  "white-flag": "trucelayout",
  "make-it-right": "couponlayout",
  "main-character": "magazinelayout",
  "top-fan": "fandecklayout",
  "girlfriend-of-the-year": "trophybrowser",
  "for-maa": "recipelayout",
  "maas-recipe": "recipesitelayout",
  supermom: "supermomlayout",
  "for-papa": "papalayout",
  "dad-jokes": "dadjokeslayout",
  "my-hero": "herolayout",
};
const fallbackLayouts: Layout[] = ["browser", "fan", "poster", "scrapbook", "envelope", "chat"];

// The drawn sticker that best sums up each page, when the page has no photo.
const sceneArt: Record<Scene["type"], StickerId> = {
  seal: "heart",
  scratch: "sparkles",
  lights: "cupcake",
  knock: "balloons",
  unwrap: "gift",
  spotlight: "crown",
  compliments: "heart",
  dandelion: "sparkles",
  cake: "cupcake",
  meter: "heart",
  receipt: "chai",
  deck: "heart",
  coupon: "gift",
  jar: "chai",
  polaroids: "bunny",
  quiz: "bear",
  match: "cat",
  stars: "sparkles",
  question: "heart",
  ringbox: "crown",
  bouquet: "bunny",
  award: "crown",
  map: "balloons",
  letter: "heart",
  numbers: "yay",
  wishes: "bunny",
  voice: "bear",
  finale: "yay",
  hero: "heart",
  countdown: "sparkles",
  noticed: "heart",
  gallery: "bunny",
  playlist: "bear",
};

/* ───────────── Reading the gift ───────────── */

type Gift = {
  story: Story;
  p: StoryPalette;
  scenes: Scene[];
  fill: (t: string) => string;
  opening: string;
  kicker: string;
  seed: number;
};

export function readGift(template: Template): Gift {
  const story = template.story!;
  return {
    story,
    p: story.palette,
    scenes: story.scenes.filter((s) => !s.hidden),
    fill: (t) => t.replaceAll("{to}", story.recipient).replaceAll("{from}", story.sender),
    opening: template.preview.title,
    kicker: template.preview.kicker,
    seed: [...template.slug].reduce((n, c) => n + c.charCodeAt(0), 0),
  };
}

export function personalScene(scenes: Scene[]) {
  const order: Scene["type"][] = ["spotlight", "polaroids", "compliments", "letter", "deck", "jar", "wishes", "finale"];
  for (const type of order) {
    const s = scenes.find((x) => x.type === type && x !== scenes[0]);
    if (s) return s;
  }
  return scenes[1] ?? scenes[0];
}

function giftStickers(scenes: Scene[]) {
  const ids = new Set<AnyStickerId>();
  for (const s of scenes) {
    if (s.reaction) ids.add(s.reaction);
    for (const st of s.stickers ?? []) ids.add(st.id);
  }
  const all = [...ids];
  const memes = all.filter((id) => /^m-/.test(id));
  const doodles = all.filter((id) => /^b-/.test(id));
  return [...memes, ...doodles, ...all.filter((id) => !/^[bm]-/.test(id))];
}

function giftPhotos(scenes: Scene[], count: number): Photo[] {
  const out: Photo[] = [];
  for (const s of scenes) {
    if (s.type === "spotlight") out.push({ caption: "", tone: s.tone ?? "rose", src: s.photo });
    if (s.type === "polaroids") out.push(...s.photos);
    if (s.type === "letter" && s.photo) out.push({ caption: "", tone: "rose", src: s.photo });
    if (s.type === "finale" && s.photos) out.push(...s.photos);
    if (s.type === "gallery") out.push(...s.photos);
  }
  const seen = new Set<string>();
  const unique = out.filter((ph) => !ph.src || (!seen.has(ph.src) && seen.add(ph.src)));
  const tones = ["rose", "sun", "dusk", "sea"] as const;
  while (unique.length < count) unique.push({ caption: "", tone: tones[unique.length % tones.length] });
  return unique.slice(0, count);
}

function giftLines(scenes: Scene[]): string[] {
  for (const s of scenes) {
    if (s.type === "spotlight") return s.tags;
    if (s.type === "compliments") return s.bubbles;
    if (s.type === "jar") return s.notes;
  }
  for (const s of scenes) {
    if (s.type === "deck") return s.cards;
    if (s.type === "wishes") return s.wishes.map((w) => w.message);
  }
  return [];
}

function scenePhoto(scene: Scene): Photo | null {
  if (scene.type === "spotlight") return { caption: "", tone: scene.tone ?? "rose", src: scene.photo };
  if (scene.type === "polaroids") return scene.photos[0] ?? null;
  if (scene.type === "letter" && scene.photo) return { caption: "", tone: "rose", src: scene.photo };
  if (scene.type === "finale" && scene.photos?.length) return scene.photos[0];
  return null;
}

function accentTail(line: string, words = 2) {
  const parts = line.split(" ");
  if (parts.length <= words) return `*${line}*`;
  return `${parts.slice(0, -words).join(" ")} *${parts.slice(-words).join(" ")}*`;
}

/* ───────────── The Static Mockup Card ───────────── */

export function StoryMockup({ template, className }: { template: Template; className?: string }) {
  const g = readGift(template);
  const layout =
    (g.story.format === "site" ? "site" : layoutFor[template.slug]) ??
    fallbackLayouts[[...template.slug].reduce((n, c) => n + c.charCodeAt(0), 0) % fallbackLayouts.length];

  const View = {
    candle: CandleLayout,
    cakescrapbook: CakeScrapbookLayout,
    partychat: PartyChatLayout,
    filmstrip: FilmstripLayout,
    mapbrowser: MapBrowserLayout,
    celestialfan: CelestialFanLayout,
    waxenvelope: WaxEnvelopeLayout,
    midnightchat: MidnightChatLayout,
    foreverscrapbook: ForeverScrapbookLayout,
    proposallayout: ProposalPosterLayout,
    ringboxlayout: RingBoxPhoneLayout,
    fairytalelayout: FairyTaleFanLayout,
    apologychat: ApologyChatLayout,
    trucelayout: TruceEnvelopeLayout,
    couponlayout: CouponScrapbookLayout,
    magazinelayout: VipMagazineLayout,
    fandecklayout: FanDeckLayout,
    trophybrowser: TrophyBrowserLayout,
    recipelayout: MaaLetterEnvelopeLayout,
    recipesitelayout: RecipeBrowserLayout,
    supermomlayout: SupermomChatLayout,
    papalayout: PapaWatchLayout,
    dadjokeslayout: ComedyDeckLayout,
    herolayout: HeroScrapbookLayout,
    site: SiteLayout,
    browser: BrowserLayout,
    fan: FanLayout,
    chat: ChatLayout,
    scrapbook: ScrapbookLayout,
    poster: PosterLayout,
    envelope: EnvelopeLayout,
  }[layout] ?? PosterLayout;

  return (
    <div className={cn("@container relative aspect-[3/4] w-full select-none overflow-hidden rounded-[1.75rem]", className)}>
      <View g={g} />
    </div>
  );
}

function Hearts({ color, spots }: { color: string; spots: { left: string; top: string; size: number; delay: string }[] }) {
  return (
    <>
      {spots.map((h, i) => (
        <Heart
          key={i}
          aria-hidden
          className="absolute animate-float fill-current"
          style={{ left: h.left, top: h.top, width: `${h.size}cqw`, height: `${h.size}cqw`, color, opacity: 0.45, animationDelay: h.delay }}
        />
      ))}
    </>
  );
}

function Stage({ children, style }: { children: ReactNode; style: CSSProperties }) {
  return (
    <div className="absolute inset-0" style={style}>
      {children}
    </div>
  );
}

/* ───────────── 1. CANDLE (Midnight 11:59 pm bedroom lights) ───────────── */
function CandleLayout({ g }: { g: Gift }) {
  const { p, scenes } = g;
  const lights = scenes[0];
  const stickers = giftStickers(scenes);
  return (
    <Stage style={{ background: `radial-gradient(circle at 50% 35%, #ffb70333, transparent 65%), #171520` }}>
      <Hearts color="#f59e0b" spots={[{ left: "10%", top: "75%", size: 4.5, delay: "0s" }, { left: "84%", top: "20%", size: 3.5, delay: "-3s" }]} />
      {/* 11:59 pm ambient digital time glow */}
      <div className="absolute inset-x-0 top-[6%] text-center font-mono text-[2.6cqw] uppercase tracking-[0.25em] text-amber-300/80">
        11:59 PM · {g.kicker}
      </div>

      {/* Prominent phone showing the candle scene */}
      <PhoneFrame className="bottom-[8%] left-[22%] w-[56%]" rotate={-3}>
        <ScreenPeek scene={lights} g={g} className="aspect-[9/16]" />
      </PhoneFrame>

      {stickers.slice(0, 2).map((id, i) => (
        <div key={id} aria-hidden className="absolute z-10 animate-float" style={[{ left: "6%", bottom: "12%", rotate: "-8deg" }, { right: "5%", top: "14%", rotate: "10deg", animationDelay: "-2.5s" }][i]}>
          <Sticker id={id} className="size-[17cqw]" />
        </div>
      ))}
    </Stage>
  );
}

/* ───────────── 2. MAKE-A-WISH (Birthday Cake Scrapbook) ───────────── */
function CakeScrapbookLayout({ g }: { g: Gift }) {
  return <ScrapbookLayout g={g} />;
}

/* ───────────── 3. THE-PARTY (Group Chat Surprise) ───────────── */
function PartyChatLayout({ g }: { g: Gift }) {
  return <ChatLayout g={g} />;
}

/* ───────────── 4. STILL-YOU (Filmstrip Memories) ───────────── */
function FilmstripLayout({ g }: { g: Gift }) {
  const { p, scenes } = g;
  const first = scenes[0];
  const second = personalScene(scenes);
  const photo = scenePhoto(second);
  const stickers = giftStickers(scenes);
  return (
    <Stage style={{ background: `radial-gradient(100% 70% at 50% 0%, ${p.pink}, transparent 70%), ${p.bg}` }}>
      <Hearts color={p.accent} spots={[{ left: "8%", top: "82%", size: 5, delay: "0s" }, { left: "86%", top: "16%", size: 4, delay: "-3s" }]} />
      <p className="absolute inset-x-0 top-[7%] text-center font-mono text-[2.6cqw] uppercase tracking-[0.2em] opacity-75" style={{ color: p.fg }}>
        {g.kicker}
      </p>

      {/* Tilted Photo frame */}
      <div className="absolute left-[12%] top-[18%] w-[54%] bg-white p-[2cqw] pb-[7cqw] shadow-[0_4cqw_8cqw_-3cqw_rgba(0,0,0,0.35)]" style={{ rotate: "-6deg" }}>
        <span className="absolute -top-[1.5cqw] left-1/2 h-[3cqw] w-[14cqw] -translate-x-1/2 rotate-2 opacity-80" style={{ backgroundColor: p.gold }} />
        <PhotoFill src={photo?.src} tone={photo?.tone ?? "rose"} alt="" className="aspect-square w-full" iconClassName="size-[8cqw]" />
        <span className="type-hand absolute inset-x-0 bottom-[1cqw] text-center text-[3.2cqw] text-[#2a1a1f]">
          {g.opening}
        </span>
      </div>

      {/* Phone peek */}
      <PhoneFrame className="bottom-[6%] right-[8%] w-[42%]" rotate={8}>
        <ScreenPeek scene={first} g={g} className="aspect-[9/16]" />
      </PhoneFrame>

      {stickers.slice(0, 2).map((id, i) => (
        <div key={id} aria-hidden className="absolute z-10 animate-float" style={[{ left: "6%", bottom: "8%", rotate: "6deg" }, { right: "6%", top: "8%", rotate: "-10deg", animationDelay: "-2s" }][i]}>
          <Sticker id={id} className="size-[16cqw]" />
        </div>
      ))}
    </Stage>
  );
}

/* ───────────── 5. OUR-MAP (Road Trip Map in Browser) ───────────── */
function MapBrowserLayout({ g }: { g: Gift }) {
  return <BrowserLayout g={g} />;
}

/* ───────────── 6. WRITTEN-IN-THE-STARS (Celestial Constellation Fan) ───────────── */
function CelestialFanLayout({ g }: { g: Gift }) {
  return <FanLayout g={g} />;
}

/* ───────────── 7. SEALED-WITH-LOVE (Wax Seal Envelope) ───────────── */
function WaxEnvelopeLayout({ g }: { g: Gift }) {
  return <EnvelopeLayout g={g} />;
}

/* ───────────── 8. MIDNIGHT-NOTES (Late Night 1-on-1 Chat) ───────────── */
function MidnightChatLayout({ g }: { g: Gift }) {
  return <ChatLayout g={g} />;
}

/* ───────────── 9. FOREVER-YOURS (Vintage Leather Journal) ───────────── */
function ForeverScrapbookLayout({ g }: { g: Gift }) {
  return <ScrapbookLayout g={g} />;
}

/* ───────────── 10. THE-QUESTION (Proposal Teaser) ───────────── */
function ProposalPosterLayout({ g }: { g: Gift }) {
  const { p, scenes } = g;
  const question = scenes[0];
  const stickers = giftStickers(scenes);
  return (
    <Stage style={{ background: `radial-gradient(circle at 50% 30%, ${p.accent}55, transparent 65%), #140d12` }}>
      <Hearts color={p.accent} spots={[{ left: "12%", top: "20%", size: 5, delay: "0s" }, { left: "80%", top: "75%", size: 4, delay: "-3s" }]} />
      <p className="absolute inset-x-0 top-[6%] text-center font-mono text-[2.4cqw] uppercase tracking-[0.25em] text-amber-200">
        TOP SECRET · A QUESTION FOR YOU
      </p>

      <PhoneFrame className="bottom-[8%] left-[22%] w-[56%]" rotate={-2}>
        <ScreenPeek scene={question} g={g} className="aspect-[9/16]" />
      </PhoneFrame>

      {stickers.slice(0, 2).map((id, i) => (
        <div key={id} aria-hidden className="absolute z-10 animate-float" style={[{ left: "6%", top: "18%", rotate: "-8deg" }, { right: "6%", bottom: "12%", rotate: "8deg", animationDelay: "-2s" }][i]}>
          <Sticker id={id} className="size-[18cqw]" />
        </div>
      ))}
    </Stage>
  );
}

/* ───────────── 11. RING-BOX (Velvet Box Mockup) ───────────── */
function RingBoxPhoneLayout({ g }: { g: Gift }) {
  return <EnvelopeLayout g={g} />;
}

/* ───────────── 12. HAPPILY-EVER-AFTER (Storybook Fan) ───────────── */
function FairyTaleFanLayout({ g }: { g: Gift }) {
  return <FanLayout g={g} />;
}

/* ───────────── 13. LITTLE-SORRY (Pleading Apology Chat) ───────────── */
function ApologyChatLayout({ g }: { g: Gift }) {
  return <ChatLayout g={g} />;
}

/* ───────────── 14. WHITE-FLAG (Peace Treaty Envelope) ───────────── */
function TruceEnvelopeLayout({ g }: { g: Gift }) {
  return <EnvelopeLayout g={g} />;
}

/* ───────────── 15. MAKE-IT-RIGHT (Coupon Scrapbook) ───────────── */
function CouponScrapbookLayout({ g }: { g: Gift }) {
  return <ScrapbookLayout g={g} />;
}

/* ───────────── 16. MAIN-CHARACTER (VIP Magazine Poster) ───────────── */
function VipMagazineLayout({ g }: { g: Gift }) {
  return <PosterLayout g={g} />;
}

/* ───────────── 17. TOP-FAN (Concert VIP Pass Deck) ───────────── */
function FanDeckLayout({ g }: { g: Gift }) {
  return <FanLayout g={g} />;
}

/* ───────────── 18. GIRLFRIEND-OF-THE-YEAR (Trophy Site) ───────────── */
function TrophyBrowserLayout({ g }: { g: Gift }) {
  return <BrowserLayout g={g} />;
}

/* ───────────── 19. FOR-MAA (Handwritten Recipe Envelope) ───────────── */
function MaaLetterEnvelopeLayout({ g }: { g: Gift }) {
  return <EnvelopeLayout g={g} />;
}

/* ───────────── 20. MAAS-RECIPE (Kitchen Recipe Browser) ───────────── */
function RecipeBrowserLayout({ g }: { g: Gift }) {
  return <BrowserLayout g={g} />;
}

/* ───────────── 21. SUPERMOM (Family Group Chat) ───────────── */
function SupermomChatLayout({ g }: { g: Gift }) {
  return <ChatLayout g={g} />;
}

/* ───────────── 22. FOR-PAPA (Classic Leather Watch Card) ───────────── */
function PapaWatchLayout({ g }: { g: Gift }) {
  return <PosterLayout g={g} />;
}

/* ───────────── 23. DAD-JOKES (Comedy Deck Fan) ───────────── */
function ComedyDeckLayout({ g }: { g: Gift }) {
  return <FanLayout g={g} />;
}

/* ───────────── 24. MY-HERO (Newspaper Scrapbook) ───────────── */
function HeroScrapbookLayout({ g }: { g: Gift }) {
  return <ScrapbookLayout g={g} />;
}

/* ───────────── Shared Layouts from Design Kit ───────────── */

function BrowserLayout({ g }: { g: Gift }) {
  const { p, scenes, story } = g;
  const first = scenes[0];
  const second = personalScene(scenes);
  const stickers = giftStickers(scenes);
  return (
    <Stage style={{ background: `radial-gradient(120% 80% at 10% 0%, ${p.pink}aa, transparent 60%), radial-gradient(90% 70% at 100% 100%, ${p.accent}40, transparent 60%), #fbf6f1` }}>
      <Hearts color={p.accent} spots={[{ left: "8%", top: "72%", size: 5, delay: "0s" }, { left: "50%", top: "92%", size: 3.5, delay: "-4s" }]} />
      <div className="absolute left-[6%] top-[7%] w-[82%] overflow-hidden rounded-[3cqw] bg-white shadow-[0_6cqw_10cqw_-6cqw_rgba(27,18,21,0.45)]" style={{ rotate: "-2deg" }}>
        <div className="flex h-[6.5cqw] items-center gap-[1.2cqw] px-[3cqw]">
          {["#ff6b6b", "#ffc74d", "#5ad17a"].map((c) => (
            <span key={c} className="size-[1.6cqw] rounded-full" style={{ backgroundColor: c }} />
          ))}
          <span className="mx-auto rounded-full bg-black/5 px-[3cqw] py-[0.6cqw] font-mono text-[2cqw] text-black/50">tynitales.com/for-{story.recipient.toLowerCase()}</span>
        </div>
        <ScreenPeek scene={first} g={g} className="aspect-[4/3.3]" big />
      </div>
      <PhoneFrame className="bottom-[5%] right-[5%] w-[38%]" rotate={4}>
        <ScreenPeek scene={second} g={g} className="aspect-[9/16]" />
      </PhoneFrame>
      {stickers.slice(0, 2).map((id, i) => (
        <div key={id} aria-hidden className="absolute animate-float" style={[{ left: "3%", bottom: "8%", rotate: "-8deg" }, { right: "3%", top: "3%", rotate: "9deg", animationDelay: "-3s" }][i]}>
          <Sticker id={id} className="size-[15cqw]" />
        </div>
      ))}
    </Stage>
  );
}

function FanLayout({ g }: { g: Gift }) {
  const { p, scenes } = g;
  const picks = [scenes[0], personalScene(scenes), scenes[scenes.length - 1]];
  const stickers = giftStickers(scenes);
  return (
    <Stage
      style={{
        backgroundColor: p.bg,
        backgroundImage: `radial-gradient(${p.fg}22 1px, transparent 1.2px), radial-gradient(70% 50% at 50% 100%, ${p.accent}55, transparent 70%)`,
        backgroundSize: "4cqw 4cqw, 100% 100%",
      }}
    >
      <p className="absolute inset-x-0 top-[7%] text-center font-mono text-[2.6cqw] uppercase tracking-[0.2em]" style={{ color: p.fg, opacity: 0.7 }}>
        {g.kicker}
      </p>
      {picks.map((s, i) => (
        <PhoneFrame
          key={i}
          className="top-[16%] w-[40%]"
          rotate={[-12, 0, 12][i]}
          style={{ left: ["4%", "30%", "56%"][i], top: ["20%", "14%", "20%"][i], zIndex: i === 1 ? 2 : 1 }}
        >
          <ScreenPeek scene={s} g={g} className="aspect-[9/16]" />
        </PhoneFrame>
      ))}
      {stickers.slice(0, 2).map((id, i) => (
        <div key={id} aria-hidden className="absolute z-10 animate-float" style={[{ left: "4%", bottom: "5%", rotate: "-6deg" }, { right: "5%", bottom: "8%", rotate: "8deg", animationDelay: "-2s" }][i]}>
          <Sticker id={id} className="size-[17cqw]" />
        </div>
      ))}
    </Stage>
  );
}

const replies = ["omg stop", "I’m literally crying rn", "WHAT is this, you’re so cute", "okay I’m not crying, you are"];

function ChatLayout({ g }: { g: Gift }) {
  const { p, scenes, story, fill } = g;
  const wishes = scenes.find((s): s is Extract<Scene, { type: "wishes" }> => s.type === "wishes");
  const stickers = giftStickers(scenes);
  const memes = stickers.filter((id) => id.startsWith("m-"));
  const meme = memes[(g.seed + 1) % Math.max(1, memes.length)];
  const group = !!wishes;
  const first = scenes[0];
  const reply = replies[g.seed % replies.length];

  return (
    <Stage style={{ background: `linear-gradient(160deg, ${p.pink}, ${p.accent}66)` }}>
      <div className="absolute inset-x-[7%] bottom-0 top-[5%] overflow-hidden rounded-t-[6cqw] border-x-[1.2cqw] border-t-[1.2cqw] border-[#1b1215] bg-[#efe7dd] shadow-[0_6cqw_12cqw_-6cqw_rgba(27,18,21,0.6)]">
        <div className="flex items-center gap-[2cqw] bg-white/85 px-[3.5cqw] py-[2.6cqw]">
          <span className="grid size-[8cqw] place-items-center rounded-full text-[3.6cqw] font-semibold" style={{ backgroundColor: p.accent, color: p.cream }}>
            {group ? story.recipient[0] : story.sender[0]}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[3.4cqw] font-semibold text-[#1b1215]">{group ? `${story.recipient}’s surprise (shh)` : story.sender}</p>
            <p className="text-[2.4cqw] text-black/45">{group ? `${wishes.wishes.length + 1} people` : "online"}</p>
          </div>
          <Video className="size-[4cqw] text-black/50" />
          <Phone className="size-[3.6cqw] text-black/50" />
        </div>

        <div className="flex flex-col gap-[1.8cqw] px-[3.5cqw] pt-[3cqw]" style={{ backgroundImage: "radial-gradient(#0000000d 1px, transparent 1.2px)", backgroundSize: "3cqw 3cqw" }}>
          {group &&
            wishes.wishes.slice(0, 2).map((w, i) => (
              <Bubble key={i} name={w.name} nameColor={["#c2410c", "#7c3aed"][i]}>
                {fill(w.message)}
              </Bubble>
            ))}
          {!group && <Bubble>{g.opening}</Bubble>}
          {meme && (
            <div className="w-[36%] self-start" style={{ rotate: "-3deg" }}>
              <Sticker id={meme} className="size-full" />
            </div>
          )}
          <div className="w-[78%] self-end overflow-hidden rounded-[3cqw] bg-[#dcf3d5] p-[1.2cqw] shadow-sm">
            <div className="overflow-hidden rounded-[2.2cqw]" style={{ backgroundColor: p.bg, color: p.fg }}>
              <div className="px-[3cqw] py-[3cqw] text-center">
                <p className="font-mono text-[1.8cqw] uppercase opacity-70">{fill(first.eyebrow ?? g.kicker)}</p>
                <p className="type-display mt-[1cqw] text-[4.4cqw]">
                  <Accented text={fill(first.title)} color={p.accent} />
                </p>
              </div>
            </div>
            <p className="px-[1.4cqw] pt-[1.2cqw] text-[2.4cqw] text-[#1b1215]">tynitales.com/for-{story.recipient.toLowerCase()}</p>
          </div>
          <div className="self-start rounded-[3cqw] rounded-tl-[0.6cqw] bg-white px-[3cqw] py-[1.8cqw] text-[3.2cqw] text-[#1b1215] shadow-sm">
            {group ? "wait WHAT. you guys" : reply}
          </div>
        </div>
      </div>
      <Hearts color={p.cream} spots={[{ left: "86%", top: "40%", size: 5, delay: "0s" }, { left: "2%", top: "60%", size: 4, delay: "-2s" }]} />
    </Stage>
  );
}

function Bubble({ children, name, nameColor }: { children: ReactNode; name?: string; nameColor?: string }) {
  return (
    <div className="max-w-[82%] self-start rounded-[3cqw] rounded-tl-[0.6cqw] bg-white px-[3cqw] py-[1.8cqw] text-[3cqw] leading-snug text-[#1b1215] shadow-sm">
      {name && (
        <p className="text-[2.4cqw] font-semibold" style={{ color: nameColor }}>
          {name}
        </p>
      )}
      {children}
    </div>
  );
}

function ScrapbookLayout({ g }: { g: Gift }) {
  const { p, scenes, story } = g;
  const photos = giftPhotos(scenes, 3);
  const lines = giftLines(scenes);
  const stickers = giftStickers(scenes);
  const notes = ["#fff4a8", "#ffd3da", "#cdeccf"];
  return (
    <Stage
      style={{
        backgroundColor: "#fbf6ec",
        backgroundImage: `linear-gradient(${p.accent}14 1px, transparent 1px), linear-gradient(90deg, ${p.accent}14 1px, transparent 1px)`,
        backgroundSize: "5cqw 5cqw",
      }}
    >
      <p className="type-hand absolute left-[7%] top-[5%] text-[7.5cqw] font-bold leading-none" style={{ color: p.accent }}>
        for {story.recipient}
        <Heart className="ml-[1.5cqw] inline size-[5cqw] fill-current align-baseline" />
      </p>
      {photos.map((ph, i) => (
        <div
          key={i}
          className="absolute bg-white p-[1.6cqw] pb-[6cqw] shadow-[0_3cqw_5cqw_-3cqw_rgba(27,18,21,.5)]"
          style={
            [
              { left: "8%", top: "17%", width: "48%", rotate: "-6deg" },
              { right: "6%", top: "24%", width: "40%", rotate: "7deg" },
              { left: "26%", top: "52%", width: "42%", rotate: "-2deg", zIndex: 2 },
            ][i] as CSSProperties
          }
        >
          <span className="absolute -top-[1.8cqw] left-1/2 h-[4cqw] w-[15cqw] -translate-x-1/2 rotate-3 opacity-85" style={{ backgroundColor: [p.pink, p.gold, p.accent][i] }} />
          <PhotoFill src={ph.src} tone={ph.tone} alt="" className="aspect-square w-full" iconClassName="size-[7cqw]" />
          {ph.caption && <span className="type-hand absolute inset-x-[2cqw] bottom-[1cqw] truncate text-[3cqw] text-[#2a1a1f]">{g.fill(ph.caption)}</span>}
        </div>
      ))}
      {lines.slice(0, 2).map((line, i) => (
        <p
          key={i}
          className="type-hand absolute z-[3] w-[36%] px-[2.4cqw] py-[2cqw] text-[3.1cqw] leading-tight text-[#2a1a1f] shadow-[0_2cqw_3cqw_-2cqw_rgba(0,0,0,.4)]"
          style={{ backgroundColor: notes[i], ...([{ right: "5%", top: "62%", rotate: "4deg" }, { left: "4%", top: "44%", rotate: "-5deg" }][i] as CSSProperties) }}
        >
          {g.fill(line)}
        </p>
      ))}
      {stickers.slice(0, 2).map((id, i) => (
        <div key={id} aria-hidden className="absolute z-[4] animate-float" style={[{ left: "5%", bottom: "4%", rotate: "-6deg" }, { right: "6%", top: "4%", rotate: "8deg", animationDelay: "-2s" }][i]}>
          <Sticker id={id} className="size-[16cqw]" />
        </div>
      ))}
    </Stage>
  );
}

function PosterLayout({ g }: { g: Gift }) {
  const { p, scenes } = g;
  const stickers = giftStickers(scenes);
  const memes = stickers.filter((id) => id.startsWith("m-"));
  const meme = memes[g.seed % Math.max(1, memes.length)];
  const drawn = stickers.find((id) => !/^[bm]-/.test(id)) ?? sceneArt[scenes[0].type];
  return (
    <Stage style={{ background: `radial-gradient(90% 60% at 100% 0%, ${p.accent}55, transparent 60%), ${p.bg}` }}>
      <div className="absolute inset-0 flex flex-col p-[8cqw]" style={{ color: p.fg }}>
        <span className="self-start rounded-full border px-[2.6cqw] py-[0.8cqw] font-mono text-[2.4cqw] uppercase" style={{ borderColor: `${p.fg}55` }}>
          {g.kicker}
        </span>
        <p className="type-display mt-[6cqw] text-[11.5cqw] leading-[0.95]">
          <Accented text={accentTail(g.opening)} color={p.accent} />
        </p>
        <div className="mt-auto flex items-center">
          <span className="ml-auto rounded-full px-[3.4cqw] py-[1.6cqw] text-[2.8cqw] font-medium" style={{ backgroundColor: p.accent, color: p.cream }}>
            Open it →
          </span>
        </div>
      </div>
      <div aria-hidden className="absolute -right-[4%] top-[48%] animate-float" style={{ rotate: "10deg" }}>
        <Sticker id={meme ?? drawn} className="size-[34cqw]" />
      </div>
      <div aria-hidden className="absolute left-[44%] top-[56%] animate-float" style={{ rotate: "-12deg", animationDelay: "-2s" }}>
        <Sticker id={drawn} className="size-[18cqw]" />
      </div>
    </Stage>
  );
}

function EnvelopeLayout({ g }: { g: Gift }) {
  const { p, scenes, story, fill } = g;
  const letter = scenes.find((s): s is Extract<Scene, { type: "letter" }> => s.type === "letter");
  const stickers = giftStickers(scenes);
  const line = letter ? letter.paragraphs[0] : g.opening;
  return (
    <Stage style={{ background: `radial-gradient(100% 70% at 50% 0%, ${p.pink}, transparent 70%), ${p.bg}` }}>
      <Hearts color={p.accent} spots={[{ left: "10%", top: "10%", size: 4.5, delay: "0s" }, { left: "84%", top: "18%", size: 3.5, delay: "-3s" }]} />
      <div className="absolute inset-x-[9%] bottom-[10%] h-[46%] rounded-[3cqw]" style={{ backgroundColor: p.accent }} />
      <div className="absolute inset-x-[15%] top-[12%] h-[58%] rounded-[2cqw] px-[5cqw] py-[5cqw] shadow-[0_3cqw_6cqw_-3cqw_rgba(0,0,0,.35)]" style={{ backgroundColor: p.cream, color: p.ink, rotate: "-2deg", backgroundImage: `repeating-linear-gradient(transparent 0 6.4cqw, ${p.ink}14 6.4cqw 6.6cqw)`, backgroundPosition: "0 4cqw" }}>
        <p className="type-hand text-[5.6cqw] font-bold leading-[6.5cqw]" style={{ color: p.accent }}>
          Dear {story.recipient},
        </p>
        <p className="type-hand mt-[1cqw] line-clamp-4 text-[4cqw] leading-[6.5cqw]">{fill(line)}</p>
      </div>
      <div
        className="absolute inset-x-[9%] bottom-[10%] h-[34%] rounded-b-[3cqw]"
        style={{ backgroundColor: p.accent, clipPath: "polygon(0 0, 50% 46%, 100% 0, 100% 100%, 0 100%)", filter: "brightness(0.93)" }}
      />
      <div className="absolute bottom-[25%] left-1/2 grid size-[15cqw] -translate-x-1/2 place-items-center rounded-full shadow-[0_1.5cqw_3cqw_-1cqw_rgba(0,0,0,.5)]" style={{ background: `radial-gradient(circle at 35% 30%, ${p.gold}, ${p.accent} 75%)` }}>
        <Heart className="size-[6cqw] fill-current" style={{ color: p.cream }} />
      </div>
      {stickers.slice(0, 2).map((id, i) => (
        <div key={id} aria-hidden className="absolute animate-float" style={[{ right: "3%", top: "4%", rotate: "10deg" }, { left: "3%", bottom: "3%", rotate: "-8deg", animationDelay: "-2s" }][i]}>
          <Sticker id={id} className="size-[16cqw]" />
        </div>
      ))}
    </Stage>
  );
}

function SiteLayout({ g }: { g: Gift }) {
  const { p, scenes, story } = g;
  const hero = scenes.find((s): s is Extract<Scene, { type: "hero" }> => s.type === "hero");
  const countdown = scenes.find((s): s is Extract<Scene, { type: "countdown" }> => s.type === "countdown");
  const noticed = scenes.find((s): s is Extract<Scene, { type: "noticed" }> => s.type === "noticed");
  const photos = giftPhotos(scenes, 3);
  const nav = ["Home", countdown ? "Countdown" : null, "Photos", "Letter"].filter(Boolean) as string[];
  const serif = "font-serif font-semibold tracking-[-0.02em]";
  return (
    <Stage style={{ background: `radial-gradient(90% 60% at 0% 0%, ${p.pink}, transparent 70%), radial-gradient(80% 60% at 100% 100%, ${p.accent}30, transparent 70%), ${p.bg}` }}>
      <div className="absolute left-[6%] top-[5%] w-[80%] overflow-hidden rounded-[3cqw] bg-white shadow-[0_6cqw_12cqw_-6cqw_rgba(27,18,21,0.5)]">
        <div className="flex h-[6cqw] items-center gap-[1.2cqw] px-[3cqw]">
          {["#ff6b6b", "#ffc74d", "#5ad17a"].map((c) => (
            <span key={c} className="size-[1.5cqw] rounded-full" style={{ backgroundColor: c }} />
          ))}
          <span className="mx-auto rounded-full bg-black/5 px-[3cqw] py-[0.5cqw] font-mono text-[1.9cqw] text-black/50">tynitales.com/for-{story.recipient.toLowerCase()}</span>
        </div>
        <div className="relative aspect-[4/3.2] overflow-hidden">
          <PhotoFill src={hero?.photo} tone={hero?.tone ?? "rose"} alt="" className="size-full" iconClassName="size-[8cqw]" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,0) 40%, rgba(0,0,0,.55))" }} />
          <div className="absolute inset-x-[4cqw] top-[3cqw] flex items-center justify-between rounded-full bg-white/75 px-[2.6cqw] py-[1cqw] backdrop-blur-sm" style={{ color: p.ink }}>
            <span className={cn(serif, "text-[2.3cqw]")}>{g.fill((hero?.title ?? story.recipient).replace(/\*/g, ""))}</span>
            <span className="flex gap-[1.6cqw] font-mono text-[1.4cqw] uppercase opacity-70">
              {nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </div>
          <p className={cn(serif, "absolute inset-x-0 top-[38%] text-center text-[8cqw] leading-none text-white drop-shadow")}>
            <Accented text={g.fill(hero?.title ?? g.opening)} color={p.pink} />
          </p>
          {hero?.subtitle && <p className={cn(serif, "absolute bottom-[4cqw] left-[4cqw] text-[5.6cqw] leading-none text-white")}>{g.fill(hero.subtitle)}</p>}
        </div>
        <div className="px-[4cqw] py-[3.5cqw]" style={{ backgroundColor: p.bg, color: p.fg }}>
          {countdown ? (
            <div className="grid grid-cols-4 gap-[1.4cqw]">
              {["Days", "Hours", "Min", "Sec"].map((u, i) => (
                <div key={u} className="rounded-[1.6cqw] border py-[1.6cqw] text-center" style={{ borderColor: `${p.ink}18`, backgroundColor: `${p.cream}` }}>
                  <span className={cn(serif, "block text-[4cqw] leading-none")}>{["124", "08", "42", "17"][i]}</span>
                  <span className="mt-[0.6cqw] block font-mono text-[1.3cqw] uppercase opacity-55">{u}</span>
                </div>
              ))}
            </div>
          ) : noticed ? (
            <div className="rounded-[2cqw] px-[3cqw] py-[2.4cqw]" style={{ backgroundColor: p.cream, color: p.ink }}>
              <span className="font-serif text-[3cqw] opacity-30">01</span>
              <p className={cn(serif, "text-[3.4cqw]")}>{g.fill(noticed.items[0]?.title ?? "")}</p>
            </div>
          ) : null}
        </div>
      </div>

      <PhoneFrame className="bottom-[4%] right-[5%] w-[36%]" rotate={5}>
        <div className="relative aspect-[9/16] overflow-hidden px-[2.6cqw] pt-[5cqw]" style={{ backgroundColor: p.bg, color: p.fg }}>
          <p className="font-mono text-[1.4cqw] uppercase opacity-60">Our archive</p>
          <p className={cn(serif, "mt-[1cqw] text-[3.4cqw] leading-tight")}>Too many good ones.</p>
          {photos.map((ph, i) => (
            <div
              key={i}
              className="absolute left-[8%] w-[84%] rounded-[2cqw] bg-white p-[1cqw] shadow-[0_2cqw_3cqw_-2cqw_rgba(0,0,0,.45)]"
              style={{ top: `${34 + i * 10}%`, rotate: `${[-4, 3, -1][i]}deg` }}
            >
              <PhotoFill src={ph.src} tone={ph.tone} alt="" className="aspect-[4/3] w-full rounded-[1.4cqw]" iconClassName="size-[5cqw]" />
            </div>
          ))}
        </div>
      </PhoneFrame>

      <Hearts color={p.accent} spots={[{ left: "6%", top: "86%", size: 5, delay: "0s" }, { left: "90%", top: "4%", size: 4, delay: "-3s" }]} />
    </Stage>
  );
}

/* ───────────── Shared Frame & Screen Peek ───────────── */

export function PhoneFrame({ children, className, rotate = 0, style }: { children: ReactNode; className?: string; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      className={cn("absolute overflow-hidden rounded-[5cqw] border-[1.2cqw] border-[#1b1215] bg-[#1b1215] shadow-[0_6cqw_10cqw_-5cqw_rgba(27,18,21,0.55)]", className)}
      style={{ rotate: `${rotate}deg`, ...style }}
    >
      <div className="overflow-hidden rounded-[3.6cqw]">{children}</div>
    </div>
  );
}

export function ScreenPeek({ scene, g, className, big = false }: { scene: Scene; g: Gift; className?: string; big?: boolean }) {
  const palette = { ...g.p, ...scene.palette };
  const photo = scenePhoto(scene);
  const title = g.fill(scene.type === "question" ? scene.question : scene.title);
  return (
    <div
      className={cn("relative flex flex-col items-center overflow-hidden text-center", big ? "justify-center px-[5cqw] py-[3cqw]" : "px-[2.5cqw] pt-[6cqw]", className)}
      style={{ backgroundColor: palette.bg, color: palette.fg }}
    >
      {scene.eyebrow && (
        <span className={cn("rounded-full border font-mono uppercase opacity-70", big ? "px-[2cqw] py-[0.4cqw] text-[1.8cqw]" : "px-[1.4cqw] text-[1.4cqw]")} style={{ borderColor: "currentColor" }}>
          {g.fill(scene.eyebrow)}
        </span>
      )}
      <p className={cn("type-display mt-[1.6cqw] text-balance", big ? "text-[5.6cqw]" : "text-[3.4cqw]")}>
        <Accented text={title} color={palette.accent} />
      </p>

      {photo ? (
        <div className={cn("relative mt-[3cqw] bg-white p-[1cqw] pb-[3.5cqw] shadow-[0_2cqw_3cqw_-2cqw_rgba(0,0,0,.4)]", big ? "w-[34%]" : "w-[78%]")} style={{ rotate: "-3deg" }}>
          <span className="absolute -top-[1.2cqw] left-1/2 h-[2.6cqw] w-[9cqw] -translate-x-1/2 rotate-2" style={{ backgroundColor: `${palette.pink}d0` }} />
          <PhotoFill src={photo.src} tone={photo.tone} alt="" className="aspect-[4/5] w-full" iconClassName="size-[5cqw]" />
          <span className="type-hand absolute inset-x-0 bottom-[0.4cqw] truncate text-[2.4cqw] text-[#2a1a1f]">{g.fill(photo.caption)}</span>
        </div>
      ) : scene.type === "compliments" ? (
        <div className="mt-[3cqw] grid w-full grid-cols-2 gap-[1.6cqw]">
          {scene.bubbles.slice(0, 4).map((b, i) =>
            i < 2 ? (
              <span key={i} className="type-hand rounded-[2cqw] px-[1.4cqw] py-[1.2cqw] text-left text-[2cqw] leading-tight" style={{ backgroundColor: palette.cream, color: palette.ink }}>
                {g.fill(b)}
              </span>
            ) : (
              <span key={i} className="mx-auto aspect-square w-[70%] rounded-full" style={{ background: `radial-gradient(circle at 32% 28%, #fff 0 8%, ${palette.pink}aa 30%, ${palette.accent}88)` }} />
            ),
          )}
        </div>
      ) : (
        <Sticker id={sceneArt[scene.type]} className={cn("mt-[3cqw]", big ? "size-[18cqw]" : "size-[16cqw]")} />
      )}

      {scene.hint && big && (
        <span className="mt-[2.4cqw] rounded-full px-[3cqw] py-[1cqw] text-[1.9cqw] font-medium" style={{ backgroundColor: palette.accent, color: palette.cream }}>
          {g.fill(scene.hint)}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AUTHENTIC FLOW VIDEO / GIF PREVIEW (PLAYS ON HOVER)
   Renders the REAL scenes of that specific gift sliding in sequence!
   ═══════════════════════════════════════════════════════════════════ */

export function FlowVideoPreview({ template }: { template: Template }) {
  if (template.story?.format === "site") {
    return <SiteFlowVideo template={template} />;
  }
  if (!template.story) {
    return <ClassicCardFlowVideo template={template} />;
  }
  return <StoryFlowVideo template={template} />;
}

function StoryFlowVideo({ template }: { template: Template }) {
  const g = readGift(template);
  const { p, scenes } = g;
  const s1 = scenes[0];
  const s2 = scenes[1] ?? scenes[0];
  const s3 = personalScene(scenes);
  const s4 = scenes[scenes.length - 1];

  return (
    <div className="relative h-full w-full overflow-hidden select-none" style={{ backgroundColor: p.bg, color: p.fg }}>
      {/* Soft ambient lighting */}
      <div className="absolute inset-0 bg-radial from-black/10 via-transparent to-black/35 pointer-events-none" />

      {/* Floating recording pill */}
      <div className="absolute left-[4cqw] top-[4cqw] z-30 flex items-center gap-[1.2cqw] rounded-full bg-black/60 px-[2.8cqw] py-[0.9cqw] text-white backdrop-blur-md">
        <span className="size-[1.6cqw] rounded-full bg-rose-500 animate-pulse" />
        <span className="font-mono text-[2.2cqw] font-semibold tracking-wider">FLOW PREVIEW</span>
      </div>

      {/* Centered Phone Screen with real slides */}
      <div className="absolute inset-x-[18%] bottom-[4%] top-[10%] overflow-hidden rounded-[5.5cqw] border-[1.2cqw] border-[#1b1215] bg-[#1b1215] shadow-[0_8cqw_16cqw_-6cqw_rgba(0,0,0,0.6)]">
        {/* iOS Island */}
        <div className="absolute left-1/2 top-[1.2cqw] z-30 h-[1.8cqw] w-[14cqw] -translate-x-1/2 rounded-full bg-black" />

        {/* 4 Segmented Story Progress Bars */}
        <div className="absolute inset-x-[3cqw] top-[3.8cqw] z-30 grid grid-cols-4 gap-[1cqw]">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="h-[0.7cqw] overflow-hidden rounded-full bg-black/30 backdrop-blur-xs">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: p.accent,
                  animation: `storySeg${step} 4.8s linear infinite`,
                }}
              />
            </div>
          ))}
        </div>

        {/* 4-Slide Track swiping smoothly between real scenes */}
        <div
          className="flex h-full w-[400%]"
          style={{
            animation: "flowPhoneSwipe 4.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
          }}
        >
          {/* Slide 1: Opener Scene */}
          <div className="relative h-full w-1/4">
            <ScreenPeek scene={s1} g={g} className="h-full justify-center px-[3cqw] pt-[7cqw]" />
            {/* Animated Tapping Finger Gesture */}
            <div
              className="pointer-events-none absolute bottom-[18%] right-[22%] grid size-[7cqw] place-items-center rounded-full bg-white text-ink shadow-lg"
              style={{ animation: "flowTapGesture 4.8s ease-in-out infinite" }}
            >
              <Sparkles className="size-[3.5cqw] text-amber-500" />
            </div>
          </div>

          {/* Slide 2: Interactive Game / Secret Scene */}
          <div className="relative h-full w-1/4">
            <ScreenPeek scene={s2} g={g} className="h-full justify-center px-[3cqw] pt-[7cqw]" />
          </div>

          {/* Slide 3: Personal Photos / Memories Scene */}
          <div className="relative h-full w-1/4">
            <ScreenPeek scene={s3} g={g} className="h-full justify-center px-[3cqw] pt-[7cqw]" />
          </div>

          {/* Slide 4: Finale & Celebration Scene */}
          <div className="relative h-full w-1/4">
            <ScreenPeek scene={s4} g={g} className="h-full justify-center px-[3cqw] pt-[7cqw]" />
            {/* Confetti Explosion Burst on Slide 4 */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{ animation: "flowConfettiBurst 4.8s ease-out infinite" }}
            >
              {[
                { left: "20%", top: "25%", color: "#f59e0b", size: "2.5cqw" },
                { left: "75%", top: "30%", color: "#ef4444", size: "3cqw" },
                { left: "30%", top: "70%", color: "#3b82f6", size: "2cqw" },
                { left: "70%", top: "65%", color: "#10b981", size: "2.8cqw" },
                { left: "50%", top: "20%", color: "#ec4899", size: "3.2cqw" },
              ].map((c, idx) => (
                <span
                  key={idx}
                  className="absolute rounded-full animate-ping"
                  style={{
                    left: c.left,
                    top: c.top,
                    backgroundColor: c.color,
                    width: c.size,
                    height: c.size,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteFlowVideo({ template }: { template: Template }) {
  const g = readGift(template);
  const { p, scenes, story } = g;
  const hero = scenes.find((s) => s.type === "hero");
  const countdown = scenes.find((s) => s.type === "countdown");
  const photos = giftPhotos(scenes, 3);

  return (
    <div className="relative h-full w-full overflow-hidden select-none" style={{ backgroundColor: p.bg, color: p.fg }}>
      {/* Recording badge */}
      <div className="absolute left-[4cqw] top-[4cqw] z-30 flex items-center gap-[1.2cqw] rounded-full bg-black/60 px-[2.8cqw] py-[0.9cqw] text-white backdrop-blur-md">
        <span className="size-[1.6cqw] rounded-full bg-rose-500 animate-pulse" />
        <span className="font-mono text-[2.2cqw] font-semibold tracking-wider">WEBSITE FLOW</span>
      </div>

      {/* Mini Browser window */}
      <div className="absolute inset-x-[10%] bottom-[4%] top-[12%] overflow-hidden rounded-[3.5cqw] border-[1.2cqw] border-[#1b1215] bg-white shadow-[0_8cqw_16cqw_-6cqw_rgba(0,0,0,0.5)]">
        <div className="flex h-[6cqw] items-center gap-[1.2cqw] border-b border-black/10 bg-[#f4ece3] px-[3cqw]">
          <span className="size-[1.6cqw] rounded-full bg-rose-400" />
          <span className="size-[1.6cqw] rounded-full bg-amber-400" />
          <span className="size-[1.6cqw] rounded-full bg-emerald-400" />
          <span className="mx-auto rounded-full bg-black/5 px-[3cqw] py-[0.5cqw] font-mono text-[1.8cqw] text-black/50 truncate max-w-[65%]">
            tynitales.com/for-{story.recipient.toLowerCase()}
          </span>
        </div>

        {/* Smoothly scrolling page flow */}
        <div
          className="flex flex-col gap-[2.5cqw] p-[3cqw]"
          style={{ animation: "flowSiteScroll 5s ease-in-out infinite" }}
        >
          <div className="aspect-[4/3] rounded-2xl overflow-hidden relative" style={{ backgroundColor: p.accent }}>
            <PhotoFill src={hero?.photo} tone="rose" alt="" className="size-full" iconClassName="size-[8cqw]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-[3cqw]">
              <p className="font-serif text-[4cqw] text-white font-bold leading-tight">
                {g.fill(hero?.title ?? g.opening)}
              </p>
            </div>
          </div>

          {countdown && (
            <div className="rounded-xl p-[2.5cqw] text-center" style={{ backgroundColor: `${p.accent}20` }}>
              <span className="font-mono text-[1.6cqw] uppercase block opacity-60">Live Countdown</span>
              <div className="grid grid-cols-4 gap-[1cqw] mt-[1cqw]">
                {["124", "08", "42", "17"].map((v, i) => (
                  <div key={i} className="rounded-md bg-white py-[1cqw] text-center">
                    <span className="font-mono font-bold text-[2.8cqw] block">{v}</span>
                    <span className="text-[1.4cqw] uppercase opacity-50 block">{["days", "hrs", "min", "sec"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-[1.5cqw]">
            {photos.map((ph, i) => (
              <div key={i} className="aspect-square rounded-lg bg-white p-[0.8cqw] shadow-xs">
                <PhotoFill src={ph.src} tone={ph.tone} alt="" className="size-full rounded-md" iconClassName="size-[4cqw]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassicCardFlowVideo({ template }: { template: Template }) {
  const { palette, preview } = template;
  return (
    <div className="relative h-full w-full overflow-hidden select-none" style={{ backgroundColor: palette.bg, color: palette.fg }}>
      {/* Recording pill */}
      <div className="absolute left-[4cqw] top-[4cqw] z-30 flex items-center gap-[1.2cqw] rounded-full bg-black/60 px-[2.8cqw] py-[0.9cqw] text-white backdrop-blur-md">
        <span className="size-[1.6cqw] rounded-full bg-rose-500 animate-pulse" />
        <span className="font-mono text-[2.2cqw] font-semibold tracking-wider">GIFT UNBOXING</span>
      </div>

      {/* Envelope & letter sliding out */}
      <div className="absolute inset-x-[12%] bottom-[8%] top-[14%] overflow-hidden rounded-3xl bg-white/40 p-[4cqw] shadow-lg backdrop-blur-md flex flex-col justify-between text-center">
        <div className="my-auto">
          <span className="font-mono text-[2.2cqw] uppercase tracking-wider opacity-70 block">{preview.kicker}</span>
          <p className="type-display mt-[1.5cqw] text-[6.5cqw] font-semibold leading-tight">{preview.title}</p>
          <p className="mt-[2cqw] font-serif text-[3.4cqw] italic opacity-80">{preview.signoff}</p>
        </div>
        <div className="flex justify-center">
          <Heart className="size-[8cqw] fill-rose-500 text-rose-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
