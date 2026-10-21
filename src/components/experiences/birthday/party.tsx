"use client";

import { motion } from "motion/react";
import { Disc3, Download, Mic, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { PhotoFill } from "./photo-fill";
import type { BirthdayGift, BirthdayPalette } from "./types";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -12% 0px" },
  transition: { duration: 0.9, ease: EASE_OUT },
} as const;

/* ───────────── Surprise: everyone who joined bursts in ───────────── */

export function Surprise({
  gift,
  palette,
  onDone,
}: {
  gift: BirthdayGift;
  palette: BirthdayPalette;
  onDone: () => void;
}) {
  useEffect(() => {
    const id = setTimeout(onDone, 4200);
    return () => clearTimeout(id);
  }, [onDone]);

  const names = [gift.sender, ...gift.wishes.map((w) => w.name)];

  return (
    <motion.section
      className="relative flex min-h-svh cursor-pointer flex-col items-center justify-center overflow-hidden px-6 text-center"
      onClick={onDone}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {names.map((name, i) => {
        const angle = (i / names.length) * Math.PI * 2;
        const radius = 34 + (i % 3) * 7;
        return (
          <motion.span
            key={name}
            className="type-label absolute left-1/2 top-1/2 flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5"
            style={{ backgroundColor: palette.cream, color: palette.ink }}
            initial={{ opacity: 0, scale: 0.3, x: "-50%", y: "-50%" }}
            animate={{
              opacity: 1,
              scale: 1,
              x: `calc(-50% + ${Math.cos(angle) * radius}vmin)`,
              y: `calc(-50% + ${Math.sin(angle) * radius}vmin)`,
            }}
            transition={{ delay: 0.5 + i * 0.12, type: "spring", bounce: 0.5 }}
          >
            <Avatar name={name} palette={palette} />
            {name}
          </motion.span>
        );
      })}

      <motion.p
        className="type-label relative opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.2 }}
      >
        {names.length} people showed up for you
      </motion.p>
      <motion.h1
        className="type-display relative mt-3 text-[clamp(3.6rem,17vw,9rem)] font-semibold"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.55, delay: 0.1 }}
      >
        <span className="type-accent font-normal" style={{ color: palette.accent }}>
          Surprise!
        </span>
      </motion.h1>
    </motion.section>
  );
}

function Avatar({ name, palette }: { name: string; palette: BirthdayPalette }) {
  return (
    <span
      className="grid size-7 place-items-center rounded-full font-sans text-[11px] font-semibold normal-case"
      style={{ backgroundColor: palette.accent, color: palette.cream }}
    >
      {name[0]}
    </span>
  );
}

/* ───────────── Voice note ───────────── */

/**
 * In a real gift this plays the sender's recording. The preview reads the
 * sample message aloud with the browser's built-in speech, so it still
 * feels like a voice note.
 */
export function useSpeaker() {
  const [speaking, setSpeaking] = useState<string | null>(null);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggle(id: string, text: string, pitch = 1) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    if (speaking === id) {
      setSpeaking(null);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98;
    u.pitch = pitch;
    u.onend = () => setSpeaking((s) => (s === id ? null : s));
    setSpeaking(id);
    synth.speak(u);
  }

  return { speaking, toggle };
}

export function VoiceNote({ gift, palette }: { gift: BirthdayGift; palette: BirthdayPalette }) {
  const { speaking, toggle } = useSpeaker();
  const playing = speaking === "note";

  return (
    <section className="px-5 py-20 md:py-28">
      <motion.div
        {...reveal}
        className="mx-auto flex max-w-xl flex-col gap-6 rounded-[2rem] p-7 md:p-9"
        style={{ backgroundColor: palette.cream, color: palette.ink }}
      >
        <p className="type-label opacity-60">
          <Mic className="mr-1.5 inline size-3.5" />A voice note from {gift.sender}
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => toggle("note", gift.voiceNote.transcript)}
            aria-label={playing ? "Pause voice note" : "Play voice note"}
            className="grid size-14 shrink-0 place-items-center rounded-full transition-transform active:scale-90"
            style={{ backgroundColor: palette.accent, color: palette.cream }}
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
          </button>
          <Waveform playing={playing} color={palette.accent} />
          <span className="type-label shrink-0 opacity-60">0:{String(gift.voiceNote.seconds).padStart(2, "0")}</span>
        </div>
        <p className="type-label text-[10px] opacity-45">
          Preview uses a computer voice. Your gift plays {gift.sender}&rsquo;s real recording.
        </p>
      </motion.div>
    </section>
  );
}

