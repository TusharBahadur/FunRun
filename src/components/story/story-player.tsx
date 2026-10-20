"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Lock, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Confetti, type ConfettiHandle } from "@/components/experiences/confetti";
import { MusicBox } from "@/components/experiences/music-box";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { accentMoodVars } from "@/components/experiences/birthday/accent-moods";
import { melodies } from "./melodies";
import { StoryContext, type SceneProps, type StoryApi } from "./scene-kit";
import { SCENES } from "./scene-registry";
import { SitePlayer } from "./site-player";
import { ReactionSticker, StickerLayer } from "./stickers";
import { passiveScenes, type Scene, type SceneType, type Story } from "./types";

const initialDone = (scenes: Scene[]) => scenes.map((s) => passiveScenes.includes(s.type));

type PlayerProps = {
  story: Story;
  slug: string;
  /** Studio: open on a given scene (index into the visible scenes). */
  initialIndex?: number;
  /** Studio: every page can be visited without playing the one before. */
  unlocked?: boolean;
  onIndexChange?: (index: number) => void;
};

/** Plays a gift: page by page (the games), or as one scrolling website. */
export function StoryPlayer(props: PlayerProps) {
  return props.story.format === "site" ? <SitePlayer {...props} /> : <PagesPlayer {...props} />;
}

