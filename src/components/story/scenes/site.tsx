"use client";

import { motion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { Accented } from "@/components/experiences/birthday/accented";
import { PhotoFill } from "@/components/experiences/birthday/photo-fill";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { playHtmlAudio, playTrackAudio, trackHref, trackSrc, getTrackPlayable, type Stopper } from "../gift-music";
import { StudioHit, TurnButton, useStudioEdit, useStory, type SceneProps } from "../scene-kit";
import type { Scene, Track } from "../types";

type S<T extends Scene["type"]> = Extract<Scene, { type: T }>;

/*
 * Website sections: one long, scrolling page instead of a game per page.
 * Big serif headlines, soft glass cards, real photos. They also work as
 * single pages inside a normal story.
 */

const rise = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.9, ease: EASE_OUT },
} as const;

/** Section wrapper: label + big serif headline, then the content. */
function Block({ eyebrow, title, children, className }: { eyebrow?: string; title: string; children: ReactNode; className?: string }) {
  const { palette, fill } = useStory();
  return (
    <section className={cn("mx-auto w-full max-w-3xl px-5 pb-32 pt-20 md:py-32", className)}>
      {eyebrow && (
        <StudioHit field="eyebrow" className="w-fit">
          <motion.p {...rise} className="type-label opacity-60">
            {fill(eyebrow)}
          </motion.p>
        </StudioHit>
      )}
      <StudioHit field="title" className="mt-7 w-fit">
        <motion.h2 {...rise} className="type-display text-balance text-[clamp(2rem,6.5vw,3.4rem)] font-semibold">
          <Accented text={fill(title)} color={palette.accent} face="sans" />
        </motion.h2>
      </StudioHit>
      <div className="mt-10 md:mt-14">{children}</div>
    </section>
  );
}

/** A soft frosted card in the gift’s colours. */
function Glass({ children, className }: { children: ReactNode; className?: string }) {
  const { palette } = useStory();
  return (
    <div
      className={cn("rounded-[1.75rem] border shadow-[0_24px_50px_-30px_rgba(27,18,21,0.35)]", className)}
      style={{ backgroundColor: `${palette.cream}b3`, borderColor: `${palette.cream}`, color: palette.ink }}
    >
      {children}
    </div>
  );
}

/* ───────────── Hero: a full-screen photo and the title ───────────── */