const BARS = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.75, 0.45, 0.8, 0.55, 0.95, 0.6, 0.4, 0.7, 0.85, 0.5, 0.65, 0.9, 0.45, 0.7, 0.55, 0.8, 0.4, 0.6];

function Waveform({ playing, color, bars = BARS }: { playing: boolean; color: string; bars?: number[] }) {
  return (
    <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden>
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="w-full max-w-1.5 flex-1 rounded-full"
          style={{ backgroundColor: color, height: `${h * 100}%`, originY: 0.5 }}
          animate={playing ? { scaleY: [1, 0.35, 1.1, 0.6, 1] } : { scaleY: 0.55 }}
          transition={playing ? { duration: 0.9, repeat: Infinity, delay: i * 0.04 } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}

/* ───────────── Their song ───────────── */

export function SongCard({
  gift,
  palette,
  playing,
  onToggle,
}: {
  gift: BirthdayGift;
  palette: BirthdayPalette;
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="px-5 py-12">
      <motion.button
        {...reveal}
        type="button"
        onClick={onToggle}
        className="mx-auto flex w-full max-w-xl items-center gap-5 rounded-[2rem] border p-5 text-left"
        style={{ borderColor: `${palette.fg}25` }}
      >
        <motion.span
          animate={playing ? { rotate: 360 } : { rotate: 0 }}
          transition={playing ? { duration: 3, repeat: Infinity, ease: "linear" } : { duration: 0.6 }}
          className="grid size-16 shrink-0 place-items-center rounded-full"
          style={{ background: `radial-gradient(circle, ${palette.accent} 0 22%, #111 23% 100%)` }}
        >
          <Disc3 className="size-16 text-white/15" strokeWidth={1} />
        </motion.span>
        <span className="flex-1">
          <span className="type-label block opacity-60">{playing ? "Now playing" : "Tap to play"}</span>
          <span className="type-hand block text-2xl">{gift.song.title}</span>
          <span className="type-label block text-[10px] opacity-45">
            {gift.song.artist}. Preview plays the music box.
          </span>
        </span>
      </motion.button>
    </section>
  );
}

/* ───────────── A year in photos ───────────── */

export function Timeline({ gift, palette }: { gift: BirthdayGift; palette: BirthdayPalette }) {
  return (
    <section className="py-20 md:py-28">
      <motion.h2 {...reveal} className="type-display px-5 text-center text-[clamp(2.2rem,7vw,3.6rem)]">
        Your year, <span className="type-accent" style={{ color: palette.accent }}>month by month.</span>
      </motion.h2>
      <div
        data-lenis-prevent
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-[max(1.25rem,calc(50vw-36rem))]"
      >
        {gift.timeline.map((t, i) => {
          return (
            <motion.figure
              key={t.month}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 4) * 0.08, duration: 0.7, ease: EASE_OUT }}
              className="w-[min(58vw,220px)] shrink-0 snap-start"
            >
              <PhotoFill
                src={t.src}
                tone={t.tone}
                alt={t.caption}
                iconClassName="size-12"
                className="aspect-[4/5] w-full rounded-2xl"
              />
              <figcaption className="mt-3">
                <span className="type-label block opacity-50">{t.month}</span>
                <span className="type-hand text-lg">{t.caption}</span>
              </figcaption>
            </motion.figure>
          );
        })}
      </div>
      <p className="type-label mt-4 text-center opacity-50">Scroll sideways · up to 20 photos</p>
    </section>
  );
}

/* ───────────── Wishes wall ───────────── */

