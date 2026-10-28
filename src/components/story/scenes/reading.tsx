"use client";

import { animate, motion, useInView } from "motion/react";
import { Download, Mic, Pause, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSpeaker } from "@/components/experiences/birthday/party";
import { EASE_OUT } from "@/lib/motion";
import { PhotoFill } from "@/components/experiences/birthday/photo-fill";
import { Paper, SceneShell, StoryButton, StudioAlso, StudioHit, Tape, useStory, useStudioEdit, type SceneProps } from "../scene-kit";
import type { Scene } from "../types";

type S<T extends Scene["type"]> = Extract<Scene, { type: T }>;

/* ───────────── The letter ───────────── */

export function LetterScene({ scene, done }: SceneProps<S<"letter">>) {
  const { palette, fill, to, from } = useStory();
  return (
    <SceneShell layout="stack" eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} done={done}>
      <Paper
        className="relative w-[min(92vw,540px)] rotate-[-0.6deg] px-7 py-8 text-left md:px-10"
        style={{
          // Ruled notebook paper with a margin line.
          backgroundImage: `linear-gradient(90deg, transparent 38px, ${palette.accent}33 38px 40px, transparent 40px), repeating-linear-gradient(transparent 0 33px, ${palette.ink}14 33px 34px)`,
          backgroundPosition: "0 0, 0 22px",
        }}
      >
        {scene.photo && (
          <StudioHit field="photo" className="absolute -right-5 -top-8 z-10 w-28 md:-right-10 md:w-36">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: 14 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
            className="w-full bg-white p-1.5 pb-5 shadow-[0_14px_24px_-14px_rgba(27,18,21,.5)]"
          >
            <Tape className="-top-3 left-1/2 w-14 -translate-x-1/2 rotate-2" />
            <PhotoFill src={scene.photo} tone="rose" alt="" className="aspect-square w-full" iconClassName="size-8" />
          </motion.div>
          </StudioHit>
        )}
        <StudioHit field="meta">
          <p className="type-hand pl-6 text-[1.05rem] leading-[34px] opacity-55">
            {scene.meta !== undefined ? (scene.meta ? fill(scene.meta) : "") : fill(`For ${to} · from ${from}`)}
          </p>
        </StudioHit>
        <StudioHit field="greeting">
          <p className="type-hand pl-6 text-[2rem] font-bold leading-[34px]" style={{ color: palette.accent }}>
            {scene.greeting !== undefined ? (scene.greeting ? fill(scene.greeting) : "") : fill(`Dear ${to},`)}
          </p>
        </StudioHit>
        <div className="type-hand mt-[34px] space-y-[34px] pl-6 text-[1.28rem] leading-[34px]">
          {scene.paragraphs.map((p, i) => (
            <StudioHit key={i} field="paragraphs" item={i}>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.35, duration: 0.7, ease: EASE_OUT }}>
                {fill(p)}
              </motion.p>
            </StudioHit>
          ))}
        </div>
        <StudioHit field="signoff">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + scene.paragraphs.length * 0.35 }}
          className="type-hand mt-[34px] pl-6 text-[1.9rem] font-bold leading-[34px]"
          style={{ color: palette.accent }}
        >
          {fill(scene.signoff)}
        </motion.p>
        </StudioHit>
      </Paper>
    </SceneShell>
  );
}

/* ───────────── By the numbers ───────────── */

