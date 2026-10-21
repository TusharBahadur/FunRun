"use client";

import { Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { accentMoodVars } from "@/components/experiences/birthday/accent-moods";
import { giftFontRoot } from "./gift-fonts";
import { Confetti, type ConfettiHandle } from "@/components/experiences/confetti";
import { MusicBox } from "@/components/experiences/music-box";
import { cn } from "@/lib/utils";
import { melodies } from "./melodies";
import { SceneFontsContext, StoryContext, type SceneProps, type StoryApi } from "./scene-kit";
import { SCENES } from "./scene-registry";
import { CountdownSection, GallerySection, HeroSection, NoticedSection, PlaylistSection, SiteLetter } from "./scenes/site";
import { ReactionSticker, StickerLayer } from "./stickers";
import { passiveScenes, type Scene, type SceneType, type Story } from "./types";

// Website sections render as-is; anything else (a game) is dropped in as a block.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SITE_SECTIONS: Partial<Record<SceneType, ComponentType<SceneProps<any>>>> = {
  hero: HeroSection,
  countdown: CountdownSection,
  noticed: NoticedSection,
  gallery: GallerySection,
  playlist: PlaylistSection,
  letter: SiteLetter,
};

const navNames: Partial<Record<SceneType, string>> = {
  hero: "Home",
  countdown: "Countdown",
  noticed: "Notes",
  gallery: "Photos",
  playlist: "Playlist",
  letter: "Letter",
};

/** A gift as one long, scrolling page: hero, sections, a floating menu. */
export function SitePlayer({
  story,
  slug,
  initialIndex = 0,
  onIndexChange,
  studio,
}: {
  story: Story;
  slug: string;
  initialIndex?: number;
  unlocked?: boolean;
  onIndexChange?: (index: number) => void;
  studio?: unknown;
}) {
  const scenes = useMemo(() => story.scenes.filter((s) => !s.hidden), [story.scenes]);
  const palette = story.palette;
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(initialIndex);
  const confetti = useRef<ConfettiHandle>(null);
  const music = useRef<MusicBox | null>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const reported = useRef(onIndexChange);
  useEffect(() => {
    reported.current = onIndexChange;
  }, [onIndexChange]);

  const playSong = useCallback(() => {
    music.current ??= new MusicBox();
    music.current.play(() => setPlaying(false), melodies[story.melody]);
    setPlaying(true);
  }, [story.melody]);
  useEffect(() => () => music.current?.stop(), []);

  // Studio: open on the selected section.
  useEffect(() => {
    sections.current[initialIndex]?.scrollIntoView({ block: "start" });
  }, [initialIndex]);

  // Highlight the section in view, and tell the studio which one it is.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = sections.current.indexOf(e.target as HTMLElement);
          if (i >= 0) {
            setActive(i);
            reported.current?.(i);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [scenes.length]);

  const api = useMemo<StoryApi>(
    () => ({
      palette,
      to: story.recipient,
      from: story.sender,
      fill: (t) => t.replaceAll("{to}", story.recipient).replaceAll("{from}", story.sender),
      celebrate: (el) => {
        const r = el?.getBoundingClientRect();
        confetti.current?.burst(r ? r.left + r.width / 2 : window.innerWidth / 2, r ? r.top + r.height / 3 : window.innerHeight / 2, { count: 160, spread: 1.4 });
      },
      playSong,
      restart: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      slug,
    }),
    [palette, story.recipient, story.sender, playSong, slug],
  );

  const giftFace = giftFontRoot(story.font);
  const brand = (scenes.find((s) => s.type === "hero")?.title ?? story.recipient)
    .replace(/\*/g, "")
    .replaceAll("{to}", story.recipient)
    .replaceAll("{from}", story.sender);
  const navItems = scenes
    .map((s, i) => ({ i, label: s.nav ?? navNames[s.type] }))
    .filter((n): n is { i: number; label: string } => !!n.label)
    .slice(0, 6);

  return (
    <StoryContext.Provider value={api}>
      <div
        data-gift-font={giftFace["data-gift-font"]}
        className="relative isolate min-h-svh overflow-x-clip"
        style={{
          color: palette.fg,
          background: `radial-gradient(80% 50% at 0% 30%, ${palette.pink}55, transparent 70%), radial-gradient(70% 50% at 100% 70%, ${palette.accent}22, transparent 70%), ${palette.bg}`,
          ...accentMoodVars(story.accentFont ?? "classic"),
          ...giftFace.style,
        }}
        onPointerDown={() => {
          if (!playing && !music.current) playSong();
        }}
      >
        <Confetti ref={confetti} colors={[palette.accent, palette.gold, palette.pink, palette.cream]} />

        {/* Floating menu: bottom on phones, top on bigger screens */}
        {!studio && navItems.length > 1 && (
          <nav
            aria-label="Sections"
            className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:bottom-auto lg:top-5"
          >
            <div
              className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-full border p-1.5 shadow-[0_12px_30px_-14px_rgba(0,0,0,.35)] backdrop-blur-md"
              style={{ backgroundColor: `${palette.cream}cc`, borderColor: `${palette.cream}`, color: palette.ink }}
            >
              <span className="hidden shrink-0 px-3 font-serif text-sm font-semibold lg:block">{brand}</span>
              {navItems.map((n) => (
                <button
                  key={n.i}
                  type="button"
                  onClick={() => sections.current[n.i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className={cn("type-label shrink-0 rounded-full px-3 py-2 text-[10px] transition-colors")}
                  style={active === n.i ? { backgroundColor: palette.accent, color: palette.cream } : undefined}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </nav>
        )}

        <main>
          {scenes.map((scene, i) => (
            <SiteBlock key={i} scene={scene} index={i} studio={!!studio} refCb={(el) => (sections.current[i] = el)} />
          ))}
        </main>

        <footer className="px-5 pb-28 pt-10 text-center md:pb-16">
          <Link href={`/templates/${slug}`} className="type-label opacity-60 hover:opacity-100">
            Made with <span className="type-wordmark text-base normal-case">TyniTales.</span> Make one for someone →
          </Link>
        </footer>

        {!studio && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (playing) {
                music.current?.stop();
                setPlaying(false);
              } else playSong();
            }}
            aria-label={playing ? "Stop the music" : "Play the music"}
            className="fixed bottom-20 right-4 z-40 grid size-10 place-items-center rounded-full backdrop-blur lg:bottom-5"
            style={{ backgroundColor: `${palette.cream}cc`, color: palette.ink }}
          >
            {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4 opacity-60" />}
          </button>
        )}
      </div>
    </StoryContext.Provider>
  );
}

/** One section. Games keep their own “done” state so they still play inline. */
function SiteBlock({ scene, index, studio, refCb }: { scene: Scene; index: number; studio: boolean; refCb: (el: HTMLElement | null) => void }) {
  const [played, setDone] = useState(passiveScenes.includes(scene.type));
  // The studio shows every section finished, so what you edit is on screen without playing for it.
  const done = studio || played;
  const Section = SITE_SECTIONS[scene.type];
  const Game = SCENES[scene.type];
  return (
    <div ref={refCb} data-studio-scene={index} className="relative scroll-mt-0">
      <StickerLayer stickers={scene.stickers} />
      <SceneFontsContext.Provider value={scene.fonts}>
        {Section ? (
          <Section scene={scene} done={done} onDone={() => setDone(true)} />
        ) : (
          <Game scene={scene} done={done} onDone={() => setDone(true)} />
        )}
      </SceneFontsContext.Provider>
      {!passiveScenes.includes(scene.type) && <ReactionSticker id={scene.reaction} show={done} />}
    </div>
  );
}