export function HeroSection({ scene }: SceneProps<S<"hero">>) {
  const { palette, fill, to } = useStory();
  return (
    <section className="relative h-svh min-h-[560px] w-full overflow-hidden">
      <StudioHit field="photo" className="absolute inset-0 rounded-none">
        <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: EASE_OUT }}>
          <PhotoFill src={scene.photo} tone={scene.tone ?? "rose"} alt={to} className="size-full" iconClassName="size-16" />
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,0) 35%, rgba(0,0,0,.55) 100%)` }} />
      </StudioHit>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white">
        {scene.eyebrow && (
          <StudioHit field="eyebrow" className="w-fit">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.85, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="type-label">
              {fill(scene.eyebrow)}
            </motion.p>
          </StudioHit>
        )}
        <StudioHit field="title" className="w-fit">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 1.1, ease: EASE_OUT }}
          className="type-display mt-7 text-balance text-[clamp(3.2rem,13vw,8rem)] font-semibold drop-shadow-[0_4px_30px_rgba(0,0,0,.35)]"
        >
          <Accented text={fill(scene.title)} color={palette.pink} face="sans" />
        </motion.h1>
        </StudioHit>
      </div>
      {scene.subtitle && (
        <StudioHit field="subtitle">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: EASE_OUT }}
          className="type-display absolute bottom-32 left-5 right-16 text-[clamp(2rem,8vw,4.5rem)] font-semibold text-white md:bottom-24 md:left-10 md:right-10"
        >
          {fill(scene.subtitle)}
        </motion.p>
        </StudioHit>
      )}
    </section>
  );
}

/* ───────────── Countdown to (or since) a date ───────────── */

function parts(target: number, now: number) {
  const diff = Math.abs(target - now);
  return {
    future: target >= now,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

export function CountdownSection({ scene }: SceneProps<S<"countdown">>) {
  const { palette, fill } = useStory();
  const target = new Date(`${scene.date}T00:00:00`).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  const p = now === null ? null : parts(target, now);
  const label = Number.isNaN(target) ? scene.date : new Date(target).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const units = [
    { label: "Days", value: p?.days },
    { label: "Hours", value: p?.hours },
    { label: "Minutes", value: p?.minutes },
    { label: "Seconds", value: p?.seconds },
  ];
  return (
    <section className="mx-auto flex min-h-svh w-full max-w-3xl items-center px-5 pb-32 pt-16">
      <motion.div {...rise}>
        <Glass className="px-6 py-10 text-center md:px-12 md:py-14">
          <StudioHit field="eyebrow" className="mx-auto w-fit">
            <p className="type-label opacity-60">{fill(scene.eyebrow ?? (p?.future === false ? "It’s been" : "Counting down to"))}</p>
          </StudioHit>
          <StudioHit field="date" className="mx-auto mt-7 w-fit">
            <h2 className="type-display text-[clamp(2.4rem,9vw,4.6rem)] font-semibold">{label}</h2>
          </StudioHit>
          <div className="mt-8 grid grid-cols-4 gap-2 md:gap-4">
            {units.map((u) => (
              <div key={u.label} className="rounded-2xl border px-1 py-4 md:py-6" style={{ borderColor: `${palette.ink}14`, backgroundColor: `${palette.cream}cc` }}>
                <span className="type-display block text-[clamp(1.6rem,6vw,2.8rem)] font-semibold tabular-nums">
                  {u.value === undefined ? "–" : String(u.value).padStart(2, "0")}
                </span>
                <span className="type-label mt-2 block text-[9px] opacity-55 md:text-[10px]">{u.label}</span>
              </div>
            ))}
          </div>
          <StudioHit field="title" className="mx-auto mt-8 w-fit">
            <p className="type-display text-xl opacity-80" style={{ color: palette.accent }}>
              <Accented text={fill(scene.title)} color={palette.accent} face="sans" />
            </p>
          </StudioHit>
          {scene.caption && (
            <StudioHit field="caption" className="mx-auto mt-2 w-fit">
              <p className="text-sm opacity-60">{fill(scene.caption)}</p>
            </StudioHit>
          )}
        </Glass>
      </motion.div>
    </section>
  );
}

/* ───────────── Numbered notes: things I’ve noticed ───────────── */

export function NoticedSection({ scene }: SceneProps<S<"noticed">>) {
  const { fill } = useStory();
  return (
    <Block eyebrow={scene.eyebrow} title={scene.title}>
      <div className="space-y-4">
        {scene.items.map((it, i) => (
          <motion.div key={i} {...rise} transition={{ ...rise.transition, delay: i * 0.08 }}>
            <StudioHit field="items" item={i}>
            <Glass className="px-6 py-7 md:px-9 md:py-9">
              <span className="type-display text-3xl font-semibold opacity-25">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="type-display mt-3 text-2xl font-semibold">{fill(it.title)}</h3>
              <p className="mt-2 text-[1.02rem] leading-relaxed opacity-75">{fill(it.text)}</p>
            </Glass>
            </StudioHit>
          </motion.div>
        ))}
      </div>
    </Block>
  );
}

/* ───────────── Gallery: photos that stack as you scroll ───────────── */

export function GallerySection({ scene }: SceneProps<S<"gallery">>) {
  const { fill } = useStory();
  const tilts = [-2.5, 2, -1.5, 3, -3, 1.5];
  return (
    <Block eyebrow={scene.eyebrow} title={scene.title}>
      <div className="relative">
        {scene.photos.map((ph, i) => (
          <div key={i} className="sticky pb-10" style={{ top: `calc(14vh + ${i * 14}px)` }}>
            <StudioHit field="photos" item={i} className="mx-auto max-w-xl">
            <motion.figure
              {...rise}
              className="mx-auto w-full max-w-xl rounded-[1.6rem] bg-white p-3 pb-4 shadow-[0_30px_60px_-30px_rgba(27,18,21,.55)]"
              style={{ rotate: `${tilts[i % tilts.length]}deg` }}
            >
              <PhotoFill src={ph.src} tone={ph.tone} alt={fill(ph.caption)} className="aspect-[4/3.4] w-full rounded-[1.1rem]" iconClassName="size-12" />
              {(ph.caption || ph.date) && (
                <figcaption className="flex items-baseline justify-between gap-3 px-2 pt-3 text-[#2a1a1f]">
                  <span className="type-hand text-xl">{fill(ph.caption)}</span>
                  {ph.date && <span className="type-hand shrink-0 text-sm opacity-55">{ph.date}</span>}
                </figcaption>
              )}
            </motion.figure>
            </StudioHit>
          </div>
        ))}
      </div>
    </Block>
  );
}

/* ───────────── Playlist: songs for this evening ───────────── */

export function PlaylistSection({ scene }: SceneProps<S<"playlist">>) {
  const { palette, fill } = useStory();
  return (
    <Block eyebrow={scene.eyebrow} title={scene.title}>
      <div className="space-y-5">
        {scene.songs.map((song, i) => (
            <motion.div key={i} {...rise}>
              <StudioHit field="songs" item={i}>
              <Glass className="overflow-hidden p-3 md:p-4">
                <div className="relative">
                  <PhotoFill src={song.src} tone={song.tone} alt="" className="aspect-[16/9] w-full rounded-[1.2rem]" iconClassName="size-10" />
                  <span className="type-label absolute left-4 top-4 rounded-full px-3 py-1" style={{ backgroundColor: `${palette.cream}e6`, color: palette.ink }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-4 px-2 pb-2 pt-4">
                  <div className="min-w-0">
                    <h3 className="type-display text-2xl font-semibold">{song.title}</h3>
                    <p className="mt-1 text-sm opacity-65">{fill(song.note)}</p>
                  </div>
                  <SongPlayButton
                    song={song}
                    title={song.title}
                    className="grid size-12 shrink-0 place-items-center rounded-full transition-transform active:scale-95"
                    style={{ backgroundColor: palette.accent, color: palette.cream }}
                  />
                </div>
              </Glass>
              </StudioHit>
            </motion.div>
          ))}
      </div>
    </Block>
  );
}

/* ───────────── The letter, website style ───────────── */

export function SiteLetter({ scene }: SceneProps<S<"letter">>) {
  const { palette, fill, to, from } = useStory();
  return (
    <section className="mx-auto w-full max-w-3xl px-5 pb-32 pt-20 md:py-32">
      <motion.div {...rise}>
        <Glass
          className="relative px-7 py-10 md:px-14 md:py-14"
        >
          <div className="type-label flex justify-between text-[10px] opacity-55">
            <StudioHit as="span" field="eyebrow">{fill(scene.eyebrow ?? "And finally")}</StudioHit>
            <span>For {to} · from {from}</span>
          </div>
          <StudioHit field="title" className="mt-6">
            <h2 className="type-display text-[clamp(2.6rem,9vw,4.4rem)] font-semibold" style={{ color: `${palette.accent}66` }}>
              {fill(scene.title).replace(/\*/g, "")}
            </h2>
          </StudioHit>
          <div className="mt-8 space-y-5 text-[1.05rem] leading-[1.8] opacity-85">
            {scene.paragraphs.map((p, i) => (
              <StudioHit key={i} field="paragraphs" item={i}>
                <p>{fill(p)}</p>
              </StudioHit>
            ))}
          </div>
          <StudioHit field="signoff" className="mt-8">
            <p className="type-hand text-2xl font-bold" style={{ color: palette.accent }}>
              {fill(scene.signoff)}
            </p>
          </StudioHit>
          {scene.photo && (
            <StudioHit field="photo" className="absolute -right-3 -top-6 w-28 rotate-6 md:-right-8 md:w-36">
              <div className="w-full bg-white p-1.5 pb-5 shadow-[0_14px_24px_-14px_rgba(0,0,0,.5)]">
                <PhotoFill src={scene.photo} tone="rose" alt="" className="aspect-square w-full" iconClassName="size-8" />
              </div>
            </StudioHit>
          )}
        </Glass>
      </motion.div>
    </section>
  );
}

/** For the regular page-by-page player: the same section, centred on its own page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SongPlayButton({
  song,
  title,
  className,
  style,
}: {
  song: Track;
  title: string;
  className?: string;
  style?: CSSProperties;
}) {
  const studio = useStudioEdit();
  const playable = getTrackPlayable(song);
  const href = trackHref(song, title) ?? "#";
  const [on, setOn] = useState(false);
  const handle = useRef<Stopper | null>(null);

  useEffect(() => () => handle.current?.stop(), []);

  const icon = on ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />;

  if (studio) {
    return (
      <span className={className} style={style}>
        {icon}
      </span>
    );
  }
  if (playable) {
    return (
      <button
        type="button"
        aria-label={on ? `Pause ${title}` : `Play ${title}`}
        className={className}
        style={style}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          if (on) {
            handle.current?.stop();
            handle.current = null;
            setOn(false);
            return;
          }
          handle.current = playTrackAudio(song, { onEnd: () => setOn(false), onStop: () => setOn(false) });
          setOn(true);
        }}
      >
        {icon}
      </button>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Play ${title}`}
      className={className}
      style={style}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Play className="ml-0.5 size-5 fill-current" />
    </a>
  );
}

export function asPage(Section: ComponentType<SceneProps<any>>, fullBleed = false) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function Page(props: SceneProps<any>) {
    return (
      <div className={cn("relative flex min-h-svh flex-col justify-center", !fullBleed && "pb-28 pt-16")}>
        <Section {...props} />
        <div className={cn("flex justify-center", fullBleed && "absolute inset-x-0 bottom-20 z-10")}>
          <TurnButton className={fullBleed ? "mt-0" : undefined} />
        </div>
      </div>
    );
  }
  return Page;
}