export function NumbersScene({ scene, done }: SceneProps<S<"numbers">>) {
  const { fill } = useStory();
  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} done={done}>
      <div className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
        {scene.stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}>
            <StudioHit field="stats" item={i}>
              <Paper className="px-5 py-6">
                <CountUp to={s.value} suffix={s.suffix} />
                <span className="type-label mt-2 block opacity-60">{fill(s.label)}</span>
              </Paper>
            </StudioHit>
          </motion.div>
        ))}
      </div>
    </SceneShell>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const studio = useStudioEdit();
  const [counted, setV] = useState(0);
  // Studio: the real number straight away, so typing a new one doesn't replay the count.
  const v = studio ? to : counted;
  useEffect(() => {
    if (!inView || studio) return;
    const c = animate(0, to, { duration: 1.6, ease: EASE_OUT, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to, studio]);
  return (
    <span ref={ref} className="type-display block text-[clamp(2.4rem,9vw,3.4rem)] font-semibold tabular-nums">
      {v.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ───────────── Friends' wishes ───────────── */

export function WishesScene({ scene, done }: SceneProps<S<"wishes">>) {
  const { palette, fill } = useStory();
  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} done={done}>
      <div className="w-full max-w-3xl columns-1 gap-3 text-left sm:columns-2">
        {scene.wishes.map((w, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, rotate: i % 2 ? 1.5 : -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: EASE_OUT }}
            className="mb-3 break-inside-avoid"
          >
            <StudioHit field="wishes" item={i}>
            <Paper className="p-5">
              <p className="text-[1.02rem] leading-snug">{fill(w.message)}</p>
              <p className="type-label mt-3 flex items-center gap-2 opacity-70">
                <span className="grid size-6 place-items-center rounded-full font-sans text-[10px] font-semibold normal-case" style={{ backgroundColor: palette.accent, color: palette.cream }}>
                  {w.name[0]}
                </span>
                {w.name}
              </p>
            </Paper>
            </StudioHit>
          </motion.div>
        ))}
      </div>
    </SceneShell>
  );
}

/* ───────────── Voice note ───────────── */

const BARS = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.75, 0.45, 0.8, 0.55, 0.95, 0.6, 0.4, 0.7, 0.85, 0.5, 0.65, 0.9, 0.45, 0.7];

export function VoiceScene({ scene, done }: SceneProps<S<"voice">>) {
  const { palette, fill } = useStory();
  const { speaking, toggle } = useSpeaker();
  const playing = speaking === "voice";
  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} done={done}>
      <Paper className="w-[min(92vw,440px)] p-6 text-left">
        <p className="type-label opacity-60">
          <Mic className="mr-1.5 inline size-3.5" />A voice note from {fill("{from}")}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => toggle("voice", fill(scene.transcript))}
            aria-label={playing ? "Pause voice note" : "Play voice note"}
            className="grid size-14 shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: palette.accent, color: palette.cream }}
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
          </button>
          <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden>
            {BARS.map((h, i) => (
              <motion.span
                key={i}
                className="w-full max-w-1.5 flex-1 rounded-full"
                style={{ backgroundColor: palette.accent, height: `${h * 100}%` }}
                animate={playing ? { scaleY: [1, 0.35, 1.1, 0.6, 1] } : { scaleY: 0.55 }}
                transition={playing ? { duration: 0.9, repeat: Infinity, delay: i * 0.04 } : { duration: 0.3 }}
              />
            ))}
          </div>
          <StudioHit as="span" field="seconds" className="shrink-0">
            <span className="type-label opacity-60">0:{String(scene.seconds).padStart(2, "0")}</span>
          </StudioHit>
        </div>
        <p className="type-label mt-4 text-[10px] opacity-45">Preview uses a computer voice. Your gift plays your real recording.</p>
      </Paper>
      <StudioAlso label="What you’ll say" field="transcript">
        <p className="text-[1.05rem] leading-snug opacity-80">{fill(scene.transcript)}</p>
      </StudioAlso>
    </SceneShell>
  );
}

/* ───────────── Finale ───────────── */

