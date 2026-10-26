"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { CalendarHeart, Check, Heart, ImageIcon, Link2, Mic, Music, Send } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SplitText } from "@/components/motion/split-text";
import { Typewriter } from "@/components/motion/typewriter";
import { TemplatePreview } from "@/components/templates/template-preview";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE_OUT } from "@/lib/motion";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function HowItWorks({ previews }: { previews: Template[] }) {
  const steps: Step[] = [
    {
      n: 1,
      time: "About a minute",
      title: "Pick a template",
      body: "Choose one for the occasion. It comes already filled in, so you see exactly what they’ll get.",
      visual: <PickVisual previews={previews} />,
    },
    {
      n: 2,
      time: "A few minutes",
      title: "Add your words & photos",
      body: "Put in their name, write your note, swap in your photos and a song. Preview it any time.",
      visual: <WriteVisual />,
    },
    {
      n: 3,
      time: "Instantly",
      title: "Send the link",
      body: "Share a private link on WhatsApp, or set it to open at midnight on the day.",
      visual: <SendVisual />,
    },
  ];

  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="justify-center">
          How it works
        </Eyebrow>
        <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          <SplitText text="Ready in" /> <SplitText text="five minutes." className="type-accent text-rose" delay={0.15} />
        </h2>
        <p className="type-copy mx-auto mt-5 max-w-md text-muted">No design skills, no app to install. If you can send a text, you can make one.</p>
      </div>

      <ol className="relative mt-12 md:mt-16 grid gap-6 md:grid-cols-3">
        {/* The thread joining the three steps */}
        <span aria-hidden className="absolute left-[16.6%] right-[16.6%] top-[18px] hidden h-px bg-line md:block" />
        {steps.map((step, i) => (
          <motion.li
            key={step.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.12 }}
            className="relative flex flex-col"
          >
            <span className="relative z-10 mx-auto grid size-9 place-items-center rounded-full bg-ink text-sm font-semibold text-paper ring-8 ring-cream">
              {step.n}
            </span>
            <div className="mt-6 flex flex-1 flex-col rounded-[2rem] border border-line bg-paper p-3">
              <div className="relative h-56 overflow-hidden rounded-[1.5rem] bg-cream">{step.visual}</div>
              <div className="p-5 pt-6">
                <p className="type-label text-[10px] text-rose-deep">{step.time}</p>
                <h3 className="type-heading mt-2 text-2xl">{step.title}</h3>
                <p className="type-copy mt-3 text-muted">{step.body}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mt-12 md:mt-16 flex justify-center">
        <ButtonLink href="/templates" variant="rose" size="lg">
          Pick a template
        </ButtonLink>
      </div>
    </section>
  );
}

type Step = { n: number; time: string; title: string; body: string; visual: ReactNode };

function PickVisual({ previews }: { previews: Template[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });

  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center">
      {previews.slice(0, 3).map((t, i) => {
        const offset = i - 1;
        const chosen = i === 1;
        return (
          <motion.div
            key={t.slug}
            className="absolute w-28 sm:w-36"
            style={{ zIndex: chosen ? 2 : 1 }}
            animate={
              inView
                ? { x: offset * 105, rotate: offset * 10, y: chosen ? -14 : 12, scale: chosen ? 1.06 : 0.92 }
                : { x: offset * 24, rotate: offset * 4, y: 0, scale: 0.9 }
            }
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <TemplatePreview template={t} className="rounded-2xl shadow-card" />
            {chosen && (
              <motion.span
                className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-rose-deep text-paper shadow-nav"
                animate={{ scale: inView ? 1 : 0 }}
                transition={{ delay: inView ? 0.45 : 0, type: "spring", stiffness: 300, damping: 15 }}
              >
                <Check className="size-4" strokeWidth={3} />
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function WriteVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-5 shadow-[0_20px_40px_-20px_rgba(27,18,21,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-ink/10" />
            <span className="size-2.5 rounded-full bg-ink/10" />
            <span className="size-2.5 rounded-full bg-ink/10" />
          </div>
          <span className="rounded-full bg-blush px-2.5 py-1 text-xs font-medium text-wine">To: Maya</span>
        </div>
        <p className="mt-5 min-h-[5.5rem] font-serif text-[1.6rem] leading-[1.15]">
          <Typewriter text="Dear Maya, you make ordinary Tuesdays feel like holidays." />
        </p>
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-muted">
          {[ImageIcon, Music, Mic].map((Icon, i) => (
            <span key={i} className="grid size-9 place-items-center rounded-full bg-cream">
              <Icon className="size-4" />
            </span>
          ))}
          <span className="ml-auto text-xs">Autosaved</span>
        </div>
      </div>
    </div>
  );
}

function SendVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setSent((s) => !s), 2200);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div ref={ref} className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-5">
      <motion.div
        className="text-rose"
        animate={
          inView
            ? { x: [-120, 0, 140], y: [30, 0, -40], opacity: [0, 1, 0], rotate: [12, 0, -12] }
            : { opacity: 0 }
        }
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Send className="size-8" />
      </motion.div>

      <div className="flex w-full max-w-sm items-center gap-2 rounded-full bg-paper p-1.5 pl-4 shadow-[0_14px_30px_-16px_rgba(27,18,21,0.35)]">
        <Link2 className="size-4 shrink-0 text-muted" />
        <span className="truncate text-sm">tynitales.gift/for/maya</span>
        <span className="relative ml-auto h-9 w-[6.75rem] shrink-0 overflow-hidden rounded-full text-sm font-medium text-paper">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={sent ? "sent" : "copy"}
              className={cn(
                "absolute inset-0 flex items-center justify-center gap-1.5",
                sent ? "bg-rose" : "bg-ink",
              )}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              {sent ? (
                <>
                  Sent <Heart className="size-3.5 fill-current" />
                </>
              ) : (
                "Copy link"
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-3 py-1.5 text-xs text-muted">
        <CalendarHeart className="size-3.5 text-rose" /> Opens Feb 14 · 9:00 AM
      </span>
    </div>
  );
}