export function WishesWall({ gift, palette }: { gift: BirthdayGift; palette: BirthdayPalette }) {
  const { speaking, toggle } = useSpeaker();

  return (
    <section className="px-5 py-20 md:py-28">
      <motion.p {...reveal} className="type-label text-center opacity-60">
        {gift.wishes.length} friends joined in
      </motion.p>
      <motion.h2 {...reveal} className="type-display mx-auto mt-4 max-w-2xl text-center text-[clamp(2.2rem,7vw,3.6rem)]">
        Everyone has <span className="type-accent" style={{ color: palette.accent }}>something to say.</span>
      </motion.h2>

      <div className="mx-auto mt-14 max-w-5xl columns-1 gap-4 sm:columns-2 lg:columns-3">
        {gift.wishes.map((w, i) => {
          const id = `wish-${i}`;
          return (
            <motion.article
              key={w.name}
              initial={{ opacity: 0, y: 30, rotate: i % 2 ? 1.5 : -1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: (i % 3) * 0.08 }}
              className="mb-4 break-inside-avoid rounded-[1.5rem] p-5"
              style={{ backgroundColor: palette.cream, color: palette.ink }}
            >
              {w.kind === "photo" && (
                <PhotoFill
                  src={w.src}
                  tone={w.tone ?? "sun"}
                  alt={`From ${w.name}`}
                  iconClassName="size-9"
                  className="mb-4 aspect-[4/3] w-full rounded-xl"
                />
              )}
              {w.kind === "voice" && (
                <button
                  type="button"
                  onClick={() => toggle(id, `${w.message} Happy birthday, ${gift.recipient}!`, 1.15)}
                  aria-label={`Play ${w.name}'s voice note`}
                  className="mb-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: `${palette.accent}18` }}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: palette.accent, color: palette.cream }}
                  >
                    {speaking === id ? <Pause className="size-3.5 fill-current" /> : <Play className="ml-0.5 size-3.5 fill-current" />}
                  </span>
                  <Waveform playing={speaking === id} color={palette.accent} bars={BARS.slice(0, 16)} />
                </button>
              )}
              <p className="text-[1.02rem] leading-snug">{w.message}</p>
              <p className="type-label mt-4 flex items-center gap-2 opacity-70">
                <Avatar name={w.name} palette={palette} />
                {w.name}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────── Keepsake poster ───────────── */

/** Draws a poster of the day on a canvas and saves it as a PNG. */
export function KeepsakeButton({ gift, palette }: { gift: BirthdayGift; palette: BirthdayPalette }) {
  const [busy, setBusy] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);

  async function download() {
    setBusy(true);
    await document.fonts.ready;
    const css = getComputedStyle(document.documentElement);
    const serif = css.getPropertyValue("--font-fraunces").trim() || "serif";
    const sans = css.getPropertyValue("--font-inter-tight").trim() || "sans-serif";
    const mark = css.getPropertyValue("--font-fraunces").trim() || "serif";

    const W = 1080;
    const H = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.8, 160, 0, W * 0.8, 160, 600);
    glow.addColorStop(0, `${palette.accent}55`);
    glow.addColorStop(1, `${palette.accent}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = palette.fg;
    ctx.textAlign = "left";
    ctx.font = `600 96px ${sans}`;
    ctx.fillText("Happy birthday,", 80, 260);
    ctx.fillStyle = palette.accent;
    ctx.font = `italic 400 150px ${serif}`;
    ctx.fillText(`${gift.recipient}.`, 80, 410);

    ctx.fillStyle = palette.fg;
    ctx.globalAlpha = 0.65;
    ctx.font = `500 30px ${sans}`;
    ctx.fillText(`${gift.age} TODAY · WITH LOVE FROM ${gift.sender.toUpperCase()} & ${gift.wishes.length} FRIENDS`, 80, 490);
    ctx.globalAlpha = 1;

    // A few of the wishes.
    let y = 600;
    for (const w of gift.wishes.slice(0, 6)) {
      ctx.fillStyle = palette.cream;
      roundRect(ctx, 80, y, W - 160, 96, 28);
      ctx.fill();
      ctx.fillStyle = palette.ink;
      ctx.font = `400 30px ${sans}`;
      ctx.fillText(truncate(ctx, `“${w.message}”`, W - 380), 116, y + 58);
      ctx.textAlign = "right";
      ctx.globalAlpha = 0.6;
      ctx.font = `600 26px ${sans}`;
      ctx.fillText(w.name, W - 116, y + 58);
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
      y += 116;
    }

    ctx.fillStyle = palette.fg;
    ctx.font = `italic 900 54px ${mark}`;
    ctx.fillText("TyniTales.", 80, H - 80);

    link.current!.href = canvas.toDataURL("image/png");
    link.current!.download = `${gift.recipient.toLowerCase()}-birthday-${gift.age}.png`;
    link.current!.click();
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="flex h-14 items-center gap-2 rounded-full border px-7 font-medium transition-colors hover:bg-white/10"
        style={{ borderColor: `${palette.bg}40` }}
      >
        <Download className="size-4" />
        {busy ? "Making your poster…" : "Download keepsake"}
      </button>
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- triggered programmatically */}
      <a ref={link} className="hidden" aria-hidden />
    </>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function truncate(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length && ctx.measureText(`${t}…”`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}…”`;
}