/** One scene per page, each unlocked by finishing the last. */
function PagesPlayer({
  story,
  slug,
  initialIndex = 0,
  unlocked = false,
  onIndexChange,
}: PlayerProps) {
  const scenes = useMemo(() => story.scenes.filter((s) => !s.hidden), [story.scenes]);
  const [index, setIndex] = useState(() => Math.min(initialIndex, Math.max(0, scenes.length - 1)));
  const [done, setDone] = useState<boolean[]>(() => initialDone(scenes));
  const [run, setRun] = useState(0);
  const [nudge, setNudge] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const confetti = useRef<ConfettiHandle>(null);
  const music = useRef<MusicBox | null>(null);
  const started = useRef(false);

  const playSong = useCallback(() => {
    music.current ??= new MusicBox();
    music.current.play(() => setPlaying(false), melodies[story.melody]);
    setPlaying(true);
    setMuted(false);
  }, [story.melody]);

  const stopSong = useCallback(() => {
    music.current?.stop();
    setPlaying(false);
  }, []);

  useEffect(() => () => music.current?.stop(), []);

  const complete = useCallback(
    (i: number) => {
      setDone((d) => (d[i] ? d : d.map((v, j) => v || j === i)));
      // The first finished gesture is the first moment browsers allow sound.
      if (!started.current) {
        started.current = true;
        if (!muted) playSong();
      }
    },
    [muted, playSong],
  );

  const go = useCallback(
    (to: number) => {
      if (to < 0 || to >= scenes.length) return;
      if (to > index && !done[index] && !unlocked) {
        setNudge((n) => n + 1);
        return;
      }
      window.speechSynthesis?.cancel();
      setIndex(to);
      onIndexChange?.(to);
      window.scrollTo({ top: 0 });
    },
    [done, index, scenes.length, unlocked, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const safeIndex = Math.max(0, Math.min(index, scenes.length - 1));
  const scene = scenes[safeIndex] as Scene | undefined;
  // A scene can override colours for itself; everything else uses the story's.
  const palette = useMemo(() => ({ ...story.palette, ...scene?.palette }), [story.palette, scene?.palette]);

  const api = useMemo<StoryApi>(
    () => ({
      palette,
      to: story.recipient,
      from: story.sender,
      fill: (t) => t.replaceAll("{to}", story.recipient).replaceAll("{from}", story.sender),
      celebrate: (el) => {
        const r = el?.getBoundingClientRect();
        const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
        const y = r ? r.top + r.height / 3 : window.innerHeight / 2;
        confetti.current?.burst(x, y, { count: 180, spread: 1.4 });
        confetti.current?.burst(window.innerWidth * 0.1, window.innerHeight, { count: 60, spread: 0.5 });
        confetti.current?.burst(window.innerWidth * 0.9, window.innerHeight, { count: 60, spread: 0.5 });
      },
      playSong,
      restart: () => {
        window.speechSynthesis?.cancel();
        setDone(initialDone(scenes));
        setIndex(0);
        setRun((r) => r + 1);
        window.scrollTo({ top: 0 });
      },
      slug,
    }),
    [palette, story.recipient, story.sender, playSong, scenes, slug],
  );

  if (!scene) {
    return (
      <div className="grid min-h-svh place-items-center p-8 text-center" style={{ backgroundColor: story.palette.bg, color: story.palette.fg }}>
        <p className="type-label opacity-60">Every page is hidden. Show a page to see it here.</p>
      </div>
    );
  }

  const SceneView = SCENES[scene.type];
  const canNext = (done[safeIndex] || unlocked) && safeIndex < scenes.length - 1;
  const last = safeIndex === scenes.length - 1;

  return (
    <StoryContext.Provider value={api}>
      <div
        className="relative isolate min-h-svh overflow-x-hidden transition-colors duration-700"
        style={{ backgroundColor: palette.bg, color: palette.fg, ...accentMoodVars(story.accentFont ?? "classic") }}
      >
        <Confetti ref={confetti} colors={[palette.accent, palette.gold, palette.pink, palette.cream, palette.fg]} />

        <AnimatePresence mode="wait">
          <motion.main
            key={`${run}-${safeIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="relative"
          >
            <StickerLayer stickers={scene.stickers} />
            <SceneView scene={scene} done={!!done[safeIndex]} onDone={() => complete(safeIndex)} />
          </motion.main>
        </AnimatePresence>

        <ReactionSticker key={`${run}-${safeIndex}`} id={scene.reaction} show={!!done[safeIndex]} />

        {/* Page controls */}
        <nav
          aria-label="Pages"
          className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
        >
          <div
            className="flex items-center gap-1 rounded-full p-1.5 shadow-[0_12px_30px_-14px_rgba(27,18,21,.45)] backdrop-blur"
            style={{ backgroundColor: `${palette.cream}e6`, color: palette.ink }}
          >
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={safeIndex === 0}
              aria-label="Previous page"
              className="grid size-10 place-items-center rounded-full transition-opacity disabled:opacity-25"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex items-center gap-1.5 px-1" aria-label={`Page ${safeIndex + 1} of ${scenes.length}`}>
              {scenes.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === safeIndex ? 18 : 6,
                    backgroundColor: i <= safeIndex ? palette.accent : `${palette.ink}30`,
                  }}
                />
              ))}
            </div>
            {!last && (
              <motion.button
                key={`next-${nudge}`}
                type="button"
                onClick={() => go(index + 1)}
                aria-label={canNext ? "Next page" : "Finish this page first"}
                animate={nudge && !canNext ? { x: [0, -5, 5, -3, 0] } : {}}
                transition={{ duration: 0.35 }}
                className={cn(
                  "flex h-10 items-center justify-center gap-1 rounded-full transition-all duration-500",
                  canNext ? "px-4" : "w-10",
                )}
                style={canNext ? { backgroundColor: palette.accent, color: palette.cream } : { opacity: 0.45 }}
              >
                {canNext ? (
                  <>
                    <span className="text-sm font-medium">Next</span>
                    <ChevronRight className="size-4" />
                  </>
                ) : (
                  <Lock className="size-4" />
                )}
              </motion.button>
            )}
          </div>
        </nav>

        {/* Music */}
        <button
          type="button"
          onClick={() => {
            if (playing) {
              stopSong();
              setMuted(true);
            } else playSong();
          }}
          aria-label={playing ? "Stop the music" : "Play the music"}
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+20px)] right-4 z-40 grid size-10 place-items-center rounded-full backdrop-blur"
          style={{ backgroundColor: `${palette.cream}cc`, color: palette.ink }}
        >
          {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4 opacity-60" />}
        </button>

        {/* Nudge when trying to skip ahead */}
        <AnimatePresence>
          {nudge > 0 && !done[safeIndex] && !unlocked && (
            <motion.p
              key={nudge}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() => setTimeout(() => setNudge(0), 1600)}
              className="type-label fixed inset-x-0 bottom-24 z-40 text-center"
            >
              Finish this page to unlock the next
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </StoryContext.Provider>
  );
}