export function FinaleScene({ scene, done }: SceneProps<S<"finale">>) {
  const { fill, playSong, restart, slug, to, from } = useStory();
  const [thanked, setThanked] = useState(false);

  return (
    <div className="relative overflow-hidden">
      <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} done={done}>
        <div className="flex flex-col items-center gap-3">
          {!!scene.photos?.length && <Collage photos={scene.photos} />}
          {scene.thankYou && (
            <StudioHit field="thankYou">
              <StoryButton onClick={() => setThanked(true)}>{thanked ? `Sent with love to ${from}` : `Send ${from} a thank-you`}</StoryButton>
            </StudioHit>
          )}
          {thanked && <p className="type-label opacity-60">Preview only. In a real gift this sends {from} your reply.</p>}
          {scene.keepsake && (
            <StudioHit field="keepsake">
              <KeepsakeButton to={to} from={from} title={fill(scene.title)} />
            </StudioHit>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <StoryButton variant="outline" onClick={playSong}>
              Play the song again
            </StoryButton>
            <StoryButton variant="outline" onClick={restart}>
              <RotateCcw className="mr-1.5 inline size-4" />
              From the start
            </StoryButton>
          </div>
          <Link href={`/templates/${slug}`} className="type-label mt-8 opacity-60 hover:opacity-100">
            Made with <span className="type-wordmark text-base normal-case">TyniTales.</span> Make one for someone →
          </Link>
        </div>
      </SceneShell>
    </div>
  );
}

/** A loose row of taped photos that tumble onto the page. */
function Collage({ photos }: { photos: NonNullable<S<"finale">["photos"]> }) {
  const { palette, fill } = useStory();
  const tilts = [-8, 5, -3, 7, -6];
  return (
    <div className="mb-6 flex justify-center pt-3">
      {photos.slice(0, 5).map((ph, i) => (
        <StudioHit key={i} field="photos" item={i} className="relative -mx-2.5 w-[min(26vw,130px)]">
        <motion.figure
          initial={{ opacity: 0, y: -60, rotate: tilts[i] * 3 }}
          animate={{ opacity: 1, y: 0, rotate: tilts[i] }}
          transition={{ delay: 0.3 + i * 0.15, type: "spring", bounce: 0.4 }}
          className="relative w-full bg-white p-1.5 pb-7 shadow-[0_16px_26px_-16px_rgba(27,18,21,.55)]"
          style={{ zIndex: i % 2 ? 2 : 1 }}
        >
          <Tape className="-top-2.5 left-1/2 w-12 -translate-x-1/2" color={[palette.pink, palette.gold][i % 2]} />
          <PhotoFill src={ph.src} tone={ph.tone} alt={fill(ph.caption)} className="aspect-[4/5] w-full" iconClassName="size-7" />
          <figcaption className="type-hand absolute inset-x-1 bottom-1 truncate text-center text-sm" style={{ color: palette.ink }}>
            {fill(ph.caption)}
          </figcaption>
        </motion.figure>
        </StudioHit>
      ))}
    </div>
  );
}

/** Draws a small poster of the gift on a canvas and saves it as a PNG. */
function KeepsakeButton({ to, from, title }: { to: string; from: string; title: string }) {
  const { palette } = useStory();
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await document.fonts.ready;
    const css = getComputedStyle(document.documentElement);
    const sans = css.getPropertyValue("--font-inter-tight").trim() || "sans-serif";
    const mark = css.getPropertyValue("--font-fraunces").trim() || "serif";
    const W = 1080;
    const H = 1350;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.75, 260, 0, W * 0.75, 260, 640);
    glow.addColorStop(0, `${palette.accent}55`);
    glow.addColorStop(1, `${palette.accent}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = palette.fg;
    ctx.font = `600 54px ${sans}`;
    ctx.fillText(`For ${to},`, 90, 300);
    ctx.fillStyle = palette.accent;
    ctx.font = `600 112px ${sans}`;
    wrap(ctx, title.replace(/\*/g, ""), 90, 450, W - 180, 118);
    ctx.fillStyle = palette.fg;
    ctx.globalAlpha = 0.7;
    ctx.font = `500 32px ${sans}`;
    ctx.fillText(`With love, ${from} · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, 90, H - 200);
    ctx.globalAlpha = 1;
    ctx.font = `italic 900 54px ${mark}`;
    ctx.fillText("TyniTales.", 90, H - 100);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `for-${to.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={busy}
      className="flex h-12 items-center gap-2 rounded-full border px-6 text-[15px] font-medium"
      style={{ borderColor: `${palette.fg}40` }}
    >
      <Download className="size-4" />
      {busy ? "Making your poster…" : "Download keepsake"}
    </button>
  );
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > max && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lh;
    } else line = test;
  }
  ctx.fillText(line, x, y);
}

