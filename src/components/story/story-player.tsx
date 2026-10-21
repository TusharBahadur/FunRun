"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Confetti, type ConfettiHandle } from "@/components/experiences/confetti";
import { EASE_OUT } from "@/lib/motion";
import { accentMoodVars } from "@/components/experiences/birthday/accent-moods";
import { giftFontRoot } from "./gift-fonts";
import { useGiftMusic } from "./gift-music";
import { autoTurn, turnLabel } from "./labels";
import { SceneFontsContext, StoryContext, StudioEditContext, StudioSurface, TurnContext, type StoryApi, type StudioEdit } from "./scene-kit";
import { SCENES } from "./scene-registry";
import { SitePlayer } from "./site-player";
import { ReactionSticker, StickerLayer } from "./stickers";
import { passiveScenes, type Scene, type Story } from "./types";

const initialDone = (scenes: Scene[]) => scenes.map((s) => passiveScenes.includes(s.type));

type PlayerProps = {
  story: Story;
  slug: string;
  /** Studio: open on a given scene (index into the visible scenes). */
  initialIndex?: number;
  /** Studio: every page can be visited without playing the one before. */
  unlocked?: boolean;
  onIndexChange?: (index: number) => void;
  /** Studio: tap copy in the gift to select the matching field. */
  studio?: StudioEdit;
};

/** Plays a gift: page by page (the games), or as one scrolling website. */
export function StoryPlayer(props: PlayerProps) {
  const inner = props.story.format === "site" ? <SitePlayer {...props} /> : <PagesPlayer {...props} />;
  if (!props.studio) return inner;
  return (
    <StudioEditContext.Provider value={props.studio}>
      <StudioSurface>{inner}</StudioSurface>
    </StudioEditContext.Provider>
  );
}

const noop = () => {};

/** One scene per page, each unlocked by finishing the last. */
function PagesPlayer({
  story,
  slug,
  initialIndex = 0,
  unlocked = false,
  onIndexChange,
  studio,
}: PlayerProps) {
  const scenes = useMemo(
    () => story.scenes.filter((s) => !s.hidden && s.type !== "finale"),
    [story.scenes],
  );
  const [index, setIndex] = useState(() => Math.min(initialIndex, Math.max(0, scenes.length - 1)));
  const [done, setDone] = useState<boolean[]>(() => initialDone(scenes));
  const [run, setRun] = useState(0);
  const [nudge, setNudge] = useState(0);
  const [muted, setMuted] = useState(false);
  const confetti = useRef<ConfettiHandle>(null);
  const started = useRef(false);
  const { playing, play, stop } = useGiftMusic(story);

  const playSong = useCallback(() => {
    play({ openLink: true });
    setMuted(false);
  }, [play]);

  const complete = useCallback(
    (i: number) => {
      setDone((d) => (d[i] ? d : d.map((v, j) => v || j === i)));
      // The first finished gesture is the first moment browsers allow sound.
      if (!started.current) {
        started.current = true;
        if (!muted) play();
      }
    },
    [muted, play],
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
  const giftFace = giftFontRoot(story.font);

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

  useEffect(() => {
    if (studio || !scene) return;
    const last = safeIndex >= scenes.length - 1;
    const ready = (!!done[safeIndex] || unlocked) && !last;
    if (!ready || !autoTurn.includes(scene.type)) return;
    const id = window.setTimeout(() => go(safeIndex + 1), 2400);
    return () => window.clearTimeout(id);
  }, [studio, scene, safeIndex, done, unlocked, scenes.length, go]);

  if (!scene) {
    return (
      <div className="grid min-h-svh place-items-center p-8 text-center" style={{ backgroundColor: story.palette.bg, color: story.palette.fg }}>
        <p className="type-label opacity-60">Every page is hidden. Show a page to see it here.</p>
      </div>
    );
  }

  const SceneView = SCENES[scene.type];
  const last = safeIndex === scenes.length - 1;
  const pageDone = studio ? true : !!done[safeIndex];
  const next = !last ? scenes[safeIndex + 1] : undefined;
  const again = last && pageDone && !studio;
  const canTurn = (pageDone || unlocked) && (!last || again);

  return (
    <StoryContext.Provider value={api}>
      <TurnContext.Provider
        value={{
          label: next ? turnLabel(next, api.fill) : again ? "Start again" : null,
          ready: canTurn,
          onContinue: again ? api.restart : () => go(safeIndex + 1),
          again,
        }}
      >
      <div
        data-gift-font={giftFace["data-gift-font"]}
        className="relative isolate min-h-svh overflow-x-hidden transition-colors duration-700"
        style={{ backgroundColor: palette.bg, color: palette.fg, ...accentMoodVars(story.accentFont ?? "classic"), ...giftFace.style }}
      >
        <Confetti ref={confetti} colors={[palette.accent, palette.gold, palette.pink, palette.cream, palette.fg]} />

        <AnimatePresence mode="wait">
          <motion.main
            key={`${run}-${safeIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            data-studio-scene={safeIndex}
            className="relative"
          >
            {scene.type !== "knock" && <StickerLayer stickers={scene.stickers} />}
            {/* The studio shows every page finished, so what you edit is on screen without playing for it. */}
            <SceneFontsContext.Provider value={scene.fonts}>
              <SceneView scene={scene} done={pageDone} onDone={studio ? noop : () => complete(safeIndex)} />
            </SceneFontsContext.Provider>
          </motion.main>
        </AnimatePresence>

        <ReactionSticker key={`${run}-${safeIndex}`} id={scene.reaction} show={pageDone} />

        {!studio && safeIndex > 0 && (
          <button
            type="button"
            onClick={() => go(safeIndex - 1)}
            aria-label="Previous page"
            className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+20px)] left-4 z-40 grid size-10 place-items-center rounded-full backdrop-blur"
            style={{ backgroundColor: `${palette.cream}cc`, color: palette.ink }}
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        {!studio && (
        <button
          type="button"
          onClick={() => {
            if (playing) {
              stop();
              setMuted(true);
            } else playSong();
          }}
          aria-label={playing ? "Stop the music" : "Play the music"}
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+20px)] right-4 z-40 grid size-10 place-items-center rounded-full backdrop-blur"
          style={{ backgroundColor: `${palette.cream}cc`, color: palette.ink }}
        >
          {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4 opacity-60" />}
        </button>
        )}

        <AnimatePresence>
          {nudge > 0 && !pageDone && !unlocked && (
            <motion.p
              key={nudge}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() => setTimeout(() => setNudge(0), 1600)}
              className="type-label fixed inset-x-0 bottom-10 z-40 text-center"
            >
              Finish this page to unlock the next
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      </TurnContext.Provider>
    </StoryContext.Provider>
  );
}
