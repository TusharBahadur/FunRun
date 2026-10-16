"use client";

import { AnimatePresence, motion } from "motion/react";
import { Mic, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { EASE_OUT } from "@/lib/motion";
import { Confetti, type ConfettiHandle } from "../confetti";
import { MusicBox } from "../music-box";
import { accentMoodVars } from "./accent-moods";
import { Cake } from "./cake";
import { GiftGate } from "./gift-gate";
import { SongCard, Surprise, Timeline, VoiceNote, WishesWall } from "./party";
import { Finale, Letter, Memories, Numbers, ShortNote } from "./sections";
import { birthdayTiers, type BirthdayFeatures, type BirthdayTierId } from "./tiers";
import type { AccentFont, BirthdayGift, BirthdayPalette } from "./types";
import { useBlowDetector } from "./use-blow-detector";

type Stage = "gate" | "surprise" | "wish" | "celebrate";


/**
 * A birthday gift: (unwrap →) (surprise →) blow out the candles → the gift.
 * The tier decides which of those scenes and sections appear.
 */
export function BirthdayExperience({
  gift,
  palette,
  tier,
  templateSlug,
  hidden,
  accentFont = "classic",
  startAt = "start",
}: {
  gift: BirthdayGift;
  palette: BirthdayPalette;
  tier: BirthdayTierId;
  templateSlug: string;
  /** Sections the sender switched off. Can only remove what the tier includes. */
  hidden?: Partial<Record<keyof BirthdayFeatures, boolean>>;
  accentFont?: AccentFont;
  /** The editor can open the preview straight at the gift, skipping the intro. */
  startAt?: "start" | "gift";
}) {
  const tierFeatures = birthdayTiers[tier].features;
  const f = Object.fromEntries(
    Object.entries(tierFeatures).map(([k, v]) => [k, v && !hidden?.[k as keyof BirthdayFeatures]]),
  ) as BirthdayFeatures;
  const firstStage: Stage = f.unwrap ? "gate" : "wish";
  const [stage, setStage] = useState<Stage>(startAt === "gift" ? "celebrate" : firstStage);
  const [playing, setPlaying] = useState(false);
  const confetti = useRef<ConfettiHandle>(null);
  const music = useRef<MusicBox | null>(null);
  const cakeRef = useRef<HTMLDivElement>(null);
  const colors = [palette.accent, palette.gold, palette.pink, palette.cream, palette.fg];

  const playSong = useCallback(() => {
    music.current ??= new MusicBox();
    music.current.play(() => setPlaying(false));
    setPlaying(true);
  }, []);

  const stopSong = useCallback(() => {
    music.current?.stop();
    setPlaying(false);
  }, []);

  useEffect(() => () => music.current?.stop(), []);

  // Mirrors `stage` so the mic callback never acts on a stale value.
  const stageRef = useRef<Stage>(stage);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  const blowOut = useCallback(() => {
    if (stageRef.current !== "wish") return;
    stageRef.current = "celebrate";
    setStage("celebrate");
    // Without an unwrap tap, blowing out the candles is the first gesture that may start audio.
    if (!f.unwrap) playSong();
    const r = cakeRef.current?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r ? r.top + r.height * 0.2 : window.innerHeight / 2;
    setTimeout(() => {
      confetti.current?.burst(x, y, { count: 180, spread: 1.4 });
      confetti.current?.burst(window.innerWidth * 0.15, window.innerHeight, { count: 70, spread: 0.5 });
      confetti.current?.burst(window.innerWidth * 0.85, window.innerHeight, { count: 70, spread: 0.5 });
    }, 350);
  }, [f.unwrap, playSong]);

  const mic = useBlowDetector(blowOut);

  function replay() {
    mic.stop();
    stopSong();
    window.speechSynthesis?.cancel();
    window.scrollTo({ top: 0 });
    setStage(firstStage);
  }

  return (
    <div
      className="min-h-svh"
      style={
        {
          backgroundColor: palette.bg,
          color: palette.fg,
          ...accentMoodVars(accentFont),
        } as CSSProperties
      }
    >
      <Confetti ref={confetti} colors={colors} />

      {stage !== "gate" && stage !== "surprise" && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={playing ? stopSong : playSong}
          aria-label={playing ? "Stop the song" : "Play the song"}
          className="fixed right-4 top-4 z-50 grid size-12 place-items-center rounded-full backdrop-blur transition-transform active:scale-90"
          style={{ backgroundColor: `${palette.cream}cc`, color: palette.ink }}
        >
          {playing ? <Volume2 className="size-5" /> : <VolumeX className="size-5 opacity-60" />}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {stage === "gate" ? (
          <GiftGate
            key="gate"
            recipient={gift.recipient}
            sender={gift.sender}
            openingLine={gift.copy?.opening || undefined}
            palette={palette}
            onOpen={({ x, y }) => {
              playSong();
              setTimeout(() => confetti.current?.burst(x, y), 300);
              setTimeout(() => setStage(f.surprise ? "surprise" : "wish"), 1300);
            }}
          />
        ) : stage === "surprise" ? (
          <Surprise key="surprise" gift={gift} palette={palette} onDone={() => setStage("wish")} />
        ) : (
          <motion.section
            key="wish"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex min-h-svh flex-col items-center justify-center px-5 pb-12 pt-20 text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: EASE_OUT }}
              className="type-label"
            >
              Today&rsquo;s the day
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: EASE_OUT }}
              className="type-display mt-3 text-[clamp(2.8rem,12vw,6.5rem)]"
            >
              <span className="font-semibold">{gift.copy?.greeting || "Happy birthday,"}</span>
              <br />
              <span className="type-accent" style={{ color: palette.accent }}>
                {gift.recipient}.
              </span>
            </motion.h1>

            <motion.div
              ref={cakeRef}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", bounce: 0.35 }}
              className="mt-8 w-[min(80vw,360px)]"
            >
              <button
                type="button"
                onClick={blowOut}
                disabled={stage !== "wish"}
                aria-label="Blow out the candles"
                className="block w-full cursor-pointer outline-none disabled:cursor-default"
              >
                <Cake age={gift.age} lit={stage === "wish"} palette={palette} />
              </button>
            </motion.div>

            <div className="mt-8 min-h-28">
              <AnimatePresence mode="wait">
                {stage === "wish" ? (
                  <motion.div
                    key="prompt"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <p className="type-copy max-w-xs">
                      Close your eyes, make a wish, then tap the cake to blow out the candles.
                    </p>
                    {!f.micBlow ? null : mic.status === "listening" ? (
                      <span className="type-label flex items-center gap-2" style={{ color: palette.accent }}>
                        <span className="relative flex size-2.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-current" />
                        </span>
                        Listening… blow!
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={mic.start}
                        className="type-label flex items-center gap-2 rounded-full border px-4 py-2 transition-colors hover:bg-white/30"
                        style={{ borderColor: `${palette.fg}30` }}
                      >
                        <Mic className="size-3.5" />
                        {mic.status === "denied" ? "Mic blocked, tap the cake" : "Or blow into your mic"}
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <p className="type-accent text-3xl" style={{ color: palette.accent }}>
                      Wish sent.
                    </p>
                    <p className="type-label opacity-70">Scroll, there&rsquo;s more ↓</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {stage === "celebrate" && (
        <>
          {f.letter ? <Letter gift={gift} palette={palette} /> : <ShortNote gift={gift} palette={palette} />}
          {f.voiceNote && <VoiceNote gift={gift} palette={palette} />}
          {f.ownSong && (
            <SongCard gift={gift} palette={palette} playing={playing} onToggle={playing ? stopSong : playSong} />
          )}
          {f.groupWishes && <WishesWall gift={gift} palette={palette} />}
          {f.photos && <Memories gift={gift} />}
          {f.timeline && <Timeline gift={gift} palette={palette} />}
          {f.numbers && <Numbers gift={gift} palette={palette} />}
          <Finale
            gift={gift}
            palette={palette}
            templateSlug={templateSlug}
            features={f}
            onPlaySong={playSong}
            onReplay={replay}
          />
        </>
      )}
    </div>
  );
}
